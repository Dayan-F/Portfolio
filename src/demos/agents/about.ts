import type { Lang } from '@/i18n/ui'

/**
 * The playground described in its own words, added to the retrieval corpus so
 * that asking it how it works returns something grounded rather than the model
 * guessing at its own architecture.
 */

export type AboutDoc = {
  id: string
  section: string
  text: string
}

export const aboutDocs: Record<Lang, AboutDoc[]> = {
  en: [
    {
      id: 'about:overview',
      section: 'what this is',
      text: 'This playground is a live multi-agent system running entirely in the visitor\'s browser. A supervisor agent reads the task and decides which of three workers should act next: a researcher, an analyst, or a writer. Control returns to the supervisor after every worker turn, so the path through the graph is decided as the task unfolds rather than being a fixed pipeline.',
    },
    {
      id: 'about:supervisor',
      section: 'the supervisor',
      text: 'The supervisor never does the work itself. It is asked for a routing decision using structured outputs, so it returns a typed object naming the next worker, the exact subtask for that worker, and a one line reason. That reason is what appears on the arrows in the graph. Workers cannot see the supervisor conversation or each other, so each subtask has to carry everything needed to act on it.',
    },
    {
      id: 'about:workers',
      section: 'the three workers',
      text: 'The researcher looks things up and reports findings with sources; it has portfolio search, Wikipedia search and article reading, and live weather. The analyst reasons over what was gathered and does exact arithmetic with a calculator, and it is the node whose summarised reasoning is shown on screen. The writer has no tools at all and produces the final answer purely from the notes the others gathered. Giving every agent every tool is the usual way a graph like this collapses into one confused loop.',
    },
    {
      id: 'about:tools',
      section: 'the tools',
      text: 'None of the tools are mocked. Portfolio search is BM25 ranking over the real typed data behind this site. Wikipedia and Open-Meteo are live public endpoints that allow browser requests, so they need no key of their own. The calculator is a hand-written expression parser rather than the model doing arithmetic in its head, and it refuses anything that is not arithmetic.',
    },
    {
      id: 'about:transparency',
      section: 'the graph and the trace',
      text: 'Nothing on screen runs on a timer. The runtime is an async generator that emits an event for every step: entering a node, streaming a token, calling a tool, receiving a result, routing an edge. The diagram, the trace log and the answer panel are all projections of that same event stream, so what is drawn is what actually happened.',
    },
    {
      id: 'about:keys',
      section: 'keys and cost',
      text: 'There is no server and no key belonging to the site. The visitor brings their own key from Anthropic or Groq, and which provider it is gets read from the key prefix rather than asked for. The key is held in session storage for that tab only and is sent only to that provider. Because the visitor pays, runs are capped at six supervisor turns with a token ceiling per node, a Stop button aborts the request in flight, and a running estimate of tokens and cost is shown.',
    },
    {
      id: 'about:providers',
      section: 'provider adapters',
      text: 'The graph and the tool loop are written against one small interface with two methods, a streamed turn and a JSON-constrained turn. Each provider is a single adapter behind that interface: Anthropic through its official SDK, Groq through the OpenAI-compatible REST API over fetch. Only models supporting both tool use and strict JSON schema output are offered, so the supervisor behaves the same whichever key is used.',
    },
  ],
  fr: [
    {
      id: 'about:overview',
      section: 'ce que c\'est',
      text: "Ce bac à sable est un système multi-agents qui tourne entièrement dans le navigateur du visiteur. Un agent superviseur lit la tâche et décide lequel des trois agents doit intervenir : un chercheur, un analyste ou un rédacteur. Le contrôle revient au superviseur après chaque tour, donc le chemin dans le graphe se décide au fil de la tâche plutôt que d'être un pipeline figé.",
    },
    {
      id: 'about:supervisor',
      section: 'le superviseur',
      text: "Le superviseur ne fait jamais le travail lui-même. Sa décision de routage passe par les sorties structurées : il renvoie un objet typé nommant l'agent suivant, la sous-tâche exacte et une raison en une ligne. C'est cette raison qui s'affiche sur les flèches du graphe. Les agents ne voient ni la conversation du superviseur ni les autres, donc chaque sous-tâche doit être autonome.",
    },
    {
      id: 'about:workers',
      section: 'les trois agents',
      text: "Le chercheur cherche et rapporte ses trouvailles avec leurs sources ; il dispose de la recherche dans le portfolio, de Wikipédia et de la météo en direct. L'analyste raisonne sur ce qui a été rassemblé et calcule exactement avec une calculatrice, et c'est le nœud dont le raisonnement résumé s'affiche à l'écran. Le rédacteur n'a aucun outil et produit la réponse finale uniquement à partir des notes. Donner tous les outils à tous les agents est la façon classique de transformer un tel graphe en boucle confuse.",
    },
    {
      id: 'about:tools',
      section: 'les outils',
      text: "Aucun outil n'est simulé. La recherche dans le portfolio est un classement BM25 sur les vraies données typées de ce site. Wikipédia et Open-Meteo sont des endpoints publics en direct qui acceptent les requêtes navigateur, sans clé propre. La calculatrice est un parseur d'expressions écrit à la main plutôt qu'un calcul mental du modèle, et elle refuse tout ce qui n'est pas de l'arithmétique.",
    },
    {
      id: 'about:transparency',
      section: 'le graphe et la trace',
      text: "Rien à l'écran n'est minuté. Le moteur est un générateur asynchrone qui émet un événement à chaque étape : entrée dans un nœud, token streamé, appel d'outil, résultat reçu, arête empruntée. Le schéma, la trace et la réponse sont tous des projections de ce même flux d'événements, donc ce qui est dessiné est ce qui s'est réellement passé.",
    },
    {
      id: 'about:keys',
      section: 'clés et coût',
      text: "Il n'y a aucun serveur ni aucune clé appartenant au site. Le visiteur apporte sa propre clé Anthropic ou Groq, et le fournisseur est déduit du préfixe de la clé plutôt que demandé. La clé reste en stockage de session pour cet onglet uniquement et n'est envoyée qu'à ce fournisseur. Comme c'est le visiteur qui paie, les exécutions sont limitées à six tours de superviseur avec un plafond de tokens par nœud, un bouton Arrêter interrompt la requête en cours, et une estimation des tokens et du coût s'affiche en continu.",
    },
    {
      id: 'about:providers',
      section: 'adaptateurs de fournisseurs',
      text: "Le graphe et la boucle d'outils sont écrits sur une seule petite interface à deux méthodes : un tour streamé et un tour contraint en JSON. Chaque fournisseur n'est qu'un adaptateur derrière cette interface : Anthropic via son SDK officiel, Groq via l'API REST compatible OpenAI avec fetch. Seuls les modèles gérant à la fois les outils et le JSON schema strict sont proposés, pour que le superviseur se comporte pareil quelle que soit la clé.",
    },
  ],
}
