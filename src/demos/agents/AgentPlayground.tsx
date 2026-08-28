import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CornerDownLeft, Loader2, Square } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import LangToggle from '@/components/ui/LangToggle'
import ApiKeyPanel from '@/components/ui/ApiKeyPanel'
import GraphCanvas, { type NodeStatus } from '@/components/ui/GraphCanvas'
import TraceLog from '@/components/ui/TraceLog'
import Markdown from '@/components/ui/Markdown'
import Disclosure from '@/components/ui/Disclosure'
import { useLang } from '@/hooks/useLang'
import { cn } from '@/lib/cn'
import { NODE_IDS, type NodeId } from '@/demos/agents/types'
import { run } from '@/demos/agents/graph'
import { estimateCost } from '@/demos/agents/llm'
import {
  MODELS,
  createModel,
  detectProvider,
  reconcile,
  type Catalogue,
  type ModelChoice,
  type Provider,
} from '@/demos/agents/providers'
import { discoverModels } from '@/demos/agents/providers/discovery'
import { examples } from '@/demos/agents/examples'
import { initialState, reducer } from '@/demos/agents/runState'

const KEY_STORAGE = 'portfolio:anthropic-key'

/** Session storage throws in some privacy modes, and a demo should not die for it. */
function readStoredKey(): string | null {
  try {
    return window.sessionStorage.getItem(KEY_STORAGE)
  } catch {
    return null
  }
}

export default function AgentPlayground() {
  const { t, lang } = useLang()
  const copy = t.demos.agents

  const [apiKey, setApiKey] = useState<string | null>(readStoredKey)
  const provider = useMemo<Provider | null>(
    () => (apiKey ? detectProvider(apiKey) : null),
    [apiKey],
  )
  const [liveIds, setLiveIds] = useState<string[] | null>(null)
  const [modelId, setModelId] = useState<string>('')
  const [task, setTask] = useState('')

  // Model IDs get retired. Ask the provider what it actually serves, so a
  // catalogue written months ago cannot hand the visitor a dead ID.
  useEffect(() => {
    if (!apiKey || !provider) {
      setLiveIds(null)
      return
    }

    const controller = new AbortController()
    void discoverModels(provider, apiKey, controller.signal).then((result) => {
      if (!controller.signal.aborted) setLiveIds(result.ids)
    })

    return () => controller.abort()
  }, [apiKey, provider])

  const catalogue: Catalogue = useMemo(
    () =>
      provider
        ? reconcile(provider, liveIds)
        : { choices: MODELS.map((m) => ({ ...m, verified: true })), retired: [], usingDiscovered: false },
    [provider, liveIds],
  )

  const choice: ModelChoice | undefined =
    catalogue.choices.find((option) => option.id === modelId) ?? catalogue.choices[0]

  // Keep the selection pointing at something the catalogue still offers.
  useEffect(() => {
    if (choice && choice.id !== modelId) setModelId(choice.id)
  }, [choice, modelId])
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const abortRef = useRef<AbortController | null>(null)

  const running = state.status === 'running'
  const canRun = Boolean(apiKey) && task.trim().length > 0 && !running

  const saveKey = useCallback((key: string) => {
    try {
      window.sessionStorage.setItem(KEY_STORAGE, key)
    } catch {
      // Not persisting is fine; the key still works for this page load.
    }
    setApiKey(key)
    setModelId('')
  }, [])

  const forgetKey = useCallback(() => {
    try {
      window.sessionStorage.removeItem(KEY_STORAGE)
    } catch {
      // Nothing to clean up.
    }
    setApiKey(null)
  }, [])

  const start = useCallback(async () => {
    if (!apiKey || !choice || task.trim().length === 0) return

    const controller = new AbortController()
    abortRef.current = controller
    dispatch({ type: 'start' })

    try {
      const chat = createModel(apiKey, choice)
      for await (const event of run(task.trim(), chat, {
        signal: controller.signal,
        lang,
      })) {
        dispatch({ type: 'event', event })
      }
    } finally {
      abortRef.current = null
      dispatch({ type: 'settle' })
    }
  }, [apiKey, task, choice, lang])

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const statuses = useMemo(
    () =>
      Object.fromEntries(NODE_IDS.map((id) => [id, state.nodes[id].status])) as Record<
        NodeId,
        NodeStatus
      >,
    [state.nodes],
  )

  const cost = estimateCost(state.usage, choice?.pricing ?? null)
  const totalTokens = state.usage.input + state.usage.output

  const toolRows = [
    { name: 'search_portfolio', description: copy.tools.portfolio },
    { name: 'wikipedia_search, wikipedia_summary', description: copy.tools.wikipedia },
    { name: 'get_weather', description: copy.tools.weather },
    { name: 'calculate', description: copy.tools.calculator },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-5 sm:px-8">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
          >
            <ArrowLeft
              size={15}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            {copy.back}
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <LangToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8">
        <h1 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] leading-tight font-semibold tracking-[-0.02em]">
          {copy.title}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{copy.subtitle}</p>

        <div className="mt-8 space-y-4">
          <ApiKeyPanel
            apiKey={apiKey}
            provider={provider}
            onSave={saveKey}
            onForget={forgetKey}
          />
          {!apiKey && <p className="text-xs text-faint">{copy.key.help}</p>}
        </div>

        {/* Task input */}
        <div className="mt-8">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-0 flex-1">
              <label
                htmlFor="agent-task"
                className="mb-2 block font-mono text-[11px] tracking-wide text-faint"
              >
                {copy.prompt.label}
              </label>
              <textarea
                id="agent-task"
                rows={2}
                value={task}
                onChange={(event) => setTask(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && canRun) {
                    void start()
                  }
                }}
                placeholder={copy.prompt.placeholder}
                className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-faint focus:border-accent focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="agent-model">
                {copy.model.label}
              </label>
              <select
                id="agent-model"
                value={choice?.id ?? ''}
                disabled={running || !provider}
                onChange={(event) => setModelId(event.target.value)}
                className="rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-xs text-ink focus:border-accent focus:outline-none"
              >
                {catalogue.choices.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>

              {running ? (
                <button
                  type="button"
                  onClick={stop}
                  className="inline-flex items-center gap-2 rounded-lg border border-warn px-4 py-2.5 text-sm font-medium text-warn transition-colors hover:bg-warn-soft"
                >
                  <Square size={13} />
                  {copy.stop}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void start()}
                  disabled={!canRun}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
                    canRun
                      ? 'bg-accent text-bg hover:opacity-90'
                      : 'cursor-not-allowed border border-border text-faint',
                  )}
                >
                  <CornerDownLeft size={13} />
                  {copy.run}
                </button>
              )}
            </div>
          </div>

          {!apiKey && <p className="mt-2 text-xs text-warn">{copy.key.missing}</p>}

          {/* Say so when the live list and the catalogue disagree, rather than
              quietly changing what the picker offers. */}
          {catalogue.usingDiscovered ? (
            <p className="mt-2 max-w-2xl text-xs text-warn">{copy.model.discovered}</p>
          ) : (
            catalogue.retired.length > 0 && (
              <p className="mt-2 max-w-2xl text-xs text-faint">{copy.model.retired}</p>
            )
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-faint">{copy.prompt.examples}</span>
            {examples[lang].map((example) => (
              <button
                key={example}
                type="button"
                disabled={running}
                onClick={() => setTask(example)}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Graph + trace */}
        <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-mono text-[11px] tracking-wide text-faint">{copy.graph.title}</h2>
              <span className="font-mono text-[11px] text-faint">
                {totalTokens.toLocaleString()} {copy.meter.tokens}
                {/* A discovered model has no published price, so no figure is
                    shown rather than an invented one. */}
                {cost !== null && ` · ${copy.meter.cost} $${cost.toFixed(cost < 0.01 ? 4 : 2)}`}
              </span>
            </div>

            <GraphCanvas statuses={statuses} activeEdge={state.activeEdge} />

            <div className="mt-4 space-y-2">
              {NODE_IDS.map((id) => {
                const node = state.nodes[id]
                if (node.status === 'idle') return null

                const detail = node.summary || node.stream || node.subtask
                return (
                  <div key={id} className="rounded-lg border border-border bg-bg-alt px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-accent">{copy.graph[id]}</span>
                      {node.status === 'active' && (
                        <Loader2 size={11} className="animate-spin text-accent" />
                      )}
                    </div>
                    {node.thinking && (
                      <p className="mt-1 border-l-2 border-border-strong pl-2 text-[11px] leading-relaxed text-faint italic">
                        {node.thinking.slice(-320)}
                      </p>
                    )}
                    {detail && (
                      <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted">
                        {detail.slice(-400)}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface">
            <h2 className="border-b border-border px-4 py-3 font-mono text-[11px] tracking-wide text-faint">
              {copy.trace.title}
            </h2>
            <div className="max-h-[26rem] overflow-y-auto">
              <TraceLog entries={state.trace} />
            </div>
          </section>
        </div>

        {/* Answer */}
        <section className="mt-5 rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-3 font-mono text-[11px] tracking-wide text-faint">
            {copy.answer.title}
          </h2>
          {state.error ? (
            <p className="text-sm text-warn">{state.error}</p>
          ) : state.answer ? (
            <Markdown source={state.answer} />
          ) : (
            <p className="text-sm text-faint">{copy.answer.empty}</p>
          )}
        </section>

        {/* Reference material, collapsed: useful once, in the way every time after. */}
        <div className="mt-12">
          <Disclosure title={copy.tools.title}>
            <p className="max-w-2xl text-sm leading-relaxed text-muted">{copy.tools.lead}</p>

            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {toolRows.map((tool) => (
                <li key={tool.name} className="rounded-xl border border-border bg-surface p-4">
                  <code className="font-mono text-xs text-accent">{tool.name}</code>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">{tool.description}</p>
                </li>
              ))}
            </ul>
          </Disclosure>

          <Disclosure title={copy.about.title}>
            <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-muted">
              <p>{copy.about.p1}</p>
              <p>{copy.about.p2}</p>
              <p>{copy.about.p3}</p>
              <p>{copy.about.p4}</p>
              <p>{copy.about.p5}</p>
            </div>
          </Disclosure>
        </div>
      </main>
    </div>
  )
}
