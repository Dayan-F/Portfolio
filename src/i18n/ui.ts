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
    },
    projects: {
      title: 'Things I build',
      caption: 'Built and shipped',
      lead: 'Where I am taking the agent and LLM work: running code, not slideware. The first one runs right here on this page.',
      live: 'Live demo',
      open: 'Open the playground',
      source: 'Source',
      liveBadge: 'Live',
      interactiveBadge: 'Interactive',
    },
    work: {
      title: 'Experience',
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
    demos: {
      menu: {
        here: 'Runs on this page, bring your own key',
        hosted: 'Deployed app',
      },
      agents: {
        title: 'Agent graph playground',
        subtitle: 'A supervisor, three workers, real tools, running in your browser.',
        back: 'Back to the portfolio',
        key: {
          label: 'API key (Anthropic or Groq)',
          placeholder: 'sk-ant-... or gsk_...',
          save: 'Use this key',
          forget: 'Forget key',
          note: 'Your key stays in this tab and is sent only to the provider it belongs to. It is held in session storage, so closing the tab discards it. There is no server in this demo.',
          unknown: 'That does not look like an Anthropic or Groq key. Anthropic keys start with sk-ant-, Groq keys start with gsk_.',
          get: 'Need one?',
          missing: 'Add an Anthropic or Groq API key to run a task.',
          help: 'Everything below works without a key. You need one only to run a task, and the calls are billed to you.',
          active: 'Key loaded for this tab',
        },
        model: {
          label: 'Model',
          retired:
            'Some models this demo was built against are no longer offered on your key. The list shows what is actually available.',
          discovered:
            'None of the models this demo was built against are available on your key, so this list came straight from the provider. These are unverified for tool use and strict JSON output, and carry no published price.',
        },
        run: 'Run',
        stop: 'Stop',
        prompt: {
          label: 'Task',
          placeholder: 'Ask for something that needs looking up, working out, or both.',
          examples: 'Try one of these',
        },
        graph: {
          title: 'Graph',
          supervisor: 'supervisor',
          researcher: 'researcher',
          analyst: 'analyst',
          writer: 'writer',
        },
        trace: {
          title: 'Trace',
          empty: 'Every routing decision and tool call will appear here as it happens.',
          took: 'took',
          failed: 'failed',
        },
        answer: {
          title: 'Answer',
          empty: 'The writer streams the final answer here once the team has what it needs.',
        },
        meter: {
          tokens: 'tokens',
          cost: 'est. cost',
        },
        tools: {
          title: 'Tools the agents can actually call',
          lead: 'No mocked responses. These are live endpoints and local functions, all reachable from the browser without a key of their own.',
          portfolio: 'Ranked passages from the real portfolio data behind this site, using BM25.',
          wikipedia: 'Searches English Wikipedia and reads article summaries.',
          weather: 'Live conditions and forecast from Open-Meteo, by place name.',
          calculator: 'Exact arithmetic through a parser, not the model guessing.',
        },
        about: {
          title: 'How this works',
          p1: 'The supervisor is asked for a routing decision using structured outputs, so it returns a typed object rather than prose that has to be parsed. That object names the next worker, the exact subtask, and a one line reason. The reason is what you see on the arrows.',
          p2: 'Each worker gets its own system prompt and only the tools its job needs. The researcher can search and look things up, the analyst gets a calculator, the writer gets none and works purely from the notes. Handing every agent every tool is the usual way a graph like this turns into one confused loop.',
          p3: 'The tool loop is written by hand rather than with the SDK helper, because each step has to surface as an event the diagram can draw. Nothing on screen is on a timer: the graph, the trace and the answer are all projections of the same event stream that the run actually produced.',
          p4: 'Runs are capped at six supervisor turns with a token ceiling per node, and Stop aborts the request in flight. That matters more than usual here, because the key paying for it is yours.',
          p5: 'Anthropic and Groq both work, and which one you get is read from the key prefix rather than asked for. The graph and the tool loop are written against one small interface, so each provider is a single adapter behind it: one uses the Anthropic SDK, the other speaks the OpenAI-compatible REST API over fetch. Only models that support both tool use and strict JSON schema output are offered, so the supervisor behaves the same either way.',
        },
      },
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
    },
    projects: {
      title: 'Ce que je construis',
      caption: 'Conçus et livrés',
      lead: 'Où je pousse le travail sur les agents et les LLM : du code qui tourne, pas des slides. Le premier tourne directement sur cette page.',
      live: 'Démo live',
      open: 'Ouvrir le bac à sable',
      source: 'Code source',
      liveBadge: 'En ligne',
      interactiveBadge: 'Interactif',
    },
    work: {
      title: 'Expérience',
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
    demos: {
      menu: {
        here: 'Tourne sur cette page, avec votre clé',
        hosted: 'Application déployée',
      },
      agents: {
        title: "Bac à sable d'agents",
        subtitle: 'Un superviseur, trois agents, de vrais outils, dans votre navigateur.',
        back: 'Retour au portfolio',
        key: {
          label: 'Clé API (Anthropic ou Groq)',
          placeholder: 'sk-ant-... ou gsk_...',
          save: 'Utiliser cette clé',
          forget: 'Oublier la clé',
          note: "Votre clé reste dans cet onglet et n'est envoyée qu'au fournisseur auquel elle appartient. Elle est stockée en session, donc fermer l'onglet l'efface. Cette démo n'a aucun serveur.",
          unknown: "Cela ne ressemble pas à une clé Anthropic ou Groq. Les clés Anthropic commencent par sk-ant-, celles de Groq par gsk_.",
          get: "Besoin d'une clé ?",
          missing: 'Ajoutez une clé API Anthropic ou Groq pour lancer une tâche.',
          help: "Tout ce qui suit fonctionne sans clé. Elle ne sert qu'à lancer une tâche, et les appels vous sont facturés.",
          active: 'Clé chargée pour cet onglet',
        },
        model: {
          label: 'Modèle',
          retired:
            "Certains modèles pour lesquels cette démo a été écrite ne sont plus proposés avec votre clé. La liste montre ce qui est réellement disponible.",
          discovered:
            "Aucun des modèles pour lesquels cette démo a été écrite n'est disponible avec votre clé, donc cette liste vient directement du fournisseur. Ils ne sont pas vérifiés pour les outils et le JSON strict, et aucun prix n'est publié.",
        },
        run: 'Lancer',
        stop: 'Arrêter',
        prompt: {
          label: 'Tâche',
          placeholder: 'Demandez quelque chose qui demande une recherche, un calcul, ou les deux.',
          examples: 'Essayez par exemple',
        },
        graph: {
          title: 'Graphe',
          supervisor: 'superviseur',
          researcher: 'chercheur',
          analyst: 'analyste',
          writer: 'rédacteur',
        },
        trace: {
          title: 'Trace',
          empty: "Chaque décision de routage et chaque appel d'outil apparaîtra ici en direct.",
          took: 'en',
          failed: 'échec',
        },
        answer: {
          title: 'Réponse',
          empty: "Le rédacteur écrit ici la réponse finale une fois que l'équipe a ce qu'il lui faut.",
        },
        meter: {
          tokens: 'tokens',
          cost: 'coût est.',
        },
        tools: {
          title: 'Les outils que les agents peuvent réellement appeler',
          lead: "Aucune réponse simulée. Ce sont de vrais endpoints et de vraies fonctions locales, tous accessibles depuis le navigateur sans clé propre.",
          portfolio: 'Passages classés issus des données réelles de ce site, via BM25.',
          wikipedia: "Recherche sur Wikipédia en anglais et lecture des résumés d'articles.",
          weather: 'Conditions et prévisions en direct depuis Open-Meteo, par nom de lieu.',
          calculator: 'Arithmétique exacte via un parseur, pas une estimation du modèle.',
        },
        about: {
          title: 'Comment ça marche',
          p1: "Le superviseur renvoie sa décision de routage via les sorties structurées : un objet typé plutôt qu'un texte à parser. Cet objet nomme l'agent suivant, la sous-tâche exacte et une raison en une ligne. C'est cette raison qui s'affiche sur les flèches.",
          p2: "Chaque agent a son propre prompt système et uniquement les outils utiles à son rôle. Le chercheur peut chercher, l'analyste dispose d'une calculatrice, le rédacteur n'a aucun outil et travaille seulement à partir des notes. Donner tous les outils à tous les agents est la façon classique de transformer un graphe comme celui-ci en une boucle confuse.",
          p3: "La boucle d'outils est écrite à la main plutôt qu'avec l'assistant du SDK, car chaque étape doit produire un événement que le schéma peut dessiner. Rien à l'écran n'est minuté : le graphe, la trace et la réponse sont tous des projections du même flux d'événements réellement produit par l'exécution.",
          p4: "Les exécutions sont limitées à six tours de superviseur, avec un plafond de tokens par agent, et Arrêter interrompt la requête en cours. Cela compte plus que d'habitude ici, puisque la clé qui paie est la vôtre.",
          p5: "Anthropic et Groq fonctionnent tous les deux, et le fournisseur est déduit du préfixe de la clé plutôt que demandé. Le graphe et la boucle d'outils sont écrits sur une seule petite interface : chaque fournisseur n'est qu'un adaptateur derrière elle, l'un via le SDK Anthropic, l'autre en REST compatible OpenAI avec fetch. Seuls les modèles gérant à la fois les outils et le JSON schema strict sont proposés, pour que le superviseur se comporte de la même façon des deux côtés.",
        },
      },
    },
    a11y: {
      toggleTheme: 'Changer de thème',
      toggleLang: 'Changer de langue',
      portrait: 'Portrait de Dayan Fatayri',
    },
  },
} as const

export type UI = (typeof ui)['en']
