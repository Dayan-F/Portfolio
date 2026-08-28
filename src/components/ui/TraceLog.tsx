import { useState } from 'react'
import { AlertTriangle, ArrowRight, ChevronRight, Clock, Wrench } from 'lucide-react'
import type { Destination, NodeId } from '@/demos/agents/types'
import { useLang } from '@/hooks/useLang'
import { cn } from '@/lib/cn'

export type TraceEntry =
  | { id: string; at: number; kind: 'route'; from: NodeId; to: Destination; reason: string }
  | {
      id: string
      at: number
      kind: 'tool'
      node: NodeId
      tool: string
      input: unknown
      output?: unknown
      ms?: number
      failed?: boolean
    }
  | { id: string; at: number; kind: 'error'; message: string }
  | { id: string; at: number; kind: 'notice'; message: string }

type Props = {
  entries: TraceEntry[]
}

function clockTime(at: number): string {
  return new Date(at).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function ToolRow({ entry }: { entry: Extract<TraceEntry, { kind: 'tool' }> }) {
  const { t } = useLang()
  const copy = t.demos.agents.trace
  const [open, setOpen] = useState(false)
  const settled = entry.output !== undefined

  return (
    <li className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-baseline gap-2 px-3 py-2 text-left transition-colors hover:bg-bg-alt"
      >
        <span className="font-mono text-[10px] text-faint">{clockTime(entry.at)}</span>
        <Wrench size={12} className={cn('shrink-0 self-center', entry.failed ? 'text-warn' : 'text-accent')} />
        <span className="font-mono text-xs text-ink">{entry.tool}</span>
        <span className="ml-auto flex items-center gap-2 font-mono text-[10px] text-faint">
          {entry.failed && <span className="text-warn">{copy.failed}</span>}
          {settled && entry.ms !== undefined && `${copy.took} ${entry.ms}ms`}
          {!settled && <span className="animate-pulse">…</span>}
          <ChevronRight
            size={12}
            className={cn('transition-transform', open && 'rotate-90')}
          />
        </span>
      </button>

      {open && (
        <div className="space-y-2 px-3 pb-3">
          <pre className="max-h-32 overflow-auto rounded-md bg-bg-alt p-2 font-mono text-[10px] leading-relaxed text-muted">
            {JSON.stringify(entry.input, null, 2)}
          </pre>
          {settled && (
            <pre className="max-h-48 overflow-auto rounded-md bg-bg-alt p-2 font-mono text-[10px] leading-relaxed text-muted">
              {JSON.stringify(entry.output, null, 2)}
            </pre>
          )}
        </div>
      )}
    </li>
  )
}

export default function TraceLog({ entries }: Props) {
  const { t } = useLang()
  const copy = t.demos.agents.trace
  const graph = t.demos.agents.graph

  const nodeLabel = (node: Destination): string => {
    if (node === 'END') return 'END'
    return graph[node]
  }

  if (entries.length === 0) {
    return <p className="px-3 py-6 text-center text-xs text-faint">{copy.empty}</p>
  }

  return (
    <ul className="divide-y divide-border">
      {entries.map((entry) => {
        if (entry.kind === 'tool') return <ToolRow key={entry.id} entry={entry} />

        if (entry.kind === 'notice') {
          return (
            <li key={entry.id} className="flex items-baseline gap-2 px-3 py-2">
              <span className="font-mono text-[10px] text-faint">{clockTime(entry.at)}</span>
              <Clock size={12} className="shrink-0 self-center text-warn" />
              <span className="text-xs text-muted">{entry.message}</span>
            </li>
          )
        }

        if (entry.kind === 'error') {
          return (
            <li key={entry.id} className="flex items-baseline gap-2 px-3 py-2">
              <span className="font-mono text-[10px] text-faint">{clockTime(entry.at)}</span>
              <AlertTriangle size={12} className="shrink-0 self-center text-warn" />
              <span className="text-xs text-warn">{entry.message}</span>
            </li>
          )
        }

        return (
          <li key={entry.id} className="flex items-baseline gap-2 px-3 py-2">
            <span className="font-mono text-[10px] text-faint">{clockTime(entry.at)}</span>
            <span className="font-mono text-xs text-muted">{nodeLabel(entry.from)}</span>
            <ArrowRight size={11} className="shrink-0 self-center text-accent" />
            <span className="font-mono text-xs text-ink">{nodeLabel(entry.to)}</span>
            <span className="ml-2 min-w-0 flex-1 truncate text-xs text-faint" title={entry.reason}>
              {entry.reason}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
