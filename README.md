# Portfolio

Personal portfolio of Dayan Fatayri, Computer Vision & AI Engineer.

Bilingual (EN/FR), light and dark themes, content driven from typed data files.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion

## Getting started

```bash
npm install
npm run dev      # dev server
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
```

## Structure

```
src/
├── data/          # all page content lives here, typed and bilingual
│   ├── profile.ts       # name, title, summary, contact links
│   ├── experiences.ts   # roles (as case studies) + education
│   └── projects.ts      # side projects, demo + source links
├── i18n/ui.ts     # UI chrome strings (EN/FR)
├── components/
│   ├── sections/  # Hero, Work, Projects, Demos, Background, Contact
│   ├── layout/    # Navbar, Footer
│   └── ui/        # reusable pieces
├── demos/agents/  # the agent graph playground (lazy-loaded route)
├── context/       # theme + language providers
└── hooks/
```

## The agent graph playground

`/#/demo/agents` is a working multi-agent system, not a mock. A supervisor node
returns a routing decision via structured outputs, worker nodes call real tools
through a hand-written tool loop, and the diagram, trace and answer are all
projections of the same event stream the run emits.

```
demos/agents/
├── graph.ts        # the runtime: an async generator of RunEvents
├── nodes.ts        # supervisor / researcher / analyst / writer
├── llm.ts          # the provider-neutral tool loop
├── runState.ts     # reducer turning RunEvents into what is on screen
├── providers/      # one small ChatModel interface, one adapter per provider
│   ├── anthropic.ts    # via @anthropic-ai/sdk
│   └── groq.ts         # via the OpenAI-compatible REST API over fetch
└── tools/          # portfolio search (BM25), Wikipedia, weather, calculator
```

**Bring your own key, Anthropic or Groq.** There is no server and no key of
ours. A visitor pastes their own key, it is kept in `sessionStorage` for that
tab only, and it goes nowhere except that provider's API. Everything except
running a task works without one. Calls are billed to whoever supplied the key,
so runs are capped at six supervisor turns with a per-node token ceiling, and
Stop aborts the request in flight.

The provider is read from the key prefix (`sk-ant-` or `gsk_`) rather than
asked for. The graph and the tool loop only know the `ChatModel` interface in
`providers/types.ts`, so adding a provider means writing one adapter and adding
a row to `MODELS`. Only models supporting both tool use and strict JSON schema
output are listed, so the supervisor's structured routing behaves the same
whichever key a visitor brings.

The tools are real and need no keys of their own: Wikipedia and Open-Meteo both
allow browser origins, and portfolio search is BM25 over the same `src/data`
files the page renders, so the agent answers from the real record.

## Routing

`HashRouter`, so the built site works on any static host with no SPA fallback
config. One consequence: the URL hash belongs to the router, so in-page section
links go through `sectionLinkHandler` in `src/lib/scrollToSection.ts` rather
than changing the hash themselves.

### Editing content

Content is separate from presentation. To update the page, edit `src/data/*`
rather than the components:

- **Add a role** → append to `roles` in `experiences.ts`. Each entry carries an
  `en` and `fr` block with a headline, narrative, stats and bullets.
- **Add a project** → append to `projects` in `projects.ts`. Include a `demo`
  URL and the card automatically gets a "Live" badge and a demo button; the
  first project with a `demo` is also surfaced in the hero and navbar.
- **Set the current role** → `end: null` marks a role as ongoing, which drives
  the "Currently at" line and the live indicator.

## Theming

Design tokens are CSS custom properties defined once per theme in
`src/index.css`, exposed to Tailwind via `@theme inline`. Components use token
names (`text-muted`, `bg-surface`) and need no `dark:` variants.
