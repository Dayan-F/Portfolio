import { useLang } from '@/hooks/useLang'
import { LANGS } from '@/i18n/ui'
import { cn } from '@/lib/cn'

export default function LangToggle() {
  const { lang, setLang, t } = useLang()

  return (
    <div
      role="group"
      aria-label={t.a11y.toggleLang}
      className="flex items-center rounded-full border border-border p-0.5"
    >
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={cn(
            'rounded-full px-2.5 py-1 font-mono text-[11px] uppercase transition-colors',
            lang === code ? 'bg-accent-soft text-accent' : 'text-faint hover:text-ink',
          )}
        >
          {code}
        </button>
      ))}
    </div>
  )
}
