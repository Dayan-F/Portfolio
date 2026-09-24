import type { Lang } from '@/i18n/ui'

export const profile = {
  name: 'Dayan Fatayri',
  email: 'dayanfatayri44@gmail.com',
  phone: '+33 6 65 61 45 57',
  location: 'Paris, France',
  github: 'https://github.com/Dayan-F',
  githubLabel: 'Dayan-F',
  linkedin: 'https://www.linkedin.com/in/dayan-fatayri-357170208',
  linkedinLabel: 'dayan-fatayri',
  photo: '/photo.jpg',
  title: {
    en: 'Computer Vision & AI Engineer',
    fr: 'Ingénieure Vision par Ordinateur & IA',
  } satisfies Record<Lang, string>,
  summary: {
    en: 'Computer Vision & AI Engineer with 3+ years of experience in deep learning, multi-sensor data processing (RGB, LiDAR, multispectral, thermal) and automated pipeline development for agritech. I also build AI agents and custom tools that automate repetitive work across the company.',
    fr: 'Ingénieure en vision par ordinateur et IA avec plus de 3 ans d’expérience en deep learning, traitement de données multi-capteurs (RGB, LiDAR, multispectral, thermique) et développement de pipelines automatisés pour l’agritech. Je développe aussi des agents IA et des outils sur mesure pour automatiser les tâches répétitives au sein de l’entreprise.',
  } satisfies Record<Lang, string>,
}
