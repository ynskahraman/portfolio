export type Lang = 'tr' | 'en'

type Dict = {
  eyebrow: string
  controls: string
  hideControls: string
  welcomeHeading: string
  welcomeCta: string
  move: string
  boost: string
  brake: string
  reset: string
  drive: string
  zone: string
  project: string
  live: string
  open: string
  soon: string
  opened: string
  email: string
  cv: string
  nitro: string
  kmh: string
  lap: string
  bestLap: string
  startRace: string
  quitRace: string
  raceAgain: string
  backToFree: string
  go: string
  pos: string
  raceDone: string
  raceWin: string
  raceLose: string
  totalTime: string
  loading: string
  ready: string
  langName: string
}

export const ui: Record<Lang, Dict> = {
  tr: {
    eyebrow: 'Portföy',
    controls: 'Kontroller',
    hideControls: 'Kontrolleri gizle',
    welcomeHeading: 'Hoş geldin',
    welcomeCta: 'Anladım, sürüşe başla →',
    move: 'Hareket',
    boost: 'Nitro',
    brake: 'Fren',
    reset: 'Başa dön',
    drive: 'sür',
    zone: 'Bölge',
    project: 'Proje',
    live: 'Canlı siteyi aç ↗',
    open: 'Projeyi aç ↗',
    soon: 'Yakında',
    opened: 'Açıldı',
    email: 'E-posta',
    cv: 'CV ↗',
    nitro: 'NITRO',
    kmh: 'km/s',
    lap: 'TUR',
    bestLap: 'REKOR',
    startRace: '🏁 Yarış başlat',
    quitRace: 'Yarışı bırak',
    raceAgain: 'Tekrar yarış',
    backToFree: 'Serbest sürüş',
    go: 'BAŞLA!',
    pos: 'SIRA',
    raceDone: 'Yarış bitti!',
    raceWin: 'Birinci oldun! 🏆',
    raceLose: 'Bir dahaki sefere! 🏎️',
    totalTime: 'Toplam süre',
    loading: 'Sahne yükleniyor',
    ready: 'Hazır — sürüşe başla',
    langName: 'Türkçe',
  },
  en: {
    eyebrow: 'Portfolio',
    controls: 'Controls',
    hideControls: 'Hide controls',
    welcomeHeading: 'Welcome',
    welcomeCta: 'Got it, start driving →',
    move: 'Move',
    boost: 'Nitro',
    brake: 'Brake',
    reset: 'Respawn',
    drive: 'drive',
    zone: 'Zone',
    project: 'Project',
    live: 'Open live site ↗',
    open: 'Open project ↗',
    soon: 'Soon',
    opened: 'Opened',
    email: 'Email',
    cv: 'Resume ↗',
    nitro: 'NITRO',
    kmh: 'km/h',
    lap: 'LAP',
    bestLap: 'BEST',
    startRace: '🏁 Start race',
    quitRace: 'Quit race',
    raceAgain: 'Race again',
    backToFree: 'Free roam',
    go: 'GO!',
    pos: 'POS',
    raceDone: 'Race finished!',
    raceWin: 'You won! 🏆',
    raceLose: 'Better luck next time! 🏎️',
    totalTime: 'Total time',
    loading: 'Loading scene',
    ready: 'Ready — start driving',
    langName: 'English',
  },
}
