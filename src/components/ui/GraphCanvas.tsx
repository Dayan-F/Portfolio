import type { Destination, NodeId } from '@/demos/agents/types'
import { useLang } from '@/hooks/useLang'
import { cn } from '@/lib/cn'

export type NodeStatus = 'idle' | 'active' | 'done'

type Props = {
  statuses: Record<NodeId, NodeStatus>
  activeEdge: { from: NodeId; to: Destination } | null
}

/**
 * The graph, drawn as inline SVG so it inherits the page's design tokens and
 * stays crisp at any size. Nothing here is on a timer: what lights up is driven
 * entirely by the events the run emitted.
 */

const LAYOUT: Record<NodeId, { x: number; y: number }> = {
  supervisor: { x: 220, y: 46 },
  researcher: { x: 72, y: 190 },
  analyst: { x: 220, y: 190 },
  writer: { x: 368, y: 190 },
}

const WORKERS: NodeId[] = ['researcher', 'analyst', 'writer']

const BOX = { width: 124, height: 46, radius: 10 }

function edgePath(worker: NodeId): string {
  const target = LAYOUT[worker]
  const startX = LAYOUT.supervisor.x
  const startY = LAYOUT.supervisor.y + BOX.height / 2
  const endY = target.y - BOX.height / 2
  return `M ${startX} ${startY} C ${startX} ${startY + 52}, ${target.x} ${endY - 52}, ${target.x} ${endY}`
}

export default function GraphCanvas({ statuses, activeEdge }: Props) {
  const { t } = useLang()
  const labels = t.demos.agents.graph

  const nodeLabel: Record<NodeId, string> = {
    supervisor: labels.supervisor,
    researcher: labels.researcher,
    analyst: labels.analyst,
    writer: labels.writer,
  }

  return (
    <svg
      viewBox="0 0 440 250"
      className="h-auto w-full"
      role="img"
      aria-label={`${labels.title}: ${WORKERS.map((w) => nodeLabel[w]).join(', ')}`}
    >
      {WORKERS.map((worker) => {
        const isActive =
          activeEdge !== null &&
          ((activeEdge.from === 'supervisor' && activeEdge.to === worker) ||
            (activeEdge.from === worker && activeEdge.to === 'supervisor'))
        const isReturning = isActive && activeEdge?.to === 'supervisor'

        return (
          <path
            key={worker}
            d={edgePath(worker)}
            fill="none"
            strokeWidth={isActive ? 2 : 1.25}
            className={cn(
              'transition-colors',
              isActive ? 'stroke-accent' : 'stroke-border-strong',
              isActive && 'edge-active',
              isReturning && 'edge-active-reverse',
            )}
          />
        )
      })}

      {(Object.keys(LAYOUT) as NodeId[]).map((node) => {
        const { x, y } = LAYOUT[node]
        const status = statuses[node]

        return (
          <g key={node}>
            <rect
              x={x - BOX.width / 2}
              y={y - BOX.height / 2}
              width={BOX.width}
              height={BOX.height}
              rx={BOX.radius}
              strokeWidth={status === 'idle' ? 1 : 1.75}
              className={cn(
                'fill-surface transition-colors',
                status === 'idle' && 'stroke-border',
                status === 'active' && 'stroke-accent',
                status === 'done' && 'stroke-accent/50',
              )}
            />

            <circle
              cx={x - BOX.width / 2 + 16}
              cy={y}
              r={3.5}
              className={cn(
                'transition-colors',
                status === 'idle' && 'fill-border-strong',
                status === 'active' && 'fill-accent animate-pulse',
                status === 'done' && 'fill-accent',
              )}
            />

            <text
              x={x + 4}
              y={y + 4}
              textAnchor="middle"
              className={cn(
                'font-mono text-[11px] transition-colors',
                status === 'idle' ? 'fill-faint' : 'fill-ink',
              )}
            >
              {nodeLabel[node]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
