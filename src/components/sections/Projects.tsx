import SectionWrapper from '@/components/ui/SectionWrapper'
import SectionHeading from '@/components/ui/SectionHeading'
import ProjectCard from '@/components/ui/ProjectCard'
import Reveal from '@/components/ui/Reveal'
import { projects } from '@/data/projects'
import { useLang } from '@/hooks/useLang'

export default function Projects() {
  const { t } = useLang()

  return (
    <SectionWrapper id="projects">
      <SectionHeading
        index="02"
        title={t.projects.title}
        caption={t.projects.caption}
        lead={t.projects.lead}
      />

      <ul className="grid gap-6 md:grid-cols-2">
        {projects.map((project, index) => (
          <Reveal
            as="li"
            key={project.id}
            delay={index * 0.08}
            /* The one that runs on this page leads, full width: it is the only
               project a visitor can try without going anywhere. */
            className={project.route ? 'h-full md:col-span-2' : 'h-full'}
          >
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </ul>
    </SectionWrapper>
  )
}
