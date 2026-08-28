import Anthropic from '@anthropic-ai/sdk'
import type {
  BetaContentBlockParam,
  BetaMessageParam,
  BetaToolUnion,
} from '@anthropic-ai/sdk/resources/beta/messages/messages'
import type { Usage } from '@/demos/agents/types'
import type {
  ChatMessage,
  ChatModel,
  JsonRequest,
  JsonResult,
  ToolCall,
  ToolDef,
  Turn,
  TurnRequest,
} from '@/demos/agents/providers/types'

/**
 * Anthropic adapter. Uses the beta namespace throughout so structured outputs,
 * streaming and server-side fallback all live on one set of types.
 */

/**
 * If a safety classifier declines the request, the API retries it on a fallback
 * model rather than handing back a dead end.
 */
const FALLBACK_BETA = 'server-side-fallback-2026-07-01'

export type AnthropicModelId = 'claude-opus-5' | 'claude-haiku-4-5'

function createClient(apiKey: string) {
  return new Anthropic({
    apiKey,
    // Off by default so keys are not casually shipped to browsers. Here the key
    // is the visitor's own and never leaves their machine except to Anthropic.
    dangerouslyAllowBrowser: true,
    maxRetries: 1,
  })
}

function toToolParams(tools: ToolDef[]): BetaToolUnion[] {
  return tools.map(
    (tool) =>
      ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.parameters,
      }) as BetaToolUnion,
  )
}

/**
 * Anthropic wants every tool result from one assistant turn in a *single* user
 * message. The neutral history keeps them as separate entries, so consecutive
 * runs are collapsed back together here.
 */
export function toMessageParams(messages: ChatMessage[]): BetaMessageParam[] {
  const out: BetaMessageParam[] = []
  let pendingResults: BetaContentBlockParam[] = []

  const flush = () => {
    if (pendingResults.length > 0) {
      out.push({ role: 'user', content: pendingResults })
      pendingResults = []
    }
  }

  for (const message of messages) {
    if (message.role === 'tool') {
      pendingResults.push({
        type: 'tool_result',
        tool_use_id: message.callId,
        content: message.content,
        ...(message.isError ? { is_error: true } : {}),
      })
      continue
    }

    flush()

    if (message.role === 'user') {
      out.push({ role: 'user', content: message.content })
      continue
    }

    // Echo the original blocks when we have them: thinking blocks must go back
    // unchanged, and reconstructing them from text would drop their signatures.
    out.push({
      role: 'assistant',
      content: (message.raw as BetaContentBlockParam[] | undefined) ?? message.content,
    })
  }

  flush()
  return out
}

function readRefusal(message: { stop_reason: string | null; stop_details?: unknown }): string | null {
  if (message.stop_reason !== 'refusal') return null
  const details = message.stop_details as { category?: string | null } | null | undefined
  return details?.category ?? 'unspecified'
}

export function createAnthropicModel(
  apiKey: string,
  id: AnthropicModelId,
  pricing: { input: number; output: number },
  maxOutputTokens: number,
): ChatModel {
  const client = createClient(apiKey)

  return {
    provider: 'anthropic',
    id,
    pricing,
    maxOutputTokens,

    async turn(request: TurnRequest): Promise<Turn> {
      const tools = toToolParams(request.tools)

      const stream = client.beta.messages.stream(
        {
          model: id,
          max_tokens: request.maxTokens,
          system: request.system,
          messages: toMessageParams(request.messages),
          ...(tools.length > 0 ? { tools } : {}),
          thinking: {
            type: 'adaptive',
            display: request.showThinking ? 'summarized' : 'omitted',
          },
          betas: [FALLBACK_BETA],
          fallbacks: 'default',
        },
        { signal: request.signal },
      )

      stream.on('text', (delta) => request.handlers.onText(delta))
      if (request.showThinking) {
        stream.on('thinking', (delta) => request.handlers.onThinking(delta))
      }

      const message = await stream.finalMessage()

      const usage: Usage = {
        input: message.usage.input_tokens,
        output: message.usage.output_tokens,
      }

      // Checked before reading content: a refusal can arrive with an empty
      // content array, and indexing into it would throw instead of reporting
      // what actually happened.
      const refusal = readRefusal(message)
      if (refusal) return { text: '', toolCalls: [], usage, refusal }

      let text = ''
      const toolCalls: ToolCall[] = []

      for (const block of message.content) {
        if (block.type === 'text') text += block.text
        if (block.type === 'tool_use') {
          toolCalls.push({
            id: block.id,
            name: block.name,
            input: (block.input ?? {}) as Record<string, unknown>,
          })
        }
      }

      return { text, toolCalls, usage, refusal: null, raw: message.content }
    },

    async json(request: JsonRequest): Promise<JsonResult> {
      const message = await client.beta.messages.create(
        {
          model: id,
          max_tokens: request.maxTokens,
          system: request.system,
          messages: [{ role: 'user', content: request.prompt }],
          output_config: { format: { type: 'json_schema', schema: request.schema } },
          betas: [FALLBACK_BETA],
          fallbacks: 'default',
        },
        { signal: request.signal },
      )

      const usage: Usage = {
        input: message.usage.input_tokens,
        output: message.usage.output_tokens,
      }

      const refusal = readRefusal(message)
      if (refusal) return { value: null, usage, refusal }

      const text = message.content
        .map((block) => (block.type === 'text' ? block.text : ''))
        .join('')

      return { value: safeParse(text), usage, refusal: null }
    },
  }
}

/** A truncated response is a null value the caller can recover from, not a crash. */
function safeParse(text: string): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(text)
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export { Anthropic }
