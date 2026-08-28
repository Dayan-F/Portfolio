import type { Usage } from '@/demos/agents/types'

/**
 * A provider-neutral chat surface. The graph and the tool loop are written
 * against this, so adding a provider means writing one adapter rather than
 * touching any of the agent logic.
 */

export type Provider = 'anthropic' | 'groq'

export type JsonSchema = {
  type: 'object'
  properties: Record<string, unknown>
  required?: string[]
  additionalProperties?: boolean
}

export type ToolDef = {
  name: string
  description: string
  parameters: JsonSchema
}

export type ToolCall = {
  id: string
  name: string
  input: Record<string, unknown>
}

/**
 * `raw` carries the provider's own representation of an assistant turn.
 * Anthropic needs its content blocks (thinking blocks included) echoed back
 * unchanged, so normalising them away would break the next request.
 */
export type ChatMessage =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; toolCalls: ToolCall[]; raw?: unknown }
  | { role: 'tool'; callId: string; name: string; content: string; isError?: boolean }

export type StreamHandlers = {
  onText: (delta: string) => void
  onThinking: (delta: string) => void
  /** Out-of-band progress, such as waiting out a rate limit. */
  onNotice?: (text: string) => void
}

export type TurnRequest = {
  system: string
  messages: ChatMessage[]
  tools: ToolDef[]
  maxTokens: number
  showThinking: boolean
  signal: AbortSignal
  handlers: StreamHandlers
}

export type Turn = {
  text: string
  toolCalls: ToolCall[]
  usage: Usage
  /** Set when the provider declined the request. */
  refusal: string | null
  raw?: unknown
}

export type JsonRequest = {
  onNotice?: (text: string) => void
  system: string
  prompt: string
  schemaName: string
  schema: JsonSchema
  maxTokens: number
  signal: AbortSignal
}

export type JsonResult = {
  value: Record<string, unknown> | null
  usage: Usage
  refusal: string | null
}

export interface ChatModel {
  readonly provider: Provider
  readonly id: string
  /** List price per million tokens, for the on-screen estimate only. */
  readonly pricing: { input: number; output: number }
  /**
   * Largest completion this model should be asked for. Groq counts requested
   * completion tokens against the per-minute allowance, so an ambitious ceiling
   * gets a free-tier key rejected before it has spent anything.
   */
  readonly maxOutputTokens: number
  /** One streamed assistant turn, which may come back asking for tools. */
  turn(request: TurnRequest): Promise<Turn>
  /** One turn constrained to a JSON schema. */
  json(request: JsonRequest): Promise<JsonResult>
}
