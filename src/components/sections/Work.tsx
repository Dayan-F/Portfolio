import SectionWrapper from '@/components/ui/SectionWrapper'
import SectionHeading from '@/components/ui/SectionHeading'
import CaseStudy from '@/components/ui/CaseStudy'
import Reveal from '@/components/ui/Reveal'
import { roles } from '@/data/experiences'
import { useLang } from '@/hooks/useLang'

export default function Work() {
  const { t } = useLang()

  return (
    <SectionWrapper id="work">
      <SectionHeading
        index="01"
        title={t.work.title}
        caption={t.work.caption}
        lead={t.work.lead}
      />

      <div>
        {roles.map((role, index) => (
          <Reveal
            key={role.id}
            delay={index * 0.05}
            className={
              index > 0 ? 'mt-20 border-t border-border pt-20 sm:mt-28 sm:pt-28' : undefined
            }
          >
            <CaseStudy role={role} index={index} />
          </Reveal>
        ))}
      </div>
    </SectionWrapper>
  )
}
