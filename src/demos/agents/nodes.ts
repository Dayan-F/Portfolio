import type { GraphState, NodeId, RunEvent, ToolSpec, Usage } from '@/demos/agents/types'
import { analystTools, researcherTools } from '@/demos/agents/tools'
import { RefusalError, runToolLoop } from '@/demos/agents/llm'
import type { ChatModel, JsonSchema } from '@/demos/agents/providers/types'

/**
 * The four nodes. Each one is prompted separately and given only the tools its
 * job needs, which is most of what keeps a supervisor graph from collapsing into
 * a single agent that does everything badly.
 */

export type NodeContext = {
  model: ChatModel
  lang: 'en' | 'fr'
  signal: AbortSignal
  emit: (event: RunEvent) => void
}

const LANGUAGE_RULE: Record<'en' | 'fr', string> = {
  en: 'Write in English.',
  fr: 'Write in French.',
}

/* ── Supervisor ──────────────────────────────────────────────────────────── */

export type Routing = {
  next: Exclude<NodeId, 'supervisor'>
  subtask: string
  reason: string
}

const WORKER_NAMES = ['researcher', 'analyst', 'writer'] as const

/**
 * A plain JSON Schema rather than a validation library: both providers take one
 * directly, and hand-checking three fields is cheaper than a dependency.
 */
const ROUTING_SCHEMA: JsonSchema = {
  type: 'object',
  properties: {
    next: {
      type: 'string',
      enum: [...WORKER_NAMES],
      description: 'Which worker should take the next turn.',
    },
    subtask: {
      type: 'string',
      description: 'The single self-contained instruction for that worker. Be specific.',
    },
    reason: {
      type: 'string',
      description: 'One short sentence on why this worker, for the trace log.',
    },
  },
  required: ['next', 'subtask', 'reason'],
}

function readRouting(value: Record<string, unknown> | null): Routing | null {
  if (!value) return null
  const next = value.next
  const subtask = value.subtask
  const reason = value.reason

  if (typeof next !== 'string' || !WORKER_NAMES.includes(next as (typeof WORKER_NAMES)[number])) {
    return null
  }

  return {
    next: next as Exclude<NodeId, 'supervisor'>,
    subtask: typeof subtask === 'string' && subtask.length > 0 ? subtask : '',
    reason: typeof reason === 'string' ? reason : '',
  }
}

function supervisorPrompt(state: GraphState): string {
  const notes =
    state.notes.length > 0
      ? state.notes.map((note) => `[${note.from}]\n${note.text}`).join('\n\n')
      : '(nothing yet, this is the first turn)'

  return [
    `Task from the user:\n${state.task}`,
    `\nWhat the workers have reported so far:\n${notes}`,
    `\nTurns used: ${state.steps}. Decide who goes next.`,
  ].join('\n')
}

const SUPERVISOR_SYSTEM = `You are the supervisor of a small agent team. You do no work yourself; you decide who works next and what exactly they should do.

Your team:
- researcher: looks things up. Has portfolio search over Dayan Fatayri's professional record, Wikipedia search and article reading, and live weather. Use it whenever the task needs a fact you do not already have in the notes.
- analyst: reasons over what has been gathered and does exact arithmetic with a calculator. Route here whenever the answer involves numbers, costs, durations, totals, or weighing options against each other. The writer cannot calculate, so anything quantitative has to pass through the analyst first.
- writer: produces the final answer for the user. Route here once the notes are enough to answer well, and always route here to finish.

Rules:
- One worker per turn, with one self-contained instruction. Workers cannot see this conversation or each other's prompts, so the subtask must carry everything needed to act.
- Do not send a worker after something the notes already contain.
- Prefer routing to the writer early over gathering detail nobody asked for. Two or three worker turns is usually plenty.
- If the task is a simple question that needs no lookup, route straight to the writer.
- A task can use the same worker more than once, and skipping a worker entirely is fine when its speciality is not involved.

Reply only with the routing object.`

export async function runSupervisor(
  state: GraphState,
  ctx: NodeContext,
): Promise<{ routing: Routing; usage: Usage }> {
  const result = await ctx.model.json({
    onNotice: (text) => ctx.emit({ type: 'notice', node: 'supervisor', text }),
    system: SUPERVISOR_SYSTEM,
    prompt: supervisorPrompt(state),
    schemaName: 'routing_decision',
    schema: ROUTING_SCHEMA,
    maxTokens: Math.min(900, ctx.model.maxOutputTokens),
    signal: ctx.signal,
  })

  if (result.refusal) throw new RefusalError(result.refusal)

  // A structured output can still come back unusable if the model hit its token
  // ceiling mid-object, so fall back to finishing rather than crashing the run.
  const routing = readRouting(result.value) ?? {
    next: 'writer' as const,
    subtask: state.task,
    reason: 'Routing could not be parsed, so answering with what we have.',
  }

  if (routing.subtask.length === 0) routing.subtask = state.task

  return { routing, usage: result.usage }
}

/* ── Workers ─────────────────────────────────────────────────────────────── */

function notesBlock(state: GraphState): string {
  if (state.notes.length === 0) return ''
  return `\n\nWhat the team has gathered so far:\n${state.notes
    .map((note) => `[${note.from}]\n${note.text}`)
    .join('\n\n')}`
}

const RESEARCHER_SYSTEM = `You are the researcher on a small agent team. You gather facts and report them; you do not write the user's final answer.

Use your tools rather than answering from memory. For anything about Dayan Fatayri's experience, skills, projects or background, use search_portfolio, and quote what it returns rather than paraphrasing loosely. For general knowledge use the Wikipedia tools, and for weather use get_weather.

Report back as a short set of findings, each with where it came from. If a tool returns nothing useful, say so plainly instead of filling the gap with a guess.`

const ANALYST_SYSTEM = `You are the analyst on a small agent team. You reason over what has already been gathered and work out anything quantitative; you do not write the user's final answer.

Use the calculator for every calculation rather than doing arithmetic in your head. You can also search the portfolio if a comparison needs a detail nobody has fetched yet.

Report your reasoning compactly: the conclusion first, then the few points that support it. Say plainly when the evidence does not settle the question.`

const WRITER_SYSTEM = `You are the writer on a small agent team. You produce the final answer the user reads.

Work from the notes your teammates gathered. Lead with the answer, then the supporting detail. Keep it to the length the question deserves, and attribute any claim that came from a source. If the notes do not actually answer the question, say what is missing rather than papering over it.

Your answer is rendered as Markdown. Headings, bullet lists and bold are available when the content genuinely has structure, such as an itinerary or a comparison. For a short answer, plain sentences are better than imposing headings on two paragraphs.

Never use em dashes. Use a comma, a colon or a full stop instead.`

const WORKERS: Record<
  Exclude<NodeId, 'supervisor'>,
  {
    system: string
    maxTokens: number
    showThinking: boolean
    tools: (lang: 'en' | 'fr') => ToolSpec[]
  }
> = {
  researcher: {
    system: RESEARCHER_SYSTEM,
    maxTokens: 4000,
    showThinking: false,
    tools: researcherTools,
  },
  analyst: {
    system: ANALYST_SYSTEM,
    maxTokens: 4000,
    // The analyst is where visible reasoning is worth the screen space.
    showThinking: true,
    tools: analystTools,
  },
  writer: {
    system: WRITER_SYSTEM,
    maxTokens: 4000,
    showThinking: false,
    tools: () => [],
  },
}

export async function runWorker(
  node: Exclude<NodeId, 'supervisor'>,
  subtask: string,
  state: GraphState,
  ctx: NodeContext,
): Promise<{ text: string; usage: Usage }> {
  const worker = WORKERS[node]

  const prompt = [
    `The user's overall task:\n${state.task}`,
    `\nYour instruction for this turn:\n${subtask}`,
    notesBlock(state),
  ].join('\n')

  return runToolLoop({
    model: ctx.model,
    system: `${worker.system}\n\n${LANGUAGE_RULE[ctx.lang]}`,
    prompt,
    tools: worker.tools(ctx.lang),
    maxTokens: Math.min(worker.maxTokens, ctx.model.maxOutputTokens),
    showThinking: worker.showThinking,
    signal: ctx.signal,
    handlers: {
      onText: (text) => ctx.emit({ type: 'node:token', node, text }),
      onThinking: (text) => ctx.emit({ type: 'node:thinking', node, text }),
      onToolCall: (id, tool, input) => ctx.emit({ type: 'tool:call', node, id, tool, input }),
      onToolResult: (id, tool, output, ms) =>
        ctx.emit({ type: 'tool:result', node, id, tool, output, ms }),
      onNotice: (text) => ctx.emit({ type: 'notice', node, text }),
    },
  })
}
