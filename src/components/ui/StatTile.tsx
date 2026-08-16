type Props = {
  value: string
  label: string
}

export default function StatTile({ value, label }: Props) {
  return (
    <div className="border-t border-border pt-3">
      <div className="font-display text-xl leading-tight font-semibold text-accent sm:text-2xl">
        {value}
      </div>
      <div className="mt-1 text-xs leading-snug text-muted">{label}</div>
    </div>
  )
}
