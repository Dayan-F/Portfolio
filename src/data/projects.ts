import type { Lang } from '@/i18n/ui'

type LocalizedProject = {
  tagline: string
  description: string
}

export type Project = {
  id: string
  name: string
  /** GitHub repository. */
  source: string
  /** Deployed, publicly reachable instance — omitted when there isn't one. */
  demo?: string
  tech: string[]
} & Record<Lang, LocalizedProject>

export const projects: Project[] = [
  {
    id: 'openmail',
    name: 'OpenMail',
    source: 'https://github.com/Dayan-F/OpenMail',
    demo: 'https://open-mail-tau.vercel.app',
    tech: ['LangGraph', 'LangChain', 'Next.js', 'TypeScript', 'Groq', 'Gmail API', 'SQLite'],
    en: {
      tagline: 'Agentic inbox triage, human-in-the-loop by design.',
      description:
        'An email assistant built with LangGraph and LangChain: it classifies your inbox, drafts replies you approve before anything is sent, and tracks job applications on a timeline assembled from the emails themselves.',
    },
    fr: {
      tagline: 'Triage de boîte mail agentique, avec validation humaine par principe.',
      description:
        'Un assistant email construit avec LangGraph et LangChain : il classe la boîte de réception, rédige des réponses que vous validez avant tout envoi, et suit les candidatures via une timeline reconstruite à partir des emails.',
    },
  },
  {
    id: 'spotifai',
    name: 'spotifAI',
    source: 'https://github.com/Dayan-F/spotify-bot',
    tech: ['LangGraph', 'FastAPI', 'Next.js'],
    en: {
      tagline: 'Playlists on request, in plain language.',
      description:
        'Playlist management, music search and recommendations driven by lyrical themes. Built on LangGraph, with a FastAPI backend and a Next.js front end.',
    },
    fr: {
      tagline: 'Des playlists sur demande, en langage naturel.',
      description:
        'Gestion de playlists, recherche musicale et recommandations par thèmes lyriques. Construit sur LangGraph, avec un backend FastAPI et un front Next.js.',
    },
  },
]

/** The one deployment worth surfacing above the fold. */
export const featuredDemo = projects.find((project) => project.demo)
