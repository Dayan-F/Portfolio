import Anthropic from '@anthropic-ai/sdk'
import type { Provider } from '@/demos/agents/providers/types'

/**
 * Asking each provider what it currently serves.
 *
 * The curated catalogue is a snapshot: model IDs get retired, and a retired ID
 * fails with a 404 on the first request rather than anything a visitor could
 * diagnose. Reconciling against the live list keeps the picker honest without
 * giving up the things the catalogue knows that no API reports, namely price and
 * whether a model actually supports tool use with strict JSON output.
 */

/** Enough to cover any provider's catalogue without looping forever. */
const MAX_PAGES = 5

export type Discovery = {
  /** Model IDs the key can currently reach, or null when the lookup failed. */
  ids: string[] | null
  error: string | null
}

async function listAnthropic(apiKey: string, signal: AbortSignal): Promise<string[]> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 1 })
  const ids: string[] = []

  let page = await client.models.list({ limit: 100 }, { signal })
  for (let visited = 0; visited < MAX_PAGES; visited += 1) {
    for (const model of page.data) ids.push(model.id)
    if (!page.hasNextPage()) break
    page = await page.getNextPage()
  }

  return ids
}

type GroqModelList = { data?: { id?: string }[] }

async function listGroq(apiKey: string, signal: AbortSignal): Promise<string[]> {
  const response = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { authorization: `Bearer ${apiKey}` },
    signal,
  })

  if (!response.ok) {
    throw new Error(`Groq returned ${response.status} listing models`)
  }

  const body = (await response.json()) as GroqModelList
  return (body.data ?? [])
    .map((model) => model.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0)
}

/**
 * Never throws: a failed lookup falls back to the curated catalogue, which is
 * the same behaviour as before this existed.
 */
export async function discoverModels(
  provider: Provider,
  apiKey: string,
  signal: AbortSignal,
): Promise<Discovery> {
  try {
    const ids = provider === 'groq' ? await listGroq(apiKey, signal) : await listAnthropic(apiKey, signal)
    return { ids, error: null }
  } catch (error) {
    if (signal.aborted) return { ids: null, error: null }
    return { ids: null, error: error instanceof Error ? error.message : String(error) }
  }
}
