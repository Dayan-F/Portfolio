import type { NodeStatus } from '@/components/ui/GraphCanvas'
import type { TraceEntry } from '@/components/ui/TraceLog'
import type { Destination, NodeId, RunEvent, Usage } from '@/demos/agents/types'

/**
 * The reducer that turns the run's event stream into what is on screen. Kept out
 * of the component so the state machine can be exercised on its own, without a
 * browser or an API key.
 */

export type RunStatus = 'idle' | 'running' | 'done' | 'stopped' | 'error'

export type NodeView = {
  status: NodeStatus
  subtask: string
  stream: string
  thinking: string
  summary: string
}

export type State = {
  status: RunStatus
  nodes: Record<NodeId, NodeView>
  activeEdge: { from: NodeId; to: Destination } | null
  trace: TraceEntry[]
  answer: string
  error: string | null
  usage: Usage
}

export type Action = { type: 'start' } | { type: 'event'; event: RunEvent } | { type: 'settle' }

const emptyNode: NodeView = { status: 'idle', subtask: '', stream: '', thinking: '', summary: '' }

export function initialState(): State {
  return {
    status: 'idle',
    nodes: {
      supervisor: { ...emptyNode },
      researcher: { ...emptyNode },
      analyst: { ...emptyNode },
      writer: { ...emptyNode },
    },
    activeEdge: null,
    trace: [],
    answer: '',
    error: null,
    usage: { input: 0, output: 0 },
  }
}

function looksLikeFailure(output: unknown): boolean {
  return typeof output === 'object' && output !== null && 'error' in (output as Record<string, unknown>)
}

export function reducer(state: State, action: Action): State {
  if (action.type === 'start') return { ...initialState(), status: 'running' }

  if (action.type === 'settle') {
    // The generator finished without a `done` or `error` event, which means the
    // visitor pressed Stop.
    if (state.status !== 'running') return state
    return { ...state, status: 'stopped', activeEdge: null }
  }

  const event = action.event

  switch (event.type) {
    case 'node:enter':
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [event.node]: { ...emptyNode, status: 'active', subtask: event.subtask },
        },
      }

    case 'node:token': {
      const node = state.nodes[event.node]
      return {
        ...state,
        answer: event.node === 'writer' ? state.answer + event.text : state.answer,
        nodes: { ...state.nodes, [event.node]: { ...node, stream: node.stream + event.text } },
      }
    }

    case 'node:thinking': {
      const node = state.nodes[event.node]
      return {
        ...state,
        nodes: { ...state.nodes, [event.node]: { ...node, thinking: node.thinking + event.text } },
      }
    }

    case 'node:exit': {
      const node = state.nodes[event.node]
      return {
        ...state,
        usage: {
          input: state.usage.input + event.usage.input,
          output: state.usage.output + event.usage.output,
        },
        nodes: { ...state.nodes, [event.node]: { ...node, status: 'done', summary: event.summary } },
      }
    }

    case 'edge':
      return {
        ...state,
        activeEdge: event.to === 'END' ? null : { from: event.from, to: event.to },
        trace: [
          ...state.trace,
          {
            id: `edge-${state.trace.length}`,
            at: Date.now(),
            kind: 'route',
            from: event.from,
            to: event.to,
            reason: event.reason,
          },
        ],
      }

    case 'tool:call':
      return {
        ...state,
        trace: [
          ...state.trace,
          {
            id: event.id,
            at: Date.now(),
            kind: 'tool',
            node: event.node,
            tool: event.tool,
            input: event.input,
          },
        ],
      }

    case 'tool:result':
      return {
        ...state,
        trace: state.trace.map((entry) =>
          entry.kind === 'tool' && entry.id === event.id
            ? { ...entry, output: event.output, ms: event.ms, failed: looksLikeFailure(event.output) }
            : entry,
        ),
      }

    case 'notice':
      return {
        ...state,
        trace: [
          ...state.trace,
          {
            id: `notice-${state.trace.length}`,
            at: Date.now(),
            kind: 'notice',
            message: event.text,
          },
        ],
      }

    case 'error':
      return {
        ...state,
        status: 'error',
        error: event.message,
        activeEdge: null,
        trace: [
          ...state.trace,
          {
            id: `error-${state.trace.length}`,
            at: Date.now(),
            kind: 'error',
            message: event.message,
          },
        ],
      }

    case 'done':
      return { ...state, status: 'done', answer: event.answer, activeEdge: null }

    default:
      return state
  }
}
