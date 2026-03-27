// ---------------------------------------------------------------------------
// AI Tool definitions for the admin chat feature.
// Split into category modules under lib/ai/tools/ — this file re-exports
// so existing imports (`from '@/lib/ai/ai-tools'`) continue to work.
// ---------------------------------------------------------------------------

import type { Tool } from '@anthropic-ai/sdk/resources/messages'
import {
  orderExecutors,
  orderToolDefinitions,
  clientExecutors,
  clientToolDefinitions,
  productExecutors,
  productToolDefinitions,
  analyticsExecutors,
  analyticsToolDefinitions,
} from './tools'

// ---------------------------------------------------------------------------
// Merged executor map — keyed by tool name
// ---------------------------------------------------------------------------
type ToolInput = Record<string, unknown>
type ToolContext = { userId: string }

export const toolExecutors: Record<string, (input: ToolInput, ctx: ToolContext) => Promise<unknown>> = {
  ...orderExecutors,
  ...clientExecutors,
  ...productExecutors,
  ...analyticsExecutors,
}

// ---------------------------------------------------------------------------
// Merged Anthropic tool definitions array
// ---------------------------------------------------------------------------
export const anthropicTools: Tool[] = [
  ...orderToolDefinitions,
  ...clientToolDefinitions,
  ...productToolDefinitions,
  ...analyticsToolDefinitions,
]
