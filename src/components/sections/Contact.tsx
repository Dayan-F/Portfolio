import { ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react'
import SectionWrapper from '@/components/ui/SectionWrapper'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import { profile } from '@/data/profile'
import { useLang } from '@/hooks/useLang'

export default function Contact() {
  const { t } = useLang()

  const channels = [
    { href: `mailto:${profile.email}`, label: profile.email, Icon: Mail, external: false },
    { href: profile.linkedin, label: profile.linkedinLabel, Icon: Linkedin, external: true },
    { href: profile.github, label: profile.githubLabel, Icon: Github, external: true },
  ]

  return (
    <SectionWrapper id="contact">
      <SectionHeading
        index="04"
        title={t.contact.title}
        caption={t.contact.caption}
        lead={t.contact.lead}
      />

      <Reveal>
        <ul className="border-t border-border">
          {channels.map(({ href, label, Icon, external }) => (
            <li key={href}>
              <a
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer noopener' : undefined}
                className="group flex items-center gap-4 border-b border-border py-5 transition-colors hover:text-accent"
              >
                <Icon size={18} className="shrink-0 text-faint transition-colors group-hover:text-accent" />
                <span className="min-w-0 flex-1 truncate font-display text-lg font-medium">
                  {label}
                </span>
                <ArrowUpRight
                  size={16}
                  className="shrink-0 text-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                />
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </SectionWrapper>
  )
}
