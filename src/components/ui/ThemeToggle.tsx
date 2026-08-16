import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useLang } from '@/hooks/useLang'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLang()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t.a11y.toggleTheme}
      className="grid size-9 place-items-center rounded-full border border-border text-muted transition-colors hover:border-border-strong hover:text-ink"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
