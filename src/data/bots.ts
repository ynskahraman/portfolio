export type BotConfig = {
  index: 0 | 1 | 2
  color: string
  cabin: string
  radius: number // preferred lane on the ring
  speed: number // cruise/race pace (player tops out at 18, 30 with nitro)
  startAngle: number // free-roam start position on the ring
}

// Three rivals with different lanes, paces and liveries — all beatable, but
// not for free.
export const BOTS: BotConfig[] = [
  { index: 0, color: '#2563eb', cabin: '#0f172a', radius: 62, speed: 15, startAngle: Math.PI / 2 },
  { index: 1, color: '#ea580c', cabin: '#1c1207', radius: 59.5, speed: 16, startAngle: (Math.PI * 7) / 6 },
  { index: 2, color: '#16a34a', cabin: '#08170c', radius: 64.5, speed: 14, startAngle: (Math.PI * 11) / 6 },
]
