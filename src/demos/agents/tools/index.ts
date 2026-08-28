import type { Lang } from '@/i18n/ui'
import type { ToolSpec } from '@/demos/agents/types'
import { calculator } from '@/demos/agents/tools/calculator'
import { getWeather } from '@/demos/agents/tools/weather'
import { wikipediaSearch, wikipediaSummary } from '@/demos/agents/tools/wikipedia'
import { createPortfolioSearch } from '@/demos/agents/tools/portfolio'

/**
 * The tool surface, split by which node gets it. Giving every node every tool
 * is the usual way an agent graph turns into one confused loop, so the
 * researcher gets the lookups and the analyst gets arithmetic.
 */

export function researcherTools(lang: Lang): ToolSpec[] {
  return [createPortfolioSearch(lang), wikipediaSearch, wikipediaSummary, getWeather]
}

export function analystTools(lang: Lang): ToolSpec[] {
  return [calculator, createPortfolioSearch(lang)]
}

export function findTool(tools: ToolSpec[], name: string): ToolSpec | undefined {
  return tools.find((tool) => tool.name === name)
}
