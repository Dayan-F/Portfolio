import { roles, education } from '@/data/experiences'
import { projects } from '@/data/projects'
import { profile } from '@/data/profile'
import type { Lang } from '@/i18n/ui'
import type { ToolSpec } from '@/demos/agents/types'
import { aboutDocs } from '@/demos/agents/about'

/**
 * Retrieval over the same typed data the page itself renders, so the agent can
 * answer questions about the work without anything being duplicated for it.
 * Plain BM25, computed in the browser: the corpus is a few dozen passages, which
 * is far below the size where embeddings would earn their download.
 */

type Doc = {
  id: string
  source: string
  section: string
  text: string
  tokens: string[]
}

const STOPWORDS = new Set([
  // English
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'do', 'does', 'for', 'from',
  'had', 'has', 'have', 'he', 'her', 'his', 'how', 'i', 'in', 'is', 'it', 'its', 'of', 'on', 'or',
  'she', 'that', 'the', 'their', 'them', 'they', 'this', 'to', 'was', 'were', 'what', 'when',
  'which', 'who', 'with', 'you', 'your',
  // French
  'au', 'aux', 'avec', 'ce', 'ces', 'dans', 'de', 'des', 'du', 'elle', 'en', 'est', 'et', 'il',
  'la', 'le', 'les', 'leur', 'lui', 'ma', 'mais', 'me', 'mon', 'ne', 'nos', 'notre', 'nous', 'on',
  'ou', 'par', 'pas', 'pour', 'que', 'qui', 'sa', 'se', 'ses', 'son', 'sur', 'ta', 'te', 'tes',
  'ton', 'tu', 'un', 'une', 'vos', 'votre', 'vous', 'y',
])

/** "déploiement" and "deploiement" should hit the same posting list. */
function tokenize(value: string): string[] {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .map((token) => token.replace(/^\.+|\.+$/g, ''))
    .filter((token) => token.length > 1 && !STOPWORDS.has(token))
}

function buildCorpus(lang: Lang): Doc[] {
  const docs: Doc[] = []

  const push = (id: string, source: string, section: string, text: string) => {
    const trimmed = text.trim()
    if (trimmed) docs.push({ id, source, section, text: trimmed, tokens: tokenize(trimmed) })
  }

  push('profile', 'Profile', 'summary', `${profile.title[lang]}. ${profile.summary[lang]}`)

  for (const role of roles) {
    const local = role[lang]
    const where = `${role.org}, ${role.location}`
    const period = local.period

    push(`${role.id}:headline`, role.org, 'headline', `${local.role} at ${where}, ${period}. ${local.headline}`)
    push(`${role.id}:narrative`, role.org, 'narrative', local.narrative)
    push(`${role.id}:focus`, role.org, 'focus areas', local.focus.join('. '))
    push(`${role.id}:tech`, role.org, 'technologies', role.tags.join(', '))
    push(
      `${role.id}:stats`,
      role.org,
      'results',
      local.stats.map((stat) => `${stat.value} ${stat.label}`).join('. '),
    )
    local.bullets.forEach((bullet, index) => {
      push(`${role.id}:bullet:${index}`, role.org, 'responsibility', bullet)
    })
  }

  for (const project of projects) {
    const local = project[lang]
    push(
      `${project.id}:overview`,
      project.name,
      'project',
      `${local.tagline} ${local.description}`,
    )
    push(`${project.id}:tech`, project.name, 'project stack', project.tech.join(', '))
  }

  for (const doc of aboutDocs[lang]) {
    push(doc.id, 'This playground', doc.section, doc.text)
  }

  for (const entry of education) {
    const local = entry[lang]
    push(
      `${entry.id}:degree`,
      entry.org,
      'education',
      `${local.degree}, ${entry.org}, ${local.period}. ${local.note}`,
    )
  }

  return docs
}

type Index = {
  docs: Doc[]
  averageLength: number
  documentFrequency: Map<string, number>
}

const indexCache = new Map<Lang, Index>()

function getIndex(lang: Lang): Index {
  const cached = indexCache.get(lang)
  if (cached) return cached

  const docs = buildCorpus(lang)
  const documentFrequency = new Map<string, number>()

  for (const doc of docs) {
    for (const token of new Set(doc.tokens)) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1)
    }
  }

  const averageLength = docs.reduce((sum, doc) => sum + doc.tokens.length, 0) / (docs.length || 1)
  const index: Index = { docs, averageLength, documentFrequency }
  indexCache.set(lang, index)
  return index
}

const K1 = 1.5
const B = 0.75

export function search(query: string, lang: Lang, limit = 5) {
  const { docs, averageLength, documentFrequency } = getIndex(lang)
  const queryTokens = tokenize(query)
  if (queryTokens.length === 0) return []

  const scored = docs.map((doc) => {
    const counts = new Map<string, number>()
    for (const token of doc.tokens) counts.set(token, (counts.get(token) ?? 0) + 1)

    let score = 0
    for (const token of queryTokens) {
      const frequency = counts.get(token)
      if (!frequency) continue

      const df = documentFrequency.get(token) ?? 0
      const idf = Math.log(1 + (docs.length - df + 0.5) / (df + 0.5))
      const norm = 1 - B + (B * doc.tokens.length) / averageLength
      score += idf * ((frequency * (K1 + 1)) / (frequency + K1 * norm))
    }

    return { doc, score }
  })

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => ({
      source: entry.doc.source,
      section: entry.doc.section,
      score: Number(entry.score.toFixed(3)),
      text: entry.doc.text,
    }))
}

export function createPortfolioSearch(lang: Lang): ToolSpec {
  return {
    name: 'search_portfolio',
    description:
      "Search two things: Dayan Fatayri's professional record (roles, what she built and " +
      'delivered, measured results, technologies, side projects, education), and how this ' +
      'agent playground itself works (its graph, agents, tools, providers and cost ' +
      'controls). Use it for any question about her background, and for any question about ' +
      'this demo or how it was built. Returns ranked passages taken verbatim, each with ' +
      'its source. Cite the source when you use a passage, and if nothing relevant comes ' +
      'back, say so rather than guessing.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Keywords to look for, for example "LiDAR point clouds" or "deployment".',
        },
        limit: {
          type: 'integer',
          description: 'How many passages to return, 1 to 10. Defaults to 5.',
        },
      },
      required: ['query'],
    },
    async run(input) {
      const query = String(input.query ?? '')
      const limit = Math.min(Math.max(Number(input.limit ?? 5) || 5, 1), 10)
      const results = search(query, lang, limit)
      return { query, count: results.length, results }
    },
  }
}
