import type { Lang } from '@/i18n/ui'

/**
 * Prompts chosen so each one takes a visibly different path through the graph:
 * a multi-worker plan, a self-describing lookup, pure arithmetic, and a single
 * live network call.
 */
export const examples: Record<Lang, string[]> = {
  en: [
    'Plan me a 4 day trip to Paris in September',
    'Explain how this playground works',
    'A flight is 320 euros and a hotel is 95 euros a night for 4 nights. What is the total, and the cost per day?',
    'What is the weather in Lisbon right now, and what should I pack?',
  ],
  fr: [
    'Planifie-moi un voyage de 4 jours à Paris en septembre',
    'Explique comment fonctionne ce bac à sable',
    "Un vol coûte 320 euros et l'hôtel 95 euros par nuit pendant 4 nuits. Quel est le total, et le coût par jour ?",
    'Quel temps fait-il à Lisbonne en ce moment, et que faut-il emporter ?',
  ],
}
