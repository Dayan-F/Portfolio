/**
 * Shared vocabulary for the agent graph. Kept free of React and of the
 * Anthropic SDK so the runtime and the tools can be reasoned about, and
 * tested, without either.
 */

export type NodeId = 'supervisor' | 'researcher' | 'analyst' | 'writer'

export const NODE_IDS: NodeId[] = ['supervisor', 'researcher', 'analyst', 'writer']

/** Where a node can hand control next. `END` finishes the run. */
export type Destination = NodeId | 'END'

export type Usage = {
  input: number
  output: number
}

export type Note = {
  from: NodeId
  text: string
}

/** The channel every node reads from and writes back into. */
export type GraphState = {
  task: string
  notes: Note[]
  answer: string
  /** Supervisor turns taken so far, capped to protect the visitor's key. */
  steps: number
  usage: Usage
}

/**
 * Everything the UI knows comes from this stream, so the graph on screen is a
 * projection of what actually ran rather than an animation played alongside it.
 */
export type RunEvent =
  | { type: 'node:enter'; node: NodeId; subtask: string }
  | { type: 'node:thinking'; node: NodeId; text: string }
  | { type: 'notice'; node: NodeId; text: string }
  | { type: 'node:token'; node: NodeId; text: string }
  | { type: 'tool:call'; node: NodeId; id: string; tool: string; input: unknown }
  | { type: 'tool:result'; node: NodeId; id: string; tool: string; output: unknown; ms: number }
  | { type: 'node:exit'; node: NodeId; usage: Usage; summary: string }
  | { type: 'edge'; from: NodeId; to: Destination; reason: string }
  | { type: 'error'; node: NodeId | null; message: string }
  | { type: 'done'; answer: string }

/** A tool the agent can actually call. No mocks: every one of these does real work. */
export type ToolSpec = {
  name: string
  description: string
  input_schema: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
  run: (input: Record<string, unknown>, signal: AbortSignal) => Promise<unknown>
}

/** Everything a run needs beyond the model itself. */
export type RunConfig = {
  signal: AbortSignal
  lang: 'en' | 'fr'
}
