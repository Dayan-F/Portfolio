import Reveal from '@/components/ui/Reveal'

type Props = {
  index: string
  title: string
  caption?: string
  lead?: string
}

export default function SectionHeading({ index, title, caption, lead }: Props) {
  return (
    <Reveal as="header" className="mb-14">
      <div className="mb-5 flex items-center gap-4">
        <span className="font-mono text-xs text-accent">{index}</span>
        <span className="h-px flex-1 bg-border" />
        {caption && <span className="font-mono text-[11px] text-faint">{caption}</span>}
      </div>

      <h2 className="font-display text-[clamp(2rem,5vw,3rem)] leading-[1.05] font-semibold tracking-[-0.02em]">
        {title}
      </h2>

      {lead && <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">{lead}</p>}
    </Reveal>
  )
}
