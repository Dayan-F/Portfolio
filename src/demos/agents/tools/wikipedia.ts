import type { ToolSpec } from '@/demos/agents/types'

/**
 * Wikipedia's public endpoints send `Access-Control-Allow-Origin: *`, so the
 * browser can call them directly. That is the whole reason this demo needs no
 * server of its own.
 */

const SEARCH_ENDPOINT = 'https://en.wikipedia.org/w/api.php'
const SUMMARY_ENDPOINT = 'https://en.wikipedia.org/api/rest_v1/page/summary'

/**
 * A lead section can run to thousands of tokens, and every tool result is resent
 * on each later round of the loop, so it is trimmed to the part that answers the
 * question rather than the whole thing.
 */
const MAX_EXTRACT_CHARS = 1200

type SearchResponse = {
  query?: { search?: { title: string; snippet: string; wordcount: number }[] }
}

type SummaryResponse = {
  title?: string
  description?: string
  extract?: string
  content_urls?: { desktop?: { page?: string } }
}

function truncate(value: string, limit: number): string {
  return value.length <= limit ? value : `${value.slice(0, limit)}…`
}

/** Search snippets arrive as HTML with `<span class="searchmatch">` wrappers. */
function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#\d+;/g, '')
    .trim()
}

export const wikipediaSearch: ToolSpec = {
  name: 'wikipedia_search',
  description:
    'Search English Wikipedia and return the titles of matching articles with a short ' +
    'snippet each. Use this first to find the exact article title, then call ' +
    'wikipedia_summary on the title you want to read.',
  input_schema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'What to search for.' },
      limit: {
        type: 'integer',
        description: 'How many results to return, 1 to 10. Defaults to 5.',
      },
    },
    required: ['query'],
  },
  async run(input, signal) {
    const query = String(input.query ?? '')
    const limit = Math.min(Math.max(Number(input.limit ?? 5) || 5, 1), 10)

    const url = new URL(SEARCH_ENDPOINT)
    url.search = new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: query,
      srlimit: String(limit),
      format: 'json',
      origin: '*',
    }).toString()

    const response = await fetch(url, { signal })
    if (!response.ok) throw new Error(`Wikipedia search failed with ${response.status}`)

    const data = (await response.json()) as SearchResponse
    const results = (data.query?.search ?? []).map((hit) => ({
      title: hit.title,
      snippet: stripHtml(hit.snippet),
    }))

    return { query, count: results.length, results }
  },
}

export const wikipediaSummary: ToolSpec = {
  name: 'wikipedia_summary',
  description:
    'Read the lead section of an English Wikipedia article by its exact title. Returns the ' +
    'summary text and the page URL. Titles must match, so use wikipedia_search first when ' +
    'you are unsure of the exact title.',
  input_schema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'The exact article title, for example "Lidar" or "Lisbon".',
      },
    },
    required: ['title'],
  },
  async run(input, signal) {
    const title = String(input.title ?? '')
    const response = await fetch(`${SUMMARY_ENDPOINT}/${encodeURIComponent(title)}`, { signal })

    if (response.status === 404) {
      return { title, found: false, hint: 'No article with that exact title. Try wikipedia_search.' }
    }
    if (!response.ok) throw new Error(`Wikipedia summary failed with ${response.status}`)

    const data = (await response.json()) as SummaryResponse
    return {
      title: data.title ?? title,
      found: true,
      description: data.description ?? null,
      extract: truncate(data.extract ?? '', MAX_EXTRACT_CHARS),
      url: data.content_urls?.desktop?.page ?? null,
    }
  },
}
