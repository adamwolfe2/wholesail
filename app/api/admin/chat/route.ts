import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import Anthropic from '@anthropic-ai/sdk'
import { anthropicTools, toolExecutors } from '@/lib/ai/ai-tools'
import { PLATFORM_KNOWLEDGE } from '@/lib/ai/platform-knowledge'
import { prisma } from '@/lib/db'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ---------------------------------------------------------------------------
// Rate limit: 20 req/min per user
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, number[]>()

function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const timestamps = (rateLimitMap.get(userId) ?? []).filter(ts => now - ts < 60_000)
  if (timestamps.length >= 20) return true
  timestamps.push(now)
  rateLimitMap.set(userId, timestamps)
  return false
}

// ---------------------------------------------------------------------------
// Tool → friendly label for the streaming UI
// ---------------------------------------------------------------------------
const TOOL_LABELS: Record<string, string> = {
  get_platform_summary: 'Loading platform overview',
  search_clients: 'Searching clients',
  get_client_detail: 'Looking up client',
  get_recent_orders: 'Loading recent orders',
  get_order_detail: 'Looking up order',
  get_revenue_report: 'Running revenue report',
  get_outstanding_invoices: 'Checking outstanding invoices',
  get_products: 'Loading products',
  get_low_stock_alerts: 'Checking stock levels',
  get_wholesale_applications: 'Loading applications',
  navigate_to: 'Finding page',
  get_distributors: 'Loading distributors',
  get_action_items: 'Checking action items',
  search_orders: 'Searching orders',
  get_lapsed_clients: 'Finding lapsed clients',
  get_top_products: 'Finding top products',
  get_order_trends: 'Analyzing order trends',
  get_client_lifetime_value: 'Calculating client value',
  admin_confirm_order: 'Confirming order',
  update_order_status: 'Updating order status',
  update_client_tier: 'Updating client tier',
  update_client: 'Updating client details',
  add_client_note: 'Adding client note',
  add_order_note: 'Adding order note',
  review_wholesale_application: 'Processing application',
  update_product: 'Updating product',
  assign_distributor_to_product: 'Assigning distributor',
  generate_invoice: 'Generating invoice',
  send_invoice_reminder: 'Sending payment reminder',
  create_task: 'Creating follow-up task',
}

// ---------------------------------------------------------------------------
// POST /api/admin/chat
// Returns a Server-Sent Events stream. Events:
//   { type: 'tool_start', id, tool, label }
//   { type: 'tool_done',  id, tool }
//   { type: 'text',       text }
//   { type: 'error',      message }
//   { type: 'done' }
// Non-streaming errors (auth, rate limit, bad body) still return JSON.
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'AI service not configured. Add ANTHROPIC_API_KEY to your environment variables.' },
      { status: 503 }
    )
  }

  const { userId, error } = await requireAdmin()
  if (error) return error

  if (isRateLimited(userId)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 })
  }

  let body: { messages: { role: string; content: string }[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { messages } = body
  if (!messages?.length) {
    return NextResponse.json({ error: 'No messages provided.' }, { status: 400 })
  }

  // Fetch admin name
  let adminName = 'Admin'
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } })
    if (user?.name) adminName = user.name
  } catch { /* use default */ }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  // ---------------------------------------------------------------------------
  // TEMPLATE NOTE: Customize the identity line and PLATFORM_KNOWLEDGE for
  // each deployment. All logic below is generic and reusable.
  // ---------------------------------------------------------------------------
  const systemPrompt = `You are the AI operations assistant for this B2B wholesale distribution platform. You are speaking with ${adminName}.

Today is ${today}.

## Your Role
You are both a platform expert AND a hands-on operator. You can:
- Answer any question about clients, orders, invoices, products, or revenue using live data
- **Take real actions**: confirm orders, update statuses, approve applications, change tiers, assign distributors, generate invoices, create tasks, send reminders, and more
- Proactively surface what needs attention (use get_action_items)
- Guide ${adminName} to the right page for any task using markdown links
- Explain any platform feature — proactively mention things ${adminName} may not know exist

## Platform Roles
- **Partners** = approved B2B buyer organizations with portal access at /client-portal
- **Distributors** = fulfillment partners (isDistributor=true), each assigned to specific products, manage their items at /client-portal/fulfillment
- **Admin** = ${adminName} and ops team, full access at /admin

## Distributor Workflow
Products are assigned to distributors at /admin/products/[id]. When a partner places an order, each line item is auto-routed to its product's distributor. The distributor receives an email with only their items and sees them as a task list.

## What You Can DO (not just look up)

| Category | Tools Available |
|---|---|
| Orders | confirm step 1 (single/bulk), update status (PENDING→SHIPPED etc), add internal notes |
| Clients | change tier, update payment terms/credit limit, add notes |
| Applications | approve/reject/waitlist (sends email + portal invite automatically) |
| Products | toggle availability, update price, assign distributor |
| Invoices | generate + email invoice, send payment reminders |
| Tasks | create follow-up tasks linked to clients |

## ⚠️ CONFIRMATION REQUIRED — Always Preview Before Acting

Before taking ANY write action, you must:

**Step 1 — Look it up.** NEVER guess an ID. Use search_clients, search_orders, or get_order_detail to find the exact record first.

**Step 2 — Show a preview.** Tell ${adminName} EXACTLY what will change:
- "I'll update **[Name]** from **[current value]** → **[new value]**"
- "I'll confirm **[N] orders**: [list them by order number]"
- "I'll send an invoice reminder to **[Client]** for **$XXX** (invoice INV-XXXX)"

**Step 3 — Ask once.** End every preview with: **"Shall I proceed?"**

**Step 4 — Wait.** Only execute after ${adminName} replies "yes", "go ahead", "do it", "proceed", "confirm", or similar.

**Exception:** If ${adminName} already said "yes" or "go ahead" as part of this same message AND the intent is completely unambiguous, proceed and skip the confirmation. Example: "Yes, confirm all orders waiting on step 1" → just do it.

For bulk actions: always list the affected records (up to 5, then "and X more") before asking.

## Natural Language → Intent Mapping
${adminName} will speak naturally, not in commands. Recognize these patterns:

**Lookups:**
- "how are we doing" / "what's our revenue" / "the numbers" → get_order_trends or get_revenue_report
- "who owes me" / "unpaid" / "collections" / "what's outstanding" → get_outstanding_invoices
- "what's going on" / "anything urgent" / "what needs attention" → get_action_items
- "tell me about [name]" / "[client]'s account" / "[business] history" → search_clients → get_client_detail
- "the [client] order" / "their last order" / "find the [name] order" → search_clients → search_orders
- "what's selling" / "top products" / "bestsellers" → get_top_products
- "who hasn't ordered" / "lapsed" / "falling off" / "who should I follow up with" → get_lapsed_clients
- "compare this month" / "how are we trending" / "better or worse" → get_order_trends
- "what's [client] worth" / "their lifetime value" / "good customer?" → get_client_lifetime_value
- "what's low" / "running out" / "stock check" → get_low_stock_alerts

**Actions (preview first, then confirm):**
- "confirm it" / "step 1" / "acknowledge that order" → admin_confirm_order
- "mark it shipped" / "update to shipped" / "ship that" → update_order_status
- "bump them up" / "upgrade to VIP" / "move to repeat" → update_client_tier
- "note this down" / "add a note" / "log that" → add_client_note or add_order_note
- "approve them" / "let them in" / "accept the application" → review_wholesale_application
- "chase that invoice" / "send a reminder" / "follow up on payment" → send_invoice_reminder
- "remind me to" / "create a task" / "follow up with [client] on [date]" → create_task
- "invoice that order" / "generate invoice" / "send them an invoice" → generate_invoice

**Ambiguous requests:** If unclear WHICH record (e.g., "confirm that order" with no prior context), ask "Which order?" before proceeding.

## Data Rules
1. ALWAYS call a read tool before answering any data question — never fabricate numbers
2. Use markdown links for every client/order/page reference: [text](/admin/path)
3. Format period comparisons as markdown tables
4. For "what needs attention" / "what should I do today" → call get_action_items first
5. If you need an orgId to act on a client, use search_clients first to find them

## Platform Knowledge
${PLATFORM_KNOWLEDGE}`

  // Build Anthropic message history
  const conversationMessages: Anthropic.MessageParam[] = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  // Stream SSE events to the client
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        } catch { /* controller already closed */ }
      }

      try {
        let finalText = ''

        // Tool-use loop (max 5 rounds)
        for (let step = 0; step < 5; step++) {
          const response = await anthropic.messages.create({
            model: process.env.AI_CHAT_MODEL ?? 'claude-haiku-4-5-20251001',
            max_tokens: 4096,
            system: systemPrompt,
            tools: anthropicTools,
            messages: conversationMessages,
          })

          if (response.stop_reason === 'end_turn') {
            finalText = response.content
              .filter((b): b is Anthropic.TextBlock => b.type === 'text')
              .map(b => b.text)
              .join('')
            break
          }

          if (response.stop_reason === 'tool_use') {
            conversationMessages.push({ role: 'assistant', content: response.content })

            const toolCalls = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')

            // Announce all tools starting (before parallel execution)
            for (const tc of toolCalls) {
              send({ type: 'tool_start', id: tc.id, tool: tc.name, label: TOOL_LABELS[tc.name] ?? tc.name })
            }

            // Execute all tool calls in parallel
            const toolResultContents: Anthropic.ToolResultBlockParam[] = []

            await Promise.all(
              toolCalls.map(async (toolCall) => {
                const executor = toolExecutors[toolCall.name]
                let result: unknown

                try {
                  result = executor
                    ? await executor(toolCall.input as Record<string, unknown>, { userId })
                    : { error: `Unknown tool: ${toolCall.name}` }
                } catch (err) {
                  result = { error: `Tool failed: ${err instanceof Error ? err.message : 'Unknown error'}` }
                }

                send({ type: 'tool_done', id: toolCall.id, tool: toolCall.name })

                toolResultContents.push({
                  type: 'tool_result',
                  tool_use_id: toolCall.id,
                  content: JSON.stringify(result, null, 2),
                })
              })
            )

            conversationMessages.push({ role: 'user', content: toolResultContents })
            continue
          }

          // Any other stop reason — extract whatever text we have
          finalText = response.content
            .filter((b): b is Anthropic.TextBlock => b.type === 'text')
            .map(b => b.text)
            .join('')
          break
        }

        if (!finalText) {
          finalText = "I wasn't able to generate a response. Please try again."
        }

        send({ type: 'text', text: finalText })
      } catch (err) {
        send({ type: 'error', message: err instanceof Error ? err.message : 'Something went wrong. Please try again.' })
      } finally {
        send({ type: 'done' })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
