import { ArrowUpRight, Github, Play } from 'lucide-react'
import type { Project } from '@/data/projects'
import { useLang } from '@/hooks/useLang'

export default function ProjectCard({ project }: { project: Project }) {
  const { lang, t } = useLang()
  const content = project[lang]

  return (
    <article className="card group flex h-full flex-col p-6 transition-colors duration-300 hover:border-border-strong">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl font-semibold">{project.name}</h3>

        {project.demo && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 font-mono text-[10px] tracking-wide text-accent uppercase">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
            </span>
            {t.projects.liveBadge}
          </span>
        )}
      </div>

      <p className="mt-2 font-display text-[15px] leading-snug text-ink">{content.tagline}</p>

      <p className="mt-3 text-sm leading-relaxed text-muted">{content.description}</p>

      <ul className="mt-5 flex flex-wrap gap-1.5">
        {project.tech.map((tech) => (
          <li
            key={tech}
            className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted"
          >
            {tech}
          </li>
        ))}
      </ul>

      {/* Pushed to the bottom so buttons line up across cards of unequal height */}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
        {project.demo && (
          <a
            href={project.demo}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            <Play size={13} className="fill-current" />
            {t.projects.live}
            <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5" />
          </a>
        )}

        <a
          href={project.source}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <Github size={14} />
          {t.projects.source}
        </a>
      </div>
    </article>
  )
}
