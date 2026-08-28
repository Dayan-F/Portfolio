import type { ToolSpec, Usage } from '@/demos/agents/types'
import { findTool } from '@/demos/agents/tools'
import type { ChatMessage, ChatModel, ToolDef } from '@/demos/agents/providers/types'
import { Anthropic } from '@/demos/agents/providers/anthropic'
import { GroqApiError } from '@/demos/agents/providers/groq'

/**
 * The tool loop, written against the neutral `ChatModel` rather than any one
 * provider. Everything here runs in the visitor's browser against the visitor's
 * own key, which is why the guards (token caps, abort, iteration limits) live at
 * this level rather than being left to the UI.
 */

/** A tool loop that will not terminate is the one way this can burn a visitor's key. */
const MAX_TOOL_ROUNDS = 6

/** null when the model's price is not published in the catalogue. */
export function estimateCost(
  usage: Usage,
  pricing: { input: number; output: number } | null,
): number | null {
  if (!pricing) return null
  return (usage.input / 1_000_000) * pricing.input + (usage.output / 1_000_000) * pricing.output
}

export function addUsage(a: Usage, b: Usage): Usage {
  return { input: a.input + b.input, output: a.output + b.output }
}

/** Raised when the provider declines and any fallback chain declined too. */
export class RefusalError extends Error {
  constructor(readonly category: string | null) {
    super('The model declined this request.')
    this.name = 'RefusalError'
  }
}

export function toToolDefs(tools: ToolSpec[]): ToolDef[] {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.input_schema,
  }))
}

export type LoopHandlers = {
  onText: (text: string) => void
  onThinking: (text: string) => void
  onToolCall: (id: string, name: string, input: unknown) => void
  onToolResult: (id: string, name: string, output: unknown, ms: number) => void
  onNotice: (text: string) => void
}

export type LoopOptions = {
  model: ChatModel
  system: string
  prompt: string
  tools: ToolSpec[]
  maxTokens: number
  /** Summarized reasoning is worth showing for the analyst, and noise elsewhere. */
  showThinking?: boolean
  signal: AbortSignal
  handlers: LoopHandlers
}

/**
 * One node's turn: stream a response, run any tools it asks for, feed the
 * results back, repeat until it stops asking. Written by hand rather than with a
 * provider's tool-runner helper because every step has to surface as an event
 * the graph view can draw, across four separately-prompted nodes.
 */
export async function runToolLoop(options: LoopOptions): Promise<{ text: string; usage: Usage }> {
  const { model, tools, signal, handlers } = options

  const messages: ChatMessage[] = [{ role: 'user', content: options.prompt }]
  const toolDefs = toToolDefs(tools)
  let usage: Usage = { input: 0, output: 0 }
  let text = ''

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const turn = await model.turn({
      system: options.system,
      messages,
      tools: toolDefs,
      maxTokens: options.maxTokens,
      showThinking: options.showThinking ?? false,
      signal,
      handlers: {
        onText: handlers.onText,
        onThinking: handlers.onThinking,
        onNotice: handlers.onNotice,
      },
    })

    usage = addUsage(usage, turn.usage)
    if (turn.refusal) throw new RefusalError(turn.refusal)

    text += turn.text
    if (turn.toolCalls.length === 0) return { text, usage }

    messages.push({
      role: 'assistant',
      content: turn.text,
      toolCalls: turn.toolCalls,
      raw: turn.raw,
    })

    // Tools run concurrently; each result is appended as its own entry and the
    // adapter regroups them into whatever shape its provider expects.
    const results = await Promise.all(
      turn.toolCalls.map(async (call): Promise<ChatMessage> => {
        handlers.onToolCall(call.id, call.name, call.input)
        const started = performance.now()

        try {
          const tool = findTool(tools, call.name)
          if (!tool) throw new Error(`No tool named "${call.name}" is available.`)

          const output = await tool.run(call.input, signal)
          const ms = Math.round(performance.now() - started)
          handlers.onToolResult(call.id, call.name, output, ms)

          return {
            role: 'tool',
            callId: call.id,
            name: call.name,
            content: JSON.stringify(output),
          }
        } catch (error) {
          if (signal.aborted) throw error
          const ms = Math.round(performance.now() - started)
          const detail = error instanceof Error ? error.message : String(error)
          handlers.onToolResult(call.id, call.name, { error: detail }, ms)

          // Reported back as an error rather than thrown, so the model can pick
          // a different approach instead of the whole run collapsing.
          return {
            role: 'tool',
            callId: call.id,
            name: call.name,
            content: `Tool failed: ${detail}`,
            isError: true,
          }
        }
      }),
    )

    messages.push(...results)
  }

  return { text, usage }
}

/** Turns provider errors into something a visitor can act on. */
export function describeError(error: unknown): string {
  if (error instanceof RefusalError) {
    return error.category && error.category !== 'unspecified'
      ? `The model declined this request (${error.category}). Try a different task.`
      : 'The model declined this request. Try a different task.'
  }

  if (error instanceof GroqApiError) {
    if (error.status === 401) return 'That API key was rejected. Check it and try again.'
    if (error.status === 403) return 'That key does not have access to this model.'
    // Groq's own 429 text distinguishes "this single request is too big for your
    // per-minute allowance" from "you have spent today's quota", and says by how
    // much. Swallowing it behind generic advice sends people off to wait for a
    // limit that waiting will not clear.
    if (error.status === 429) return `Groq rate limit: ${error.message}`
    return `Groq returned an error: ${error.message}`
  }

  if (error instanceof Anthropic.AuthenticationError) {
    return 'That API key was rejected. Check it and try again.'
  }
  if (error instanceof Anthropic.PermissionDeniedError) {
    return 'That key does not have access to this model. Try the other model in the picker.'
  }
  if (error instanceof Anthropic.RateLimitError) {
    return 'Anthropic rate limited that key. Wait a moment and run it again.'
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return 'Could not reach the API. Check your connection and try again.'
  }
  if (error instanceof Anthropic.APIError) {
    return `The API returned an error: ${error.message}`
  }

  if (error instanceof Error) return error.message
  return String(error)
}
