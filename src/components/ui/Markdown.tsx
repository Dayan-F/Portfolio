import type { ReactNode } from 'react'

/**
 * A small Markdown subset, rendered to React elements.
 *
 * Models reach for Markdown structure whether or not you ask, and an itinerary
 * or a comparison genuinely reads better with it. Everything becomes React
 * elements rather than injected HTML, so model output can never carry markup
 * into the page, and no renderer dependency lands in the bundle.
 *
 * Supported: headings, bullet and numbered lists, horizontal rules,
 * paragraphs, bold, italic and inline code. Anything else falls through as text.
 */

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(INLINE).filter((part) => part.length > 0)

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`

    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={key} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      )
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={key} className="rounded bg-bg-alt px-1 py-0.5 font-mono text-[0.9em] text-accent">
          {part.slice(1, -1)}
        </code>
      )
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={key} className="italic">
          {part.slice(1, -1)}
        </em>
      )
    }

    return <span key={key}>{part}</span>
  })
}

type Block =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'numbers'; items: string[] }
  | { kind: 'rule' }

const HEADING = /^(#{1,4})\s+(.*)$/
const BULLET = /^\s*[-*+]\s+(.*)$/
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/
const RULE = /^\s*([-*_])\1{2,}\s*$/

export function parseBlocks(source: string): Block[] {
  const blocks: Block[] = []
  const lines = source.replace(/\r\n/g, '\n').split('\n')

  let paragraph: string[] = []

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ kind: 'paragraph', text: paragraph.join(' ').trim() })
      paragraph = []
    }
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]

    if (line.trim().length === 0) {
      flushParagraph()
      continue
    }

    if (RULE.test(line)) {
      flushParagraph()
      blocks.push({ kind: 'rule' })
      continue
    }

    const heading = HEADING.exec(line)
    if (heading) {
      flushParagraph()
      blocks.push({ kind: 'heading', level: heading[1].length, text: heading[2].trim() })
      continue
    }

    // A run of list lines becomes one list, so the gaps between items do not
    // turn into separate single-item lists.
    if (BULLET.test(line) || NUMBERED.test(line)) {
      flushParagraph()
      const numbered = NUMBERED.test(line)
      const items: string[] = []

      while (index < lines.length) {
        const candidate = lines[index]
        const match = numbered ? NUMBERED.exec(candidate) : BULLET.exec(candidate)

        if (match) {
          items.push(match[1].trim())
          index += 1
          continue
        }

        // An indented line that is not itself a bullet continues the item above
        // it, which is how models lay out sub-points under a list entry.
        if (items.length > 0 && /^\s+\S/.test(candidate)) {
          items[items.length - 1] += `\n${candidate.trim()}`
          index += 1
          continue
        }

        break
      }
      index -= 1

      blocks.push(numbered ? { kind: 'numbers', items } : { kind: 'bullets', items })
      continue
    }

    paragraph.push(line.trim())
  }

  flushParagraph()
  return blocks
}

const HEADING_CLASS: Record<number, string> = {
  1: 'font-display text-lg font-semibold tracking-tight',
  2: 'font-display text-base font-semibold tracking-tight',
  3: 'font-display text-sm font-semibold tracking-tight',
  4: 'font-display text-sm font-semibold tracking-tight',
}

export default function Markdown({ source }: { source: string }) {
  const blocks = parseBlocks(source)

  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-muted">
      {blocks.map((block, index) => {
        const key = `block-${index}`

        switch (block.kind) {
          case 'rule':
            return <hr key={key} className="border-border" />

          case 'heading':
            return (
              <h3 key={key} className={`${HEADING_CLASS[block.level]} mt-5 text-ink first:mt-0`}>
                {renderInline(block.text, key)}
              </h3>
            )

          case 'bullets':
            return (
              <ul key={key} className="ml-1 space-y-1.5">
                {block.items.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`} className="flex gap-2.5">
                    <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                    <span className="min-w-0 whitespace-pre-line">{renderInline(item, `${key}-${itemIndex}`)}</span>
                  </li>
                ))}
              </ul>
            )

          case 'numbers':
            return (
              <ol key={key} className="ml-1 space-y-1.5">
                {block.items.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`} className="flex gap-2.5">
                    <span className="mt-px font-mono text-xs text-accent">{itemIndex + 1}.</span>
                    <span className="min-w-0 whitespace-pre-line">{renderInline(item, `${key}-${itemIndex}`)}</span>
                  </li>
                ))}
              </ol>
            )

          default:
            return <p key={key}>{renderInline(block.text, key)}</p>
        }
      })}
    </div>
  )
}
