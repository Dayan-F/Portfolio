import { ArrowUp } from 'lucide-react'
import { profile } from '@/data/profile'
import { useLang } from '@/hooks/useLang'

export default function Footer() {
  const { t } = useLang()

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-5 py-8 font-mono text-xs text-faint sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>{t.footer.built}</span>
        <a href="#top" className="inline-flex items-center gap-1.5 transition-colors hover:text-accent">
          {t.footer.back}
          <ArrowUp size={12} />
        </a>
      </div>
    </footer>
  )
}
