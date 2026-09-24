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
    tags: ['PyTorch', 'OpenCV', 'Open3D', 'LiDAR', 'SAM 3', 'MLflow', 'Docker', 'Celery', 'CI/CD', 'AWS S3', 'Grafana'],
    en: {
      role: 'Computer Vision Engineer',
      period: '2024 - Present',
      headline: 'The computer vision behind a full season of crop field data.',
      narrative:
        'I build and maintain the 2D/3D computer-vision pipelines that turn raw field captures (RGB, multispectral, thermal, LiDAR, stereo vision) into plant traits agronomists can act on. I own client projects end to end, from the mechanical design of the acquisition system and sensor calibration through to the workers that process and deliver the data, and I built the internal platform that runs our deep learning models from data preparation to deployment. I also build agentic tooling for the engineering teams, with AI agents, skills and hooks that automate code review and recurring work.',
      focus: [
        'Multi-sensor pipelines',
        '3D point clouds',
        'Deep learning',
        'MLOps',
        'Client delivery',
        'Agentic tooling',
      ],
      stats: [
        { value: '~1 yr → ~10 d', label: 'processing time per campaign' },
        { value: 'LAI, NDVI, height, volume', label: 'plant traits extracted' },
      ],
      bullets: [
        'Automate campaign processing, cutting annual campaign processing time from ~1 year to ~10 days',
        'Lead client projects end to end, from mechanical design of the acquisition system and sensor selection and calibration to building and deploying processing workers that deliver data to clients automatically',
        'Develop plant trait extraction modules (volume, height, LAI, NDVI, plant and ear counting) using classical methods (morphology, point-cloud geometry) and deep learning (detection, segmentation, disease identification)',
        'Develop an internal web platform that automates the full deep learning model lifecycle, from data preparation and pre-annotation (SAM 3) to training and deployment',
        'Build agentic tooling for engineering teams: custom AI agents, skills and hooks that automate code review and recurring development tasks',
        'Set up CI/CD pipelines on Bitbucket for R&D modules',
        'Optimize and maintain existing multi-sensor processing pipelines: RGB, multispectral and thermal cameras, 3D sensors (LiDAR, stereo vision)',
        'Contribute to a cross-functional product squad: prioritize initiatives, estimate development effort and assess business value',
      ],
    },
    fr: {
      role: 'Ingénieure vision par ordinateur',
      period: '2024 - Présent',
      headline: 'La vision par ordinateur derrière une saison complète de données de terrain.',
      narrative:
        'Je développe et maintiens les chaînes de vision par ordinateur 2D/3D qui transforment les acquisitions terrain (RGB, multispectral, thermique, LiDAR, stéréovision) en traits végétaux exploitables par les agronomes. Je pilote les projets clients de bout en bout, de la conception mécanique du système d’acquisition et de la calibration des capteurs jusqu’aux workers qui traitent et livrent les données, et j’ai développé la plateforme interne qui gère nos modèles deep learning de la préparation des données au déploiement. Je conçois aussi des outils agentiques pour les équipes de développement : agents IA, skills et hooks qui automatisent la revue de code et les tâches récurrentes.',
      focus: [
        'Pipelines multi-capteurs',
        'Nuages de points 3D',
        'Deep learning',
        'MLOps',
        'Livraison client',
        'Outils agentiques',
      ],
      stats: [
        { value: '~1 an → ~10 j', label: 'de traitement par campagne' },
        { value: 'LAI, NDVI, hauteur, volume', label: 'traits végétaux extraits' },
      ],
      bullets: [
        'Automatisation de la chaîne de traitement : temps de traitement d’une campagne annuelle réduit de près d’un an à une dizaine de jours',
        'Pilotage de projets clients de bout en bout : de la conception mécanique du système d’acquisition, du choix et de la calibration des capteurs, jusqu’au développement et au déploiement des workers de traitement qui livrent automatiquement les données au client',
        'Développement de modules d’extraction de traits végétaux (volume, hauteur, LAI, NDVI, comptage de plants et d’épis) par méthodes classiques (morphologie mathématique, géométrie des nuages de points) et deep learning (détection, segmentation, identification de maladies)',
        'Développement d’une plateforme web interne automatisant tout le cycle de vie des modèles deep learning, de la préparation et la pré-annotation des données (SAM 3) jusqu’à l’entraînement et au déploiement',
        'Conception d’outils agentiques pour les équipes de développement : agents IA, skills et hooks qui automatisent la revue de code et les tâches récurrentes',
        'Mise en place de pipelines CI/CD sur Bitbucket pour les modules développés par l’équipe R&D',
        'Optimisation et maintenance des chaînes de traitement multi-capteurs existantes : caméras RGB, multispectrales et thermiques, capteurs 3D (LiDAR, stéréovision)',
        'Membre d’une équipe produit pluridisciplinaire : priorisation des initiatives, chiffrage des développements et évaluation de leur valeur métier',
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
      role: 'Data Scientist Intern – Computer Vision',
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
        'Implemented and benchmarked YOLOv5 and YOLOv8 models for defect detection on syringe images, reaching 98% accuracy',
        'Preprocessed the pharmaceutical image dataset and built a data augmentation pipeline',
        'Containerized the model with Docker for production delivery',
      ],
    },
    fr: {
      role: 'Stagiaire Data Scientist – Vision par ordinateur',
      period: 'Fév. - Août 2023',
      headline: 'Détection d’objets pour l’inspection de défauts sur une ligne pharmaceutique.',
      narrative:
        'Projet mené en autonomie au sein du département Innovation d’Expleo : benchmarker des modèles de détection d’objets pour repérer les anomalies sur des images de seringues, construire le dataset et le pipeline d’augmentation associés, et livrer le modèle conteneurisé prêt pour la production.',
      focus: ['Détection d’objets', 'Ingénierie de dataset', 'Livraison conteneurisée'],
      stats: [
        { value: '98 %', label: 'd’exactitude (accuracy)' },
        { value: 'YOLOv5 / v8', label: 'modèles benchmarkés' },
        { value: '6 mois', label: 'en autonomie' },
      ],
      bullets: [
        'Implémentation et benchmark de modèles YOLOv5 et YOLOv8 pour la détection de défauts sur images de seringues : 98 % d’exactitude (accuracy)',
        'Prétraitement du dataset d’images pharmaceutiques et mise en place d’un pipeline d’augmentation de données',
        'Conteneurisation du modèle avec Docker pour sa mise en production',
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
      degree: 'Bachelor’s in Electronics, Electrical Energy and Control Engineering',
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
