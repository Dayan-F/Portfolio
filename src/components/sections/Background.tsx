import SectionWrapper from '@/components/ui/SectionWrapper'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import { education } from '@/data/experiences'
import { useLang } from '@/hooks/useLang'

export default function Background() {
  const { lang, t } = useLang()

  return (
    <SectionWrapper id="background">
      <SectionHeading
        index="03"
        title={t.background.title}
        caption={t.background.caption}
        lead={t.background.lead}
      />

      <ul className="border-t border-border">
        {education.map((item, index) => {
          const content = item[lang]

          return (
            <Reveal as="li" key={item.id} delay={index * 0.06}>
              <div className="group grid gap-2 border-b border-border py-6 sm:grid-cols-[7rem_1fr] sm:gap-8 sm:py-7">
                <span className="font-mono text-xs text-faint transition-colors group-hover:text-accent">
                  {content.period}
                </span>

                <div className="flex items-start gap-4">
                  {item.logo && (
                    <img
                      src={item.logo}
                      alt=""
                      loading="lazy"
                      className="mt-0.5 size-9 shrink-0 rounded-md border border-border bg-white object-contain p-0.5 opacity-80 transition-opacity group-hover:opacity-100"
                    />
                  )}
                  <div className="min-w-0">
                    <h3 className="font-display text-base leading-snug font-medium text-ink">
                      {content.degree}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {item.orgUrl ? (
                        <a
                          href={item.orgUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="underline decoration-border underline-offset-4 transition-colors hover:decoration-accent"
                        >
                          {item.org}
                        </a>
                      ) : (
                        item.org
                      )}
                      <span className="text-faint"> · {item.location}</span>
                    </p>
                    {content.note && (
                      <p className="mt-2 max-w-xl text-sm text-muted">{content.note}</p>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          )
        })}
      </ul>
    </SectionWrapper>
  )
}
