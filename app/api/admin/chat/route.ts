import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import Anthropic from '@anthropic-ai/sdk'
import { anthropicTools, toolExecutors } from '@/lib/ai/ai-tools'
import { PLATFORM_KNOWLEDGE } from '@/lib/ai/platform-knowledge'
import { prisma } from '@/lib/db'
import { aiCallLimiter, checkRateLimit } from '@/lib/rate-limit'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MAX_MESSAGE_BYTES = 10 * 1024   // 10KB per message
const MAX_TOTAL_BYTES   = 100 * 1024  // 100KB total conversation

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

  const rl = await checkRateLimit(aiCallLimiter, userId)
  if (!rl.allowed) {
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

  // Size caps: reject oversized payloads to prevent token bombing
  for (const msg of messages) {
    if (typeof msg.content === 'string' && msg.content.length > MAX_MESSAGE_BYTES) {
      return NextResponse.json({ error: 'Message too large (max 10KB per message).' }, { status: 400 })
    }
  }
  const totalSize = messages.reduce((acc, m) => acc + (typeof m.content === 'string' ? m.content.length : 0), 0)
  if (totalSize > MAX_TOTAL_BYTES) {
    return NextResponse.json({ error: 'Conversation too large (max 100KB total).' }, { status: 400 })
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
  const systemPrompt = `You are the AI operations assistant for this B2B wholesale distribution platform. Speaking with ${adminName}. Today: ${today}.

## Roles
- Partners = approved B2B buyers at /client-portal
- Distributors = fulfillment orgs (isDistributor=true), manage items at /client-portal/fulfillment
- Admin = ${adminName}, full access at /admin

## ⚠️ Write Actions: Always Preview First
1. **Look up** the record first — NEVER guess an ID. Use search tools.
2. **Show exactly what will change** — "I'll update [Name] from [X] → [Y]"
3. **Ask once** — end preview with "Shall I proceed?"
4. **Wait** — only act after ${adminName} confirms ("yes", "go ahead", "do it", etc.)

**Exception:** If ${adminName} already confirmed in the same message and intent is unambiguous, proceed directly.

For bulk actions: list affected records (up to 5, then "and X more") before asking.

## Data Rules
1. ALWAYS call a read tool before answering data questions — never fabricate numbers
2. Use markdown links: [text](/admin/path)
3. "what needs attention" / "what should I do" → call get_action_items first
4. To act on a client by name, use search_clients to find their orgId first

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
            max_tokens: 2048,
            system: [
              {
                type: 'text' as const,
                text: systemPrompt,
                cache_control: { type: 'ephemeral' as const },
              },
            ],
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

            // Cap tool calls to 5 per round to bound execution cost
          const toolCalls = response.content
            .filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
            .slice(0, 5)

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
