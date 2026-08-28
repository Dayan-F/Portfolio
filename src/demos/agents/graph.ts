import type { GraphState, NodeId, RunConfig, RunEvent, Usage } from '@/demos/agents/types'
import { addUsage, describeError } from '@/demos/agents/llm'
import { runSupervisor, runWorker, type NodeContext } from '@/demos/agents/nodes'
import type { ChatModel } from '@/demos/agents/providers/types'

/**
 * The graph runtime. `run` is an async generator of events, so the diagram, the
 * trace and the answer panel are all projections of what actually happened
 * rather than an animation running alongside it.
 */

/** Supervisor turns before the run is forced to the writer. Guards the visitor's key. */
export const MAX_STEPS = 6

/**
 * Bridges the SDK's callback-based streaming into the generator. Token deltas
 * arrive on `stream.on(...)`, which cannot yield, so they queue here and the
 * generator drains them.
 */
class EventQueue {
  private items: RunEvent[] = []
  private waiting: (() => void) | null = null
  private closed = false

  push(event: RunEvent) {
    this.items.push(event)
    this.wake()
  }

  close() {
    this.closed = true
    this.wake()
  }

  private wake() {
    const resume = this.waiting
    this.waiting = null
    resume?.()
  }

  async *drain(): AsyncGenerator<RunEvent> {
    for (;;) {
      while (this.items.length > 0) yield this.items.shift()!
      if (this.closed) return
      await new Promise<void>((resolve) => {
        this.waiting = resolve
      })
    }
  }
}

/** Runs `work`, streaming whatever it emits, and returns its result. */
async function* pump<T>(
  work: (emit: (event: RunEvent) => void) => Promise<T>,
): AsyncGenerator<RunEvent, T> {
  const queue = new EventQueue()
  let result: T | undefined
  let failure: unknown = null

  const task = work((event) => queue.push(event))
    .then((value) => {
      result = value
    })
    .catch((error: unknown) => {
      failure = error
    })
    .finally(() => queue.close())

  yield* queue.drain()
  await task

  if (failure) throw failure
  return result as T
}

export function emptyState(task: string): GraphState {
  return { task, notes: [], answer: '', steps: 0, usage: { input: 0, output: 0 } }
}

/** A short, single-line stand-in for a worker's report, for the node card. */
function summarize(text: string): string {
  const line = text.replace(/\s+/g, ' ').trim()
  return line.length > 140 ? `${line.slice(0, 139)}…` : line
}

export async function* run(
  task: string,
  model: ChatModel,
  config: RunConfig,
): AsyncGenerator<RunEvent> {
  const state = emptyState(task)

  const context = (emit: (event: RunEvent) => void): NodeContext => ({
    model,
    lang: config.lang,
    signal: config.signal,
    emit,
  })

  try {
    for (;;) {
      if (config.signal.aborted) return

      /* Supervisor turn. */
      state.steps += 1
      const forced = state.steps > MAX_STEPS

      yield {
        type: 'node:enter',
        node: 'supervisor',
        subtask: forced ? 'Step limit reached, finishing.' : 'Decide who works next.',
      }

      let next: Exclude<NodeId, 'supervisor'>
      let subtask: string
      let reason: string

      if (forced) {
        next = 'writer'
        subtask = state.task
        reason = `Step limit of ${MAX_STEPS} reached, going straight to the answer.`
        yield { type: 'node:exit', node: 'supervisor', usage: { input: 0, output: 0 }, summary: reason }
      } else {
        const decision = await runSupervisor(state, context(() => {}))
        state.usage = addUsage(state.usage, decision.usage)
        next = decision.routing.next
        subtask = decision.routing.subtask
        reason = decision.routing.reason
        yield { type: 'node:exit', node: 'supervisor', usage: decision.usage, summary: reason }
      }

      yield { type: 'edge', from: 'supervisor', to: next, reason }
      if (config.signal.aborted) return

      /* Worker turn. */
      yield { type: 'node:enter', node: next, subtask }

      const result: { text: string; usage: Usage } = yield* pump((emit) =>
        runWorker(next, subtask, state, context(emit)),
      )

      state.usage = addUsage(state.usage, result.usage)
      yield {
        type: 'node:exit',
        node: next,
        usage: result.usage,
        summary: summarize(result.text),
      }

      if (next === 'writer') {
        state.answer = result.text
        yield { type: 'edge', from: 'writer', to: 'END', reason: 'Answer delivered.' }
        yield { type: 'done', answer: result.text }
        return
      }

      state.notes.push({ from: next, text: result.text })
      yield { type: 'edge', from: next, to: 'supervisor', reason: 'Reporting back.' }
    }
  } catch (error) {
    // An aborted run is the visitor pressing Stop, not a failure to report.
    if (config.signal.aborted) return
    yield { type: 'error', node: null, message: describeError(error) }
  }
}
