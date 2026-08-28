import type { Usage } from '@/demos/agents/types'
import type {
  ChatMessage,
  ChatModel,
  JsonRequest,
  JsonResult,
  JsonSchema,
  StreamHandlers,
  ToolCall,
  Turn,
  TurnRequest,
} from '@/demos/agents/providers/types'

/**
 * Groq adapter, written against the OpenAI-compatible REST surface with plain
 * `fetch`. Groq answers browser origins with `access-control-allow-origin: *`
 * and allows the `authorization` header, so no proxy is involved.
 *
 * Hand-rolled rather than pulling in another SDK: this demo already ships one,
 * and the fiddly part (assembling streamed tool-call fragments) is isolated in
 * `TurnAccumulator` below so it can be tested without a key.
 */

const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'

export type GroqModelId = 'openai/gpt-oss-120b' | 'openai/gpt-oss-20b'

export class GroqApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'GroqApiError'
  }
}

/* ── Wire types ──────────────────────────────────────────────────────────── */

type GroqToolCallDelta = {
  index: number
  id?: string
  function?: { name?: string; arguments?: string }
}

export type GroqChunk = {
  choices?: {
    delta?: {
      content?: string | null
      reasoning?: string | null
      tool_calls?: GroqToolCallDelta[]
    }
    message?: {
      content?: string | null
      reasoning?: string | null
      tool_calls?: { id: string; function: { name: string; arguments: string } }[]
    }
    finish_reason?: string | null
  }[]
  usage?: { prompt_tokens?: number; completion_tokens?: number }
}

/* ── Streaming accumulation ──────────────────────────────────────────────── */

/**
 * Tool calls stream in fragments: the name arrives once, then `arguments` comes
 * across many chunks that have to be concatenated per index before they parse.
 * Kept pure so the assembly can be exercised directly.
 */
export class TurnAccumulator {
  text = ''
  thinking = ''
  usage: Usage = { input: 0, output: 0 }
  finishReason: string | null = null

  private readonly calls = new Map<number, { id: string; name: string; args: string }>()

  push(chunk: GroqChunk, handlers?: StreamHandlers) {
    if (chunk.usage) {
      this.usage = {
        input: chunk.usage.prompt_tokens ?? this.usage.input,
        output: chunk.usage.completion_tokens ?? this.usage.output,
      }
    }

    const choice = chunk.choices?.[0]
    if (!choice) return

    if (choice.finish_reason) this.finishReason = choice.finish_reason

    const delta = choice.delta
    if (!delta) return

    if (delta.content) {
      this.text += delta.content
      handlers?.onText(delta.content)
    }

    // Reasoning models on Groq stream their reasoning on a separate field.
    if (delta.reasoning) {
      this.thinking += delta.reasoning
      handlers?.onThinking(delta.reasoning)
    }

    const toolCalls = delta.tool_calls
    if (!toolCalls) return

    for (const call of toolCalls) {
      const index = call.index ?? 0
      const existing = this.calls.get(index) ?? { id: '', name: '', args: '' }
      this.calls.set(index, {
        id: call.id ?? existing.id,
        name: call.function?.name ?? existing.name,
        args: existing.args + (call.function?.arguments ?? ''),
      })
    }
  }

  toolCalls(): ToolCall[] {
    return [...this.calls.entries()]
      .sort(([a], [b]) => a - b)
      .filter(([, call]) => call.name.length > 0)
      .map(([, call]) => ({
        id: call.id || `call_${call.name}`,
        name: call.name,
        // A model can emit no arguments at all for a zero-argument tool.
        input: parseArguments(call.args),
      }))
  }
}

function parseArguments(args: string): Record<string, unknown> {
  const trimmed = args.trim()
  if (trimmed.length === 0) return {}
  try {
    const value: unknown = JSON.parse(trimmed)
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

/** Yields the payload of each `data:` line in a Server-Sent Events body. */
export async function* readSse(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<string> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Events are separated by a blank line; a chunk can split one in half.
      let boundary = buffer.search(/\r?\n\r?\n/)
      while (boundary !== -1) {
        const rawEvent = buffer.slice(0, boundary)
        buffer = buffer.slice(boundary + (buffer[boundary] === '\r' ? 4 : 2))

        for (const line of rawEvent.split(/\r?\n/)) {
          if (!line.startsWith('data:')) continue
          const payload = line.slice(5).trim()
          if (payload === '[DONE]') return
          if (payload.length > 0) yield payload
        }

        boundary = buffer.search(/\r?\n\r?\n/)
      }
    }
  } finally {
    reader.releaseLock()
  }
}

/* ── Request shaping ─────────────────────────────────────────────────────── */

type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | null
  tool_calls?: { id: string; type: 'function'; function: { name: string; arguments: string } }[]
  tool_call_id?: string
}

export function toOpenAIMessages(system: string, messages: ChatMessage[]): OpenAIMessage[] {
  const out: OpenAIMessage[] = [{ role: 'system', content: system }]

  for (const message of messages) {
    if (message.role === 'user') {
      out.push({ role: 'user', content: message.content })
      continue
    }

    if (message.role === 'tool') {
      out.push({ role: 'tool', content: message.content, tool_call_id: message.callId })
      continue
    }

    out.push({
      role: 'assistant',
      content: message.content.length > 0 ? message.content : null,
      ...(message.toolCalls.length > 0
        ? {
            tool_calls: message.toolCalls.map((call) => ({
              id: call.id,
              type: 'function' as const,
              function: { name: call.name, arguments: JSON.stringify(call.input) },
            })),
          }
        : {}),
    })
  }

  return out
}

/** Strict mode requires every property listed and no extras. */
export function strictSchema(schema: JsonSchema): JsonSchema {
  return {
    ...schema,
    additionalProperties: false,
    required: schema.required ?? Object.keys(schema.properties),
  }
}

/** Free-tier keys have a small per-minute token budget, so 429s are routine. */
const MAX_RETRIES = 4
/** Beyond this a wait stops feeling like a pause and starts feeling broken. */
const MAX_WAIT_MS = 30_000

/**
 * Groq reports the token budget as a rolling per-minute window and says exactly
 * how long until it frees up, both in the `retry-after` header and in the error
 * text. Reading that beats guessing at a backoff curve.
 */
export function retryDelayMs(headerValue: string | null, message: string): number | null {
  const header = Number(headerValue)
  if (Number.isFinite(header) && header > 0) return Math.ceil(header * 1000)

  // Groq switches units by magnitude: "4.425s" for a long wait, "255ms" for a
  // short one. `ms` is matched first, since `s` alone would half-match it.
  const match = /try again in ([\d.]+)\s*(ms|s)\b/i.exec(message)
  if (match) {
    const value = Number(match[1])
    if (Number.isFinite(value) && value > 0) {
      return Math.ceil(match[2].toLowerCase() === 'ms' ? value : value * 1000)
    }
  }

  // A per-minute budget always refills, so it is worth waiting out even when the
  // message carries no figure. A daily cap gets no such benefit of the doubt.
  if (/per minute|\bTPM\b|\bRPM\b/i.test(message)) return 2000

  return null
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

async function post(
  apiKey: string,
  body: Record<string, unknown>,
  signal: AbortSignal,
  onNotice?: (text: string) => void,
): Promise<Response> {
  for (let attempt = 0; ; attempt += 1) {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal,
    })

    if (response.ok) return response

    const detail = await response.text()
    let message = detail
    try {
      const parsed = JSON.parse(detail) as { error?: { message?: string } }
      message = parsed.error?.message ?? detail
    } catch {
      // Keep the raw body when it is not the usual error envelope.
    }

    // A per-minute budget refills on its own, so waiting it out is the fix
    // rather than something to hand back to the visitor as a failure.
    if (response.status === 429 && attempt < MAX_RETRIES) {
      const wait = retryDelayMs(response.headers.get('retry-after'), message)
      if (wait !== null && wait <= MAX_WAIT_MS) {
        onNotice?.(`Rate limit reached, waiting ${(wait / 1000).toFixed(1)}s and retrying.`)
        await sleep(wait, signal)
        continue
      }
    }

    throw new GroqApiError(response.status, message)
  }
}

/* ── Adapter ─────────────────────────────────────────────────────────────── */

export function createGroqModel(
  apiKey: string,
  id: GroqModelId,
  pricing: { input: number; output: number },
  maxOutputTokens: number,
): ChatModel {
  return {
    provider: 'groq',
    id,
    pricing,
    maxOutputTokens,

    async turn(request: TurnRequest): Promise<Turn> {
      const response = await post(
        apiKey,
        {
          model: id,
          messages: toOpenAIMessages(request.system, request.messages),
          ...(request.tools.length > 0
            ? {
                tools: request.tools.map((tool) => ({
                  type: 'function',
                  function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.parameters,
                  },
                })),
              }
            : {}),
          max_completion_tokens: request.maxTokens,
          stream: true,
          // Usage only arrives on a streamed response when it is asked for.
          stream_options: { include_usage: true },
        },
        request.signal,
        request.handlers.onNotice,
      )

      if (!response.body) throw new GroqApiError(500, 'The response had no body to stream.')

      const accumulator = new TurnAccumulator()
      for await (const payload of readSse(response.body)) {
        accumulator.push(JSON.parse(payload) as GroqChunk, request.handlers)
      }

      return {
        text: accumulator.text,
        toolCalls: accumulator.toolCalls(),
        usage: accumulator.usage,
        refusal: null,
      }
    },

    async json(request: JsonRequest): Promise<JsonResult> {
      const response = await post(
        apiKey,
        {
          model: id,
          messages: [
            { role: 'system', content: request.system },
            { role: 'user', content: request.prompt },
          ],
          max_completion_tokens: request.maxTokens,
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: request.schemaName,
              strict: true,
              schema: strictSchema(request.schema),
            },
          },
        },
        request.signal,
        request.onNotice,
      )

      const data = (await response.json()) as GroqChunk
      const usage: Usage = {
        input: data.usage?.prompt_tokens ?? 0,
        output: data.usage?.completion_tokens ?? 0,
      }

      const text = data.choices?.[0]?.message?.content ?? ''
      let value: Record<string, unknown> | null = null
      try {
        const parsed: unknown = JSON.parse(text)
        if (typeof parsed === 'object' && parsed !== null) {
          value = parsed as Record<string, unknown>
        }
      } catch {
        value = null
      }

      return { value, usage, refusal: null }
    },
  }
}
