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
    en: 'Computer Vision & AI Engineer with 2+ years of experience in deep learning, multisensor data processing (RGB, LiDAR, multispectral, thermal), and automated pipeline development. Hands-on experience integrating generative AI solutions and agentic workflows (LangChain, LangGraph, RAG) within the company.',
    fr: 'Ingénieure en vision par ordinateur et IA avec 2+ ans d’expérience en deep learning, traitement de données multi-capteurs (RGB, LiDAR, multispectral, thermique) et développement de pipelines automatisés. Expérience concrète dans l’intégration de solutions d’IA générative et de workflows agentiques (LangChain, LangGraph, RAG) au sein de l’entreprise.',
  } satisfies Record<Lang, string>,
}
