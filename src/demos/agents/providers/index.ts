import type { ChatModel, Provider } from '@/demos/agents/providers/types'
import { createAnthropicModel, type AnthropicModelId } from '@/demos/agents/providers/anthropic'
import { createGroqModel, type GroqModelId } from '@/demos/agents/providers/groq'

export type ModelId = AnthropicModelId | GroqModelId

export type ModelOption = {
  id: ModelId
  provider: Provider
  label: string
  /** List price per million tokens, for the on-screen estimate only. */
  pricing: { input: number; output: number }
  /** Per-request completion ceiling that keeps free-tier keys usable. */
  maxOutputTokens: number
}

/**
 * Only models that support both tool use and strict JSON schema output are
 * listed, so the supervisor's structured routing behaves identically whichever
 * provider a visitor brings.
 */
export const MODELS: ModelOption[] = [
  {
    id: 'claude-opus-5',
    provider: 'anthropic',
    label: 'Claude Opus 5',
    pricing: { input: 5, output: 25 },
    maxOutputTokens: 4000,
  },
  {
    id: 'claude-haiku-4-5',
    provider: 'anthropic',
    label: 'Claude Haiku 4.5',
    pricing: { input: 1, output: 5 },
    maxOutputTokens: 4000,
  },
  {
    id: 'openai/gpt-oss-120b',
    provider: 'groq',
    label: 'GPT-OSS 120B',
    pricing: { input: 0.15, output: 0.6 },
    maxOutputTokens: 1200,
  },
  {
    id: 'openai/gpt-oss-20b',
    provider: 'groq',
    label: 'GPT-OSS 20B',
    pricing: { input: 0.075, output: 0.3 },
    maxOutputTokens: 1200,
  },
]

export const PROVIDER_LABEL: Record<Provider, string> = {
  anthropic: 'Anthropic',
  groq: 'Groq',
}

export const PROVIDER_CONSOLE: Record<Provider, string> = {
  // console.anthropic.com 301s here; link the canonical host directly.
  anthropic: 'https://platform.claude.com/settings/keys',
  groq: 'https://console.groq.com/keys',
}

/**
 * Which service a key belongs to is readable from its prefix, so the visitor
 * pastes one key and the provider follows rather than being another choice.
 */
export function detectProvider(key: string): Provider | null {
  const trimmed = key.trim()
  if (trimmed.startsWith('sk-ant-')) return 'anthropic'
  if (trimmed.startsWith('gsk_')) return 'groq'
  return null
}

export function modelsFor(provider: Provider): ModelOption[] {
  return MODELS.filter((model) => model.provider === provider)
}

/** What a model looks like once the catalogue and the live list are reconciled. */
export type ModelChoice = {
  id: string
  label: string
  provider: Provider
  /** null for a model discovered live, since no API reports price. */
  pricing: { input: number; output: number } | null
  maxOutputTokens: number
  /** The catalogue has confirmed tool use and strict JSON output on this one. */
  verified: boolean
}

export type Catalogue = {
  choices: ModelChoice[]
  /** Curated models the provider no longer serves. */
  retired: string[]
  /** Nothing curated survived, so these came straight from the provider. */
  usingDiscovered: boolean
}

/** Conservative ceiling for a model the catalogue knows nothing about. */
const FALLBACK_MAX_OUTPUT: Record<Provider, number> = {
  anthropic: 4000,
  groq: 1200,
}

function toChoice(option: ModelOption): ModelChoice {
  return { ...option, verified: true }
}

/**
 * `liveIds` of null means the lookup did not happen or failed, in which case the
 * curated list stands on its own exactly as it did before.
 */
export function reconcile(provider: Provider, liveIds: string[] | null): Catalogue {
  const curated = modelsFor(provider)

  if (liveIds === null) {
    return { choices: curated.map(toChoice), retired: [], usingDiscovered: false }
  }

  const live = new Set(liveIds)
  const surviving = curated.filter((option) => live.has(option.id))
  const retired = curated.filter((option) => !live.has(option.id)).map((option) => option.id)

  if (surviving.length > 0) {
    return { choices: surviving.map(toChoice), retired, usingDiscovered: false }
  }

  // Every model this demo was built against is gone. Rather than offer a picker
  // full of dead IDs, fall back to whatever the provider actually serves and be
  // explicit that these are unverified for tool use and strict JSON output.
  return {
    choices: liveIds.map((id) => ({
      id,
      label: id,
      provider,
      pricing: null,
      maxOutputTokens: FALLBACK_MAX_OUTPUT[provider],
      verified: false,
    })),
    retired,
    usingDiscovered: true,
  }
}

export function createModel(apiKey: string, choice: ModelChoice): ChatModel {
  // A discovered model has no listed price, so the meter shows nothing rather
  // than a made-up number; zeroes keep the arithmetic total at zero.
  const pricing = choice.pricing ?? { input: 0, output: 0 }

  return choice.provider === 'groq'
    ? createGroqModel(apiKey, choice.id as GroqModelId, pricing, choice.maxOutputTokens)
    : createAnthropicModel(apiKey, choice.id as AnthropicModelId, pricing, choice.maxOutputTokens)
}

export type { ChatModel, Provider }
