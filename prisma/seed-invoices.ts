/**
 * seed-invoices.ts
 *
 * Imports historical invoice data from a CSV export into the Wholesail database.
 *
 * Usage:
 *   1. Place your CSV file at: prisma/invoices.csv
 *   2. Run: npx tsx prisma/seed-invoices.ts
 *
 * What it does:
 *   - Deduplicates clients by name (case-insensitive)
 *   - Upserts Organization records (skips existing by name)
 *   - Creates stub Order + Invoice per row (skips duplicate invoice numbers)
 *   - Auto-assigns tier: VIP ($50k+), REPEAT ($5k–$50k), NEW (under $5k)
 *   - Flags clients with no email in org.notes
 *   - Outputs a full summary at the end
 *
 * CSV columns expected:
 *   ClientEmail, ClientName, ClientAddress, ClientPhone,
 *   DiscountType, DiscountValue, DiscountAmount,
 *   TaxType, TaxPercentValue, TaxAmount,
 *   Date, CreatedTime, DueDays, Notes, Number,
 *   PaymentDetails, ReceivedPayments, SubtotalAmount,
 *   TotalAmount, TotalDue, Status, CurrencyCode
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { PrismaClient, OrgTier } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

// Load env vars — same pattern as seed.ts
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

// ─── DB init (Prisma v7 requires Neon adapter) ─────────────────────────────
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ─── CSV parser — full character-stream, handles multi-line quoted fields ────
// Walks the raw content char-by-char so embedded newlines inside quoted fields
// (e.g. multi-line notes) are treated as part of the field, not row separators.
// Also handles comma-formatted numbers like "1,005.50" and escaped quotes ("").
function parseCSV(content: string): Record<string, string>[] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let inQuotes = false

  // Strip BOM if present
  let start = 0
  if (content.charCodeAt(0) === 0xfeff) start = 1

  for (let i = start; i < content.length; i++) {
    const ch = content[i]
    const next = content[i + 1]

    if (ch === '"') {
      if (inQuotes && next === '"') {
        // Escaped quote — add literal " and skip next char
        currentField += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      currentRow.push(currentField.trim())
      currentField = ''
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      // End of row — skip \r\n pair
      if (ch === '\r' && next === '\n') i++
      if (currentField.trim() || currentRow.length > 0) {
        currentRow.push(currentField.trim())
        rows.push(currentRow)
      }
      currentRow = []
      currentField = ''
    } else {
      // For newlines inside quoted fields, normalise to space
      if ((ch === '\n' || ch === '\r') && inQuotes) {
        currentField += ' '
        if (ch === '\r' && next === '\n') i++
      } else {
        currentField += ch
      }
    }
  }

  // Flush last row
  if (currentField.trim() || currentRow.length > 0) {
    currentRow.push(currentField.trim())
    rows.push(currentRow)
  }

  if (rows.length < 2) throw new Error('CSV has no data rows')

  const headers = rows[0]
  return rows
    .slice(1)
    .map(values => {
      const row: Record<string, string> = {}
      headers.forEach((h, i) => {
        row[h] = values[i] ?? ''
      })
      return row
    })
    .filter(row => row['ClientName']?.trim()) // skip blank/continuation rows
}

// ─── Address parser (best-effort US address) ────────────────────────────────
function parseAddress(raw: string): { street: string; city: string; state: string; zip: string } {
  if (!raw?.trim()) {
    return { street: 'Address on file', city: 'Los Angeles', state: 'CA', zip: '00000' }
  }

  // Try: "123 Main St, Los Angeles, CA 90001"
  const zipMatch = raw.match(/\b(\d{5})(?:-\d{4})?\s*$/)
  const stateMatch = raw.match(/\b([A-Z]{2})\s+\d{5}/)

  if (zipMatch && stateMatch) {
    const zip = zipMatch[1]
    const state = stateMatch[1]
    // Everything before the state+zip is street/city
    const beforeStateZip = raw.slice(0, stateMatch.index ?? 0).trim().replace(/,\s*$/, '')
    const parts = beforeStateZip.split(',').map(p => p.trim()).filter(Boolean)
    const city = parts.length > 1 ? parts[parts.length - 1] : 'Los Angeles'
    const street = parts.slice(0, -1).join(', ') || beforeStateZip || raw
    return { street, city, state, zip }
  }

  // Fallback — put everything in street
  return { street: raw.trim(), city: 'Los Angeles', state: 'CA', zip: '00000' }
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function parseAmount(val: string): number {
  const cleaned = val.replace(/[^0-9.-]/g, '')
  return parseFloat(cleaned) || 0
}

function parseDate(dateStr: string): Date {
  if (!dateStr?.trim()) return new Date()
  const d = new Date(dateStr.trim())
  return isNaN(d.getTime()) ? new Date() : d
}

function assignTier(totalSpend: number): OrgTier {
  if (totalSpend >= 50_000) return 'VIP'
  if (totalSpend >= 5_000) return 'REPEAT'
  return 'NEW'
}

function inferPaymentMethod(status: string, paymentDetails: string): string {
  const s = (status + ' ' + paymentDetails).toLowerCase()
  if (s.includes('card')) return 'CARD'
  if (s.includes('ach') || s.includes('bank')) return 'ACH'
  if (s.includes('wire')) return 'WIRE'
  if (s.includes('check')) return 'CHECK'
  return 'CARD'
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const csvPath = path.resolve(__dirname, 'invoices.csv')

  if (!fs.existsSync(csvPath)) {
    console.error(`\n❌  CSV not found at: ${csvPath}`)
    console.error('   Place your CSV file at prisma/invoices.csv and re-run.\n')
    process.exit(1)
  }

  console.log('\n🚀  Wholesail Invoice Import\n')
  console.log(`📂  Reading: ${csvPath}`)

  const content = fs.readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(content)
  console.log(`📊  Found ${rows.length} invoice rows\n`)

  // ── Find system user (required for Order.userId) ──────────────────────────
  const systemUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true, name: true },
  })

  if (!systemUser) {
    console.error('❌  No ADMIN user found in DB. Create an admin account first, then re-run.')
    process.exit(1)
  }
  console.log(`👤  Using system user: ${systemUser.name} (${systemUser.id})\n`)

  // ── Aggregate per-client totals for tier assignment ───────────────────────
  const clientTotals: Record<string, number> = {}
  for (const row of rows) {
    const key = normalizeName(row['ClientName'])
    clientTotals[key] = (clientTotals[key] ?? 0) + parseAmount(row['TotalAmount'])
  }

  // ── Build deduplicated client map ─────────────────────────────────────────
  const clientMap: Record<string, { name: string; email: string; phone: string; address: string; missingEmail: boolean }> = {}

  for (const row of rows) {
    const key = normalizeName(row['ClientName'])
    if (clientMap[key]) {
      // Enrich with email/phone if this row has them
      if (row['ClientEmail']?.trim() && clientMap[key].missingEmail) {
        clientMap[key].email = row['ClientEmail'].trim()
        clientMap[key].missingEmail = false
      }
      if (row['ClientPhone']?.trim() && !clientMap[key].phone) {
        clientMap[key].phone = row['ClientPhone'].trim()
      }
      continue
    }

    const hasEmail = !!row['ClientEmail']?.trim()
    clientMap[key] = {
      name: row['ClientName'].trim(),
      email: hasEmail ? row['ClientEmail'].trim() : `noemail+${slugify(row['ClientName'].trim())}@wholesail-import.local`,
      phone: row['ClientPhone']?.trim() || '000-000-0000',
      address: row['ClientAddress']?.trim() || '',
      missingEmail: !hasEmail,
    }
  }

  const uniqueClients = Object.values(clientMap)
  console.log(`👥  Unique clients: ${uniqueClients.length}`)
  console.log(`📧  Missing email: ${uniqueClients.filter(c => c.missingEmail).length}`)
  console.log(`📧  Has email: ${uniqueClients.filter(c => !c.missingEmail).length}\n`)

  // ── Upsert organizations ───────────────────────────────────────────────────
  const orgIdByKey: Record<string, string> = {}
  let orgsCreated = 0
  let orgsSkipped = 0

  console.log('🏢  Upserting organizations...')

  for (const client of uniqueClients) {
    const key = normalizeName(client.name)
    const totalSpend = clientTotals[key] ?? 0
    const tier = assignTier(totalSpend)

    const existing = await prisma.organization.findFirst({
      where: { name: { equals: client.name, mode: 'insensitive' } },
      select: { id: true },
    })

    if (existing) {
      orgIdByKey[key] = existing.id
      orgsSkipped++
      continue
    }

    const addr = parseAddress(client.address)
    const org = await prisma.organization.create({
      data: {
        name: client.name,
        contactPerson: client.name, // Use org name as contact — update manually later
        email: client.email,
        phone: client.phone,
        tier,
        isWholesaler: true,
        paymentTerms: 'Net-30',
        notes: client.missingEmail
          ? 'MISSING_EMAIL — imported from historical invoice data. Please update email on first contact.'
          : `Imported from historical invoice data. Total 2025 spend: $${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        addresses: {
          create: {
            type: 'SHIPPING',
            street: addr.street,
            city: addr.city,
            state: addr.state,
            zip: addr.zip,
            isDefault: true,
          },
        },
      },
    })

    orgIdByKey[key] = org.id
    orgsCreated++
  }

  console.log(`   ✅  Created: ${orgsCreated}`)
  console.log(`   ⏭   Skipped (already exists): ${orgsSkipped}\n`)

  // ── Get existing invoice numbers to skip duplicates ───────────────────────
  const existingInvoiceNumbers = new Set(
    (await prisma.invoice.findMany({ select: { invoiceNumber: true } })).map(i => i.invoiceNumber)
  )
  const existingOrderNumbers = new Set(
    (await prisma.order.findMany({ select: { orderNumber: true } })).map(o => o.orderNumber)
  )

  // ── Insert orders + invoices ───────────────────────────────────────────────
  let invoicesCreated = 0
  let invoicesSkipped = 0
  const errors: string[] = []

  console.log('🧾  Inserting orders + invoices...')

  for (const row of rows) {
    const rawNumber = row['Number']?.trim()
    if (!rawNumber) {
      errors.push(`Row with client "${row['ClientName']}" has no invoice number — skipped`)
      continue
    }

    const invoiceNumber = rawNumber.startsWith('INV-') ? rawNumber : `INV-${rawNumber}`
    const orderNumber = `ORD-HIST-${rawNumber}`

    // Skip if already imported
    if (existingInvoiceNumbers.has(invoiceNumber) || existingOrderNumbers.has(orderNumber)) {
      invoicesSkipped++
      continue
    }

    const key = normalizeName(row['ClientName'])
    const orgId = orgIdByKey[key]

    if (!orgId) {
      errors.push(`No org found for client "${row['ClientName']}" — skipped invoice ${invoiceNumber}`)
      continue
    }

    const invoiceDate = parseDate(row['Date'])
    const dueDays = parseInt(row['DueDays'] || '30', 10)
    const dueDate = new Date(invoiceDate.getTime() + dueDays * 24 * 60 * 60 * 1000)
    const subtotal = parseAmount(row['SubtotalAmount'])
    const tax = parseAmount(row['TaxAmount'])
    const total = parseAmount(row['TotalAmount'])
    const discount = parseAmount(row['DiscountAmount'])
    const notes = row['Notes']?.trim() || null
    const paymentMethod = inferPaymentMethod(row['Status'] ?? '', row['PaymentDetails'] ?? '')

    try {
      // Sequential creates — invoice and payment reference the order by ID
      const order = await prisma.order.create({
        data: {
          orderNumber,
          organizationId: orgId,
          userId: systemUser.id,
          status: 'DELIVERED',
          subtotal,
          tax,
          deliveryFee: 0,
          total,
          notes: [
            notes,
            discount > 0 ? `Discount applied: $${discount.toFixed(2)} (${row['DiscountType'] || 'discount'})` : null,
            `Imported from historical invoice data. Original invoice #: ${rawNumber}`,
          ]
            .filter(Boolean)
            .join('\n') || null,
          paidAt: invoiceDate,
          createdAt: invoiceDate,
          updatedAt: invoiceDate,
        },
      })

      await prisma.invoice.create({
        data: {
          invoiceNumber,
          organizationId: orgId,
          orderId: order.id,
          dueDate,
          status: 'PAID',
          subtotal,
          tax,
          total,
          paidAt: invoiceDate,
          createdAt: invoiceDate,
        },
      })

      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: total,
          method: paymentMethod as never,
          status: 'COMPLETED',
          createdAt: invoiceDate,
        },
      })

      invoicesCreated++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`Invoice ${invoiceNumber} (${row['ClientName']}): ${msg}`)
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const totalRevenue = rows.reduce((sum, r) => sum + parseAmount(r['TotalAmount']), 0)

  console.log(`\n${'─'.repeat(60)}`)
  console.log('✅  IMPORT COMPLETE\n')
  console.log(`   Organizations created:  ${orgsCreated}`)
  console.log(`   Organizations skipped:  ${orgsSkipped} (already existed)`)
  console.log(`   Invoices created:       ${invoicesCreated}`)
  console.log(`   Invoices skipped:       ${invoicesSkipped} (duplicate numbers)`)
  console.log(`   Total revenue imported: $${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
  console.log(`   Errors:                 ${errors.length}`)

  if (errors.length > 0) {
    console.log('\n⚠️   ERRORS:')
    errors.forEach(e => console.log(`   - ${e}`))
  }

  console.log('\n📋  NEXT STEPS:')
  console.log('   1. Review orgs with MISSING_EMAIL note in /admin/clients')
  console.log('   2. Build a "claim your account" flow so historical clients can log in')
  console.log('   3. Set contactPerson for each org (currently defaults to org name)')
  console.log(`${'─'.repeat(60)}\n`)

  // Write missing-email report to file
  const missingEmailClients = uniqueClients.filter(c => c.missingEmail)
  if (missingEmailClients.length > 0) {
    const reportPath = path.resolve(__dirname, 'import-missing-emails.txt')
    const report = missingEmailClients
      .map(c => `${c.name}\t${c.phone}\t${c.address}`)
      .join('\n')
    fs.writeFileSync(reportPath, `Client Name\tPhone\tAddress\n${report}`, 'utf-8')
    console.log(`📄  Missing-email report saved to: prisma/import-missing-emails.txt\n`)
  }
}

main()
  .catch(err => {
    console.error('\n❌  Fatal error:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
