import { useState } from 'react'
import { ArrowUpRight, Check, KeyRound, ShieldCheck, X } from 'lucide-react'
import { useLang } from '@/hooks/useLang'
import { cn } from '@/lib/cn'
import {
  PROVIDER_CONSOLE,
  PROVIDER_LABEL,
  detectProvider,
  type Provider,
} from '@/demos/agents/providers'

type Props = {
  apiKey: string | null
  provider: Provider | null
  onSave: (key: string, provider: Provider) => void
  onForget: () => void
}

/**
 * Bring-your-own-key entry. The key lives in session storage and is handed
 * straight to the provider adapter in this tab. Nothing here talks to a server
 * of ours, because there isn't one.
 *
 * The provider is read from the key's prefix rather than asked for, so pasting a
 * key is the whole interaction.
 */
export default function ApiKeyPanel({ apiKey, provider, onSave, onForget }: Props) {
  const { t } = useLang()
  const copy = t.demos.agents.key
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (apiKey && provider) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
        <span className="flex items-center gap-2 text-sm text-accent">
          <Check size={15} />
          {copy.active} · {PROVIDER_LABEL[provider]}
        </span>
        <code className="font-mono text-xs text-faint">
          {apiKey.slice(0, 7)}…{apiKey.slice(-4)}
        </code>
        <button
          type="button"
          onClick={onForget}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-border-strong hover:text-ink"
        >
          <X size={12} />
          {copy.forget}
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const trimmed = draft.trim()
        if (trimmed.length === 0) return

        const detected = detectProvider(trimmed)
        if (!detected) {
          setError(copy.unknown)
          return
        }

        setError(null)
        setDraft('')
        onSave(trimmed, detected)
      }}
      className="rounded-xl border border-border bg-surface p-4"
    >
      <label
        htmlFor="agent-api-key"
        className="mb-2 flex items-center gap-2 font-mono text-[11px] tracking-wide text-faint"
      >
        <KeyRound size={13} />
        {copy.label}
      </label>

      <div className="flex flex-wrap gap-2">
        <input
          id="agent-api-key"
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            if (error) setError(null)
          }}
          placeholder={copy.placeholder}
          className="min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 py-2 font-mono text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={draft.trim().length === 0}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            draft.trim().length === 0
              ? 'cursor-not-allowed border border-border text-faint'
              : 'bg-accent text-bg hover:opacity-90',
          )}
        >
          {copy.save}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-warn">{error}</p>}

      <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted">
        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-accent" />
        {copy.note}
      </p>

      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-faint">
        <span>{copy.get}</span>
        {(Object.keys(PROVIDER_LABEL) as Provider[]).map((key) => (
          <a
            key={key}
            href={PROVIDER_CONSOLE[key]}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-accent transition-opacity hover:opacity-80"
          >
            {PROVIDER_LABEL[key]}
            <ArrowUpRight size={11} />
          </a>
        ))}
      </p>
    </form>
  )
}
