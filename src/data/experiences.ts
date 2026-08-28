import type { Lang } from '@/i18n/ui'

/* ── Roles ───────────────────────────────────────────────────────────────
   Presented as case studies, not CV entries: each one leads with the
   outcome, backs it with numbers, and keeps the raw bullets behind a
   disclosure for anyone who wants the detail. */

type LocalizedRole = {
  role: string
  period: string
  /** The hook — one sentence, the outcome that mattered. */
  headline: string
  /** Two or three sentences of prose, written to be read aloud. */
  narrative: string
  /** Short capability labels, 3–5 of them. */
  focus: string[]
  stats: { value: string; label: string }[]
  /** Verbatim CV bullets, shown on demand. */
  bullets: string[]
}

export type Role = {
  id: string
  org: string
  orgUrl?: string
  logo?: string
  location: string
  start: number
  /** `null` means current. */
  end: number | null
  tags: string[]
} & Record<Lang, LocalizedRole>

export const roles: Role[] = [
  {
    id: 'hiphen',
    org: 'Hiphen',
    orgUrl: 'https://www.hiphen-plant.com',
    logo: '/logos/hiphen.webp',
    location: 'Avignon, France',
    start: 2024,
    end: null,
    tags: ['PyTorch', 'OpenCV', 'Open3D', 'LiDAR', 'Docker', 'Celery', 'AWS S3', 'Grafana'],
    en: {
      role: 'Computer Vision Engineer',
      period: '2024 - Present',
      headline: 'The computer vision behind a full season of crop field data.',
      narrative:
        'I build and maintain the computer-vision pipelines that turn raw field captures (RGB, multispectral, thermal, LiDAR, stereovision) into plant traits agronomists can act on. I own client projects end to end, from sensor calibration through to the distributed workers that process and deliver the data, and sit in a cross-functional product squad shaping what gets built next.',
      focus: [
        'Multisensor pipelines',
        '3D point clouds',
        'Deep learning',
        'Automation at scale',
        'Client delivery',
      ],
      stats: [
        { value: '~1 yr → ~10 d', label: 'processing time per campaign' },
        { value: 'LAI, NDVI, height, volume', label: 'plant traits extracted' },
      ],
      bullets: [
        'Optimize and maintain existing processing pipelines based on cameras (RGB, multispectral, thermal) and 3D sensors (LiDAR, stereovision)',
        'Develop plant trait extraction modules (volume, height, LAI, NDVI, plant/ear counting) using classical methods (morphology, geometric computation on point clouds) and deep learning',
        'Set up an automated processing pipeline reducing annual campaign processing time from ~1 year to ~10 days',
        'Lead client projects end to end, from sensor calibration to deployment of workers automating data processing and delivery',
        'Part of a cross-functional product squad: planning and prioritizing initiatives, estimating development effort and assessing feasibility vs. business value',
        'Collaborate with international partners: UM6P, ICARDA (Morocco), INRAE, MHCS',
      ],
    },
    fr: {
      role: 'Ingénieure Computer Vision',
      period: '2024 - Présent',
      headline: 'La vision par ordinateur derrière une saison complète de données de terrain.',
      narrative:
        'Je développe et maintiens les chaînes de traitement qui transforment les acquisitions terrain (RGB, multispectral, thermique, LiDAR, stéréovision) en traits végétaux exploitables par les agronomes. Je pilote les projets clients de bout en bout, de la calibration capteurs aux workers distribués qui traitent et livrent les données, au sein d’un product squad transverse qui décide de ce qu’on construit ensuite.',
      focus: [
        'Pipelines multi-capteurs',
        'Nuages de points 3D',
        'Deep learning',
        'Automatisation à l’échelle',
        'Livraison client',
      ],
      stats: [
        { value: '~1 an → ~10 j', label: 'de traitement par campagne' },
        { value: 'LAI, NDVI, hauteur, volume', label: 'traits végétaux extraits' },
      ],
      bullets: [
        'Optimiser et maintenir les chaînes de traitement existantes basées sur des caméras (RGB, multispectral, thermique) et des capteurs 3D (LiDAR, stéréovision)',
        'Développer des modules d’extraction de traits végétaux (volume, hauteur, LAI, NDVI, comptage de plantes/épis) via des méthodes classiques (morphologie, calcul géométrique sur nuages de points) et deep learning',
        'Mettre en place un pipeline de traitement automatique réduisant le temps de traitement d’une campagne annuelle de ~1 an à ~10 jours',
        'Piloter des projets clients de A à Z, de la calibration capteurs au déploiement de workers automatisant le traitement et la livraison des données',
        'Membre d’un cross-functional product squad : priorisation des initiatives, chiffrage des efforts de développement et évaluation de leur pertinence métier',
        'Collaborer avec des partenaires internationaux : UM6P, ICARDA (Maroc), INRAE, MHCS',
      ],
    },
  },
  {
    id: 'expleo',
    org: 'Expleo',
    orgUrl: 'https://expleo.com',
    logo: '/logos/expleo.png',
    location: 'Toulouse, France',
    start: 2023,
    end: 2023,
    tags: ['YOLOv5', 'YOLOv8', 'PyTorch', 'OpenCV', 'Docker', 'Python'],
    en: {
      role: 'Data Scientist / Computer Vision Intern',
      period: 'Feb. - Aug. 2023',
      headline: 'Object detection for defect inspection on a pharmaceutical line.',
      narrative:
        'A solo project inside Expleo’s Innovation department: benchmark object-detection models for anomaly detection on syringe images, build the dataset and augmentation pipeline behind them, and hand over the result as a container ready for production.',
      focus: ['Object detection', 'Dataset engineering', 'Containerized delivery'],
      stats: [
        { value: '98%', label: 'detection accuracy' },
        { value: 'YOLOv5 / v8', label: 'models benchmarked' },
        { value: '6 mo', label: 'run independently' },
      ],
      bullets: [
        'Implementation and benchmarking of object detection models (YOLOv5, YOLOv8) for anomaly/non-anomaly classification on syringe images: 98% accuracy achieved',
        'Preprocessing of pharmaceutical image dataset and data augmentation pipeline',
        'Model containerization with Docker for production delivery',
        'Project led independently within the Innovation department',
      ],
    },
    fr: {
      role: 'Stagiaire Data Scientist / Computer Vision',
      period: 'Fév. - Août 2023',
      headline: 'Détection d’objets pour l’inspection de défauts sur une ligne pharmaceutique.',
      narrative:
        'Projet mené en autonomie au sein du département Innovation d’Expleo : benchmarker des modèles de détection d’objets pour repérer les anomalies sur des images de seringues, construire le dataset et le pipeline d’augmentation associés, et livrer le modèle conteneurisé prêt pour la production.',
      focus: ['Détection d’objets', 'Ingénierie de dataset', 'Livraison conteneurisée'],
      stats: [
        { value: '98 %', label: 'de précision' },
        { value: 'YOLOv5 / v8', label: 'modèles benchmarkés' },
        { value: '6 mois', label: 'en autonomie' },
      ],
      bullets: [
        'Implémentation et benchmark de modèles de détection d’objets (YOLOv5, YOLOv8) pour la classification anomalie/non-anomalie sur images de seringues : 98 % de précision atteinte',
        'Prétraitement du dataset d’images pharmaceutiques et pipeline d’augmentation de données',
        'Conteneurisation du modèle avec Docker pour livraison en production',
        'Projet mené en autonomie au sein du département Innovation',
      ],
    },
  },
]

/* ── Education ───────────────────────────────────────────────────────────
   Deliberately quiet: a portfolio shows work first, credentials second. */

type LocalizedEducation = {
  degree: string
  period: string
  note: string
}

export type Education = {
  id: string
  org: string
  orgUrl?: string
  logo?: string
  location: string
  start: number
  end: number
} & Record<Lang, LocalizedEducation>

export const education: Education[] = [
  {
    id: 'master',
    org: 'Université Toulouse Paul Sabatier',
    orgUrl: 'https://www.univ-tlse3.fr',
    logo: '/logos/paul_sab.jpg',
    location: 'Toulouse, France',
    start: 2021,
    end: 2023,
    en: {
      degree: 'Master’s in Signal, Image and Machine Learning',
      period: '2021 - 2023',
      note: 'Signal, image and video processing systems, with a focus on applied machine learning.',
    },
    fr: {
      degree: 'Master Signal, Image et Apprentissage Automatique',
      period: '2021 - 2023',
      note: 'Systèmes de traitement du signal, de l’image et de la vidéo, spécialisation en machine learning appliqué.',
    },
  },
  {
    id: 'licence',
    org: 'Université Toulouse Paul Sabatier',
    orgUrl: 'https://www.univ-tlse3.fr',
    logo: '/logos/paul_sab.jpg',
    location: 'Toulouse, France',
    start: 2018,
    end: 2021,
    en: {
      degree: 'Bachelor’s in Electronics, Electrical Energy and Automation',
      period: '2018 - 2021',
      note: '',
    },
    fr: {
      degree: 'Licence EEA (Électronique, Énergie Électrique, Automatique)',
      period: '2018 - 2021',
      note: '',
    },
  },
]
