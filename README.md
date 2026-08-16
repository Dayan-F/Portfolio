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
│   ├── sections/  # Hero, Work, Projects, Background, Contact
│   ├── layout/    # Navbar, Footer
│   └── ui/        # reusable pieces
├── context/       # theme + language providers
└── hooks/
```

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
