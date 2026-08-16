export type Lang = 'fr' | 'en'

export const LANGS: Lang[] = ['en', 'fr']

/** UI chrome only — CV content lives in `src/data`. */
export const ui = {
  en: {
    nav: {
      work: 'Work',
      projects: 'Projects',
      background: 'Background',
      contact: 'Contact',
      demo: 'Live demo',
    },
    hero: {
      available: 'Open to opportunities',
      now: 'Currently at',
      cta: 'See the work',
      demo: 'Try the live demo',
      contact: 'Get in touch',
      scroll: 'Scroll',
    },
    projects: {
      title: 'Things I build',
      caption: 'Side projects, shipped',
      lead: 'Where I am taking the agent and LLM work: running code, not slideware.',
      live: 'Live demo',
      source: 'Source',
      liveBadge: 'Live',
    },
    work: {
      title: 'Selected work',
      caption: 'Two roles, in depth',
      lead: 'What I have shipped, what it changed, and the numbers behind it.',
      details: 'Detailed responsibilities',
      hideDetails: 'Hide responsibilities',
      focus: 'Focus',
      stack: 'Stack',
      current: 'Current',
    },
    background: {
      title: 'Background',
      caption: 'Where it started',
      lead: 'Signal and image processing, before it was a job.',
    },
    contact: {
      title: 'Let’s talk',
      caption: 'Say hello',
      lead: 'Working on computer vision, sensor data or agent-based systems? I’d like to hear about it.',
      email: 'Email me',
    },
    footer: {
      built: 'React · Vite · Tailwind',
      back: 'Back to top',
    },
    a11y: {
      toggleTheme: 'Toggle colour theme',
      toggleLang: 'Switch language',
      portrait: 'Portrait of Dayan Fatayri',
    },
  },
  fr: {
    nav: {
      work: 'Parcours',
      projects: 'Projets',
      background: 'Formation',
      contact: 'Contact',
      demo: 'Démo live',
    },
    hero: {
      available: 'Ouverte aux opportunités',
      now: 'Actuellement chez',
      cta: 'Voir mon travail',
      demo: 'Essayer la démo',
      contact: 'Me contacter',
      scroll: 'Défiler',
    },
    projects: {
      title: 'Ce que je construis',
      caption: 'Projets personnels, en ligne',
      lead: 'Où je pousse le travail sur les agents et les LLM : du code qui tourne, pas des slides.',
      live: 'Démo live',
      source: 'Code source',
      liveBadge: 'En ligne',
    },
    work: {
      title: 'Travaux marquants',
      caption: 'Deux postes, en détail',
      lead: 'Ce que j’ai livré, ce que ça a changé, et les chiffres derrière.',
      details: 'Missions détaillées',
      hideDetails: 'Masquer les missions',
      focus: 'Axes',
      stack: 'Stack',
      current: 'En cours',
    },
    background: {
      title: 'Formation',
      caption: 'Le point de départ',
      lead: 'Traitement du signal et de l’image, avant d’en faire un métier.',
    },
    contact: {
      title: 'Discutons',
      caption: 'Un message',
      lead: 'Un sujet de vision par ordinateur, de données capteurs ou de systèmes à base d’agents ? J’aimerais en entendre parler.',
      email: 'M’écrire',
    },
    footer: {
      built: 'React · Vite · Tailwind',
      back: 'Haut de page',
    },
    a11y: {
      toggleTheme: 'Changer de thème',
      toggleLang: 'Changer de langue',
      portrait: 'Portrait de Dayan Fatayri',
    },
  },
} as const

export type UI = (typeof ui)['en']
