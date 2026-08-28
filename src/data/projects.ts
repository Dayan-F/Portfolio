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
  /** Route within this site, for a demo that runs on the page rather than off it. */
  route?: string
  tech: string[]
} & Record<Lang, LocalizedProject>

export const projects: Project[] = [
  {
    id: 'agent-playground',
    name: 'Agent graph playground',
    source: 'https://github.com/Dayan-F/Portfolio',
    route: '/demo/agents',
    tech: ['LangGraph-style', 'React', 'TypeScript', 'Claude', 'Groq', 'Tool use'],
    en: {
      tagline: 'A supervisor routing real work through real agents, live on this page.',
      description:
        'Type a task and watch a supervisor decide which of three workers takes it, then hand control back and decide again. The workers call real tools: BM25 retrieval over this site, Wikipedia, live weather, a calculator. Every routing decision and tool call streams into a graph as it happens. Bring an Anthropic or Groq key; there is no server and nothing is simulated.',
    },
    fr: {
      tagline: 'Un superviseur qui route du vrai travail vers de vrais agents, sur cette page.',
      description:
        "Saisissez une tâche et regardez un superviseur choisir lequel des trois agents s'en charge, puis reprendre la main et décider à nouveau. Les agents appellent de vrais outils : recherche BM25 sur ce site, Wikipédia, météo en direct, calculatrice. Chaque décision de routage et chaque appel d'outil s'affichent dans le graphe en direct. Apportez une clé Anthropic ou Groq ; il n'y a aucun serveur et rien n'est simulé.",
    },
  },
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

