import { motion } from 'framer-motion'
import { ArrowDown, ArrowUpRight, Github, Linkedin, Mail, Play } from 'lucide-react'
import PointField from '@/components/ui/PointField'
import DetectionFrame from '@/components/ui/DetectionFrame'
import { profile } from '@/data/profile'
import { roles } from '@/data/experiences'
import { featuredDemo } from '@/data/projects'
import { useLang } from '@/hooks/useLang'

const SOCIALS = [
  { key: 'github', href: profile.github, Icon: Github },
  { key: 'linkedin', href: profile.linkedin, Icon: Linkedin },
  { key: 'mail', href: `mailto:${profile.email}`, Icon: Mail },
]

const rise = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function Hero() {
  const { lang, t } = useLang()
  const current = roles.find((role) => role.end === null)

  return (
    <section id="top" className="relative overflow-hidden">
      <PointField className="pointer-events-none absolute inset-0 h-full w-full [mask-image:radial-gradient(70%_60%_at_50%_35%,black,transparent)]" />

      <div className="relative mx-auto grid w-full max-w-5xl gap-12 px-5 pt-20 pb-16 sm:px-8 sm:pt-28 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-16 lg:pt-32 lg:pb-24">
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.08, delayChildren: 0.05 }}
        >
          <motion.div variants={rise} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 font-mono text-[11px] text-muted backdrop-blur-sm">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
              </span>
              {t.hero.available}
            </span>
          </motion.div>

          <motion.h1
            variants={rise}
            transition={{ duration: 0.5 }}
            className="mt-6 font-display text-[clamp(2.75rem,8vw,4.75rem)] leading-[0.95] font-semibold tracking-[-0.03em] text-balance"
          >
            {profile.name}
          </motion.h1>

          <motion.p
            variants={rise}
            transition={{ duration: 0.5 }}
            className="mt-4 font-display text-xl text-accent sm:text-2xl"
          >
            {profile.title[lang]}
          </motion.p>

          <motion.p
            variants={rise}
            transition={{ duration: 0.5 }}
            className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted"
          >
            {profile.summary[lang]}
          </motion.p>

          <motion.div
            variants={rise}
            transition={{ duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <a
              href="#work"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
            >
              {t.hero.cta}
              <ArrowDown size={15} className="transition-transform group-hover:translate-y-0.5" />
            </a>

            {featuredDemo?.demo && (
              <a
                href={featuredDemo.demo}
                target="_blank"
                rel="noreferrer noopener"
                className="group inline-flex items-center gap-2 rounded-full border border-accent px-5 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent-soft"
              >
                <Play size={13} className="fill-current" />
                {t.hero.demo}
                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            )}

            <div className="flex items-center gap-2">
              {SOCIALS.map(({ key, href, Icon }) => (
                <a
                  key={key}
                  href={href}
                  target={href.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noreferrer noopener"
                  aria-label={key}
                  className="grid size-10 place-items-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </motion.div>

          <motion.dl
            variants={rise}
            transition={{ duration: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-xs text-faint"
          >
            <div className="flex items-center gap-2">
              <dt className="text-faint">{t.hero.now}</dt>
              <dd className="text-ink">{current?.org ?? 'n/a'}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Location</dt>
              <dd className="text-ink">{profile.location}</dd>
            </div>
          </motion.dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="order-first mx-auto w-full max-w-[220px] lg:order-none lg:max-w-none"
        >
          <DetectionFrame label="engineer 0.99" active className="p-3">
            <img
              src={profile.photo}
              alt={t.a11y.portrait}
              className="aspect-square w-full rounded-lg object-cover"
            />
          </DetectionFrame>
        </motion.div>
      </div>
    </section>
  )
}
