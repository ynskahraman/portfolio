import type { Lang } from './i18n'

export type Project = {
  id: string
  title: string
  period: string
  description: string
  url?: string
  live?: boolean
  color: string
  position: [number, number, number]
}

export type InfoZone = {
  id: string
  title: string
  subtitle: string
  lines: string[]
  position: [number, number, number]
  accent: string
}

// --- Shared, language-independent identity ----------------------------------
export const contact = {
  name: 'Yunus Emre Kahraman',
  email: 'lapeoda@gmail.com',
  phone: '(+90) 553 501 6810',
  github: 'https://github.com/ynskahraman',
  linkedin: 'https://www.linkedin.com/in/yunus-emre-k-780544233/',
}

// --- Localized profile copy --------------------------------------------------
type LocalizedProfile = {
  title: string
  tagline: string
  welcome: string
  bio: string
  education: string
  languages: string
  driving: string
  location: string
}

const profileText: Record<Lang, LocalizedProfile> = {
  tr: {
    title: 'DevOps & Yazılım Mühendisi',
    tagline: 'Cloud, backend ve ürün geliştirme',
    welcome:
      'Merhaba! Ben Yunus Emre. Bu portföyde arabayla gezerek deneyimlerimi, projelerimi ve yetkinliklerimi keşfedebilirsin. Renkli proje alanlarına yaklaşınca detayları görürsün; projenin sitesi varsa karttan açabilirsin.',
    bio: 'Yeditepe Üniversitesi Yazılım Geliştirme öğrencisiyim. DevOps, cloud altyapısı ve Python/FastAPI backend tarafında üretim ortamları kuruyorum. Mikroservis ve modular-monolith mimariler, CI/CD otomasyonu ve gözlemlenebilir sistemler üzerinde çalışıyorum.',
    education: 'Yazılım Geliştirme Lisansı — Yeditepe Üniversitesi (Tahmini Tem 2026)',
    languages: 'Türkçe (Ana dil) · İngilizce C1 (B2 konuşma) · Fransızca A2',
    driving: 'Ehliyet: B sınıfı',
    location: 'Ataşehir, İstanbul, Türkiye',
  },
  en: {
    title: 'DevOps & Software Engineer',
    tagline: 'Cloud, backend & product engineering',
    welcome:
      "Hi! I'm Yunus Emre. Drive around this portfolio to explore my experience, projects and skills. Approach a coloured project pad to read the details; if a project has a site you can open it from the card.",
    bio: 'Software Development student at Yeditepe University. I build production environments across DevOps, cloud infrastructure and Python/FastAPI backends — working on microservice and modular-monolith architectures, CI/CD automation and observable systems.',
    education: 'BSc Software Development — Yeditepe University (Expected Jul 2026)',
    languages: 'Turkish (Native) · English C1 (B2 spoken) · French A2',
    driving: 'Driving Licence: B',
    location: 'Ataşehir, Istanbul, Türkiye',
  },
}

export function getProfile(lang: Lang) {
  return { ...contact, ...profileText[lang] }
}

// --- Skills & experience -----------------------------------------------------
const skillsByLang: Record<Lang, string[]> = {
  tr: [
    'Diller & Framework: Python (FastAPI, SQLAlchemy, Celery), Java, C#, .NET, PHP, React Native, SQL (MSSQL, PL/SQL, MySQL), HTML/CSS/JS',
    'DevOps & CI/CD: Docker, Kubernetes, Jenkins, Maven, Git/GitHub, CI/CD tasarımı, IaC, Bash, zero-downtime deploy, systemd',
    'Cloud & Altyapı: AWS, Hetzner, Nginx (reverse proxy & load balancing), Redis, WebSocket, Linux (Ubuntu/CentOS/Devuan/Kali), Windows Server',
    'Operasyon & Güvenilirlik: İzleme & merkezi loglama, gözlemlenebilir loglama, health/readiness check, DB migrasyon, secret & konfig yönetimi',
    'Çalışma Biçimi: Agile/Scrum, mikroservis & modular-monolith, multi-tenant & rol bazlı erişim, otomatik test, code review',
  ],
  en: [
    'Languages & Frameworks: Python (FastAPI, SQLAlchemy, Celery), Java, C#, .NET, PHP, React Native, SQL (MSSQL, PL/SQL, MySQL), HTML/CSS/JS',
    'DevOps & CI/CD: Docker, Kubernetes, Jenkins, Maven, Git/GitHub, CI/CD design, Infrastructure as Code, Bash, zero-downtime deploys, systemd',
    'Cloud & Infrastructure: AWS, Hetzner, Nginx (reverse proxy & load balancing), Redis, WebSocket, Linux (Ubuntu/CentOS/Devuan/Kali), Windows Server',
    'Operations & Reliability: Monitoring & centralized logging, observable logging, health/readiness checks, DB migrations, secrets & config management',
    'Ways of Working: Agile/Scrum, microservices & modular-monolith, multi-tenant & role-based access, automated testing, code review',
  ],
}

const workByLang: Record<Lang, string[]> = {
  tr: [
    'DevOps & Sistem Mühendisi Stajyeri — Verisay (2025)',
    'Yazılım Mühendisi Stajyeri — Entranet / Verisay (2025)',
    'Junior DevOps Mühendisi — Technosphere (2023–2024)',
    'Yazılım Test Stajyeri — Mars Athletic Club (2023)',
  ],
  en: [
    'DevOps & System Engineer Intern — Verisay (2025)',
    'Software Engineer Intern — Entranet / Verisay (2025)',
    'Junior DevOps Engineer — Technosphere (2023–2024)',
    'Software Tester Intern — Mars Athletic Club (2023)',
  ],
}

const communityByLang: Record<Lang, string[]> = {
  tr: [
    'DevOps Lideri — YUCOMP & GDSC Yeditepe (2024–2026)',
    'Kurucu & Lider — Luxanta · PhiloSoftwares',
  ],
  en: [
    'DevOps Lead — YUCOMP & GDSC Yeditepe (2024–2026)',
    'Founder & Lead — Luxanta · PhiloSoftwares',
  ],
}

// --- Info zones --------------------------------------------------------------
type ZoneMeta = { id: string; position: [number, number, number]; accent: string }

const zoneMeta: ZoneMeta[] = [
  { id: 'about', position: [-24, 0, -2], accent: '#4f46e5' },
  { id: 'skills', position: [24, 0, -2], accent: '#0891b2' },
  { id: 'experience', position: [-24, 0, 14], accent: '#7c3aed' },
  { id: 'community', position: [24, 0, 14], accent: '#db2777' },
  { id: 'contact', position: [0, 0, 32], accent: '#059669' },
]

export function getInfoZones(lang: Lang): InfoZone[] {
  const p = getProfile(lang)
  const titles: Record<Lang, Record<string, { title: string; subtitle: string }>> = {
    tr: {
      about: { title: 'Hakkımda', subtitle: p.title },
      skills: { title: 'Yetkinlikler', subtitle: 'Stack & araçlar' },
      experience: { title: 'İş Deneyimi', subtitle: 'Profesyonel' },
      community: { title: 'Topluluk & Liderlik', subtitle: 'Gönüllü & girişim' },
      contact: { title: 'İletişim', subtitle: 'Bana ulaş' },
    },
    en: {
      about: { title: 'About', subtitle: p.title },
      skills: { title: 'Skills', subtitle: 'Stack & tools' },
      experience: { title: 'Work Experience', subtitle: 'Professional' },
      community: { title: 'Community & Leadership', subtitle: 'Volunteer & ventures' },
      contact: { title: 'Contact', subtitle: 'Reach me' },
    },
  }
  const lines: Record<string, string[]> = {
    about: [p.bio, p.education, p.languages],
    skills: skillsByLang[lang],
    experience: workByLang[lang],
    community: communityByLang[lang],
    contact: [p.email, p.phone, p.location, 'GitHub · LinkedIn'],
  }
  return zoneMeta.map((zone) => ({
    ...zone,
    title: titles[lang][zone.id].title,
    subtitle: titles[lang][zone.id].subtitle,
    lines: lines[zone.id],
  }))
}

// --- Projects ----------------------------------------------------------------
type ProjectMeta = {
  id: string
  period: string
  url?: string
  live?: boolean
  color: string
  position: [number, number, number]
}

const projectMeta: ProjectMeta[] = [
  { id: 'within-air', period: 'Jan 2026 – Present', url: 'https://app.withinair.tech', live: true, color: '#0ea5e9', position: [-25, 0, -30] },
  { id: 'flowelie', period: 'Feb 2026 – Present', color: '#8b5cf6', position: [-15, 0, -30] },
  { id: 'mythara', period: 'Nov 2025 – Feb 2026', color: '#f59e0b', position: [-5, 0, -30] },
  { id: 'yucode', period: 'Sep 2024 – Jan 2026', color: '#10b981', position: [5, 0, -30] },
  { id: 'qasiyer', period: 'Aug 2023 – Nov 2024', color: '#ef4444', position: [15, 0, -30] },
  { id: 'vitalmart', period: 'Oct 2024 – Feb 2025', color: '#14b8a6', position: [25, 0, -30] },
]

const projectText: Record<Lang, Record<string, { title: string; description: string }>> = {
  tr: {
    'within-air': { title: 'Within Air', description: 'B2B karbon emisyon takip SaaS — DEFRA metodolojisi, FastAPI backend, canlı ölçüm akışı.' },
    flowelie: { title: 'Flowelie', description: 'Video, chat, Scrum board ve retro oylama — tek ekip işbirliği platformu.' },
    mythara: { title: 'Mythara', description: 'Yazarlar, okuyucular ve kapak tasarımcılarını buluşturan yayıncılık platformu.' },
    yucode: { title: 'YUCode', description: 'Programlama pratiği, lab ve sınav platformu — YUCOMP ekibiyle.' },
    qasiyer: { title: 'Qasiyer', description: 'Kafe ve restoranlar için QR tabanlı sipariş sistemi — Technosphere.' },
    vitalmart: { title: 'VitalMart', description: 'Üreticiden tüketiciye marketplace — GDSC Yeditepe.' },
  },
  en: {
    'within-air': { title: 'Within Air', description: 'B2B carbon emission tracking SaaS — DEFRA methodology, FastAPI backend, live measurement stream.' },
    flowelie: { title: 'Flowelie', description: 'Video, chat, Scrum board and retro voting — one team collaboration platform.' },
    mythara: { title: 'Mythara', description: 'A publishing platform connecting writers, readers and cover designers.' },
    yucode: { title: 'YUCode', description: 'Coding practice, lab and exam platform — built with the YUCOMP team.' },
    qasiyer: { title: 'Qasiyer', description: 'QR-based ordering system for cafés and restaurants — Technosphere.' },
    vitalmart: { title: 'VitalMart', description: 'Producer-to-consumer marketplace — GDSC Yeditepe.' },
  },
}

export function getProjects(lang: Lang): Project[] {
  return projectMeta.map((meta) => ({
    ...meta,
    title: projectText[lang][meta.id].title,
    description: projectText[lang][meta.id].description,
  }))
}

export const spawnPosition: [number, number, number] = [0, 1.2, 16]
