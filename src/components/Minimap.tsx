import { useEffect, useMemo, useRef } from 'react'
import { getInfoZones, getProjects } from '../data/profile'
import type { Lang } from '../data/i18n'
import { BOTS } from '../data/bots'
import { botPositions, carPosition } from '../state/gameStore'

const SIZE = 150 // css pixels
const WORLD = 86 // world radius mapped onto the map

// Live top-down radar: track, roads, zone/project markers, bots and the
// player arrow. The static layer is drawn once; only markers repaint.
export function Minimap({ lang }: { lang: Lang }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const markers = useMemo(
    () => ({
      zones: getInfoZones(lang).map((z) => ({ x: z.position[0], z: z.position[2], color: z.accent })),
      projects: getProjects(lang).map((p) => ({ x: p.position[0], z: p.position[2], color: p.color })),
    }),
    [lang],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const px = SIZE * dpr
    canvas.width = px
    canvas.height = px
    const ctx = canvas.getContext('2d')!
    const s = px / 2 / WORLD // world metres → device pixels
    const c = px / 2
    const X = (wx: number) => c + wx * s
    const Z = (wz: number) => c + wz * s

    // --- static layer, drawn once ---
    const bg = document.createElement('canvas')
    bg.width = px
    bg.height = px
    const b = bg.getContext('2d')!
    b.beginPath()
    b.arc(c, c, c - 1, 0, Math.PI * 2)
    b.fillStyle = 'rgba(15, 23, 42, 0.72)'
    b.fill()
    // race ring
    b.beginPath()
    b.arc(c, c, 62 * s, 0, Math.PI * 2)
    b.strokeStyle = 'rgba(148, 163, 184, 0.85)'
    b.lineWidth = 12 * s
    b.stroke()
    // roads (same strips as Roads.tsx)
    b.fillStyle = 'rgba(148, 163, 184, 0.45)'
    const road = (cx: number, cz: number, w: number, h: number) =>
      b.fillRect(X(cx - w / 2), Z(cz - h / 2), w * s, h * s)
    road(0, 1, 12, 74)
    road(0, 6, 62, 12)
    road(0, -30, 58, 8)
    road(-24, 6, 8, 22)
    road(24, 6, 8, 22)
    road(34, 0, 48, 9)
    // start line tick
    b.fillStyle = '#f8fafc'
    b.fillRect(X(-1), Z(-68), 2 * s, 12 * s)
    // zone / project markers
    for (const m of [...markers.zones, ...markers.projects]) {
      b.beginPath()
      b.arc(X(m.x), Z(m.z), 3.2 * dpr, 0, Math.PI * 2)
      b.fillStyle = m.color
      b.fill()
    }

    let raf = 0
    const draw = () => {
      ctx.clearRect(0, 0, px, px)
      ctx.drawImage(bg, 0, 0)
      // bots
      for (let i = 0; i < BOTS.length; i++) {
        ctx.beginPath()
        ctx.arc(X(botPositions[i].x), Z(botPositions[i].z), 3 * dpr, 0, Math.PI * 2)
        ctx.fillStyle = BOTS[i].color
        ctx.strokeStyle = '#0b1220'
        ctx.lineWidth = dpr
        ctx.fill()
        ctx.stroke()
      }
      // player arrow
      ctx.save()
      ctx.translate(X(carPosition.x), Z(carPosition.z))
      ctx.rotate(Math.atan2(carPosition.fz, carPosition.fx))
      ctx.beginPath()
      ctx.moveTo(6 * dpr, 0)
      ctx.lineTo(-4 * dpr, 4 * dpr)
      ctx.lineTo(-4 * dpr, -4 * dpr)
      ctx.closePath()
      ctx.fillStyle = '#ef4444'
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = dpr
      ctx.fill()
      ctx.stroke()
      ctx.restore()
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [markers])

  return <canvas ref={canvasRef} className="minimap" style={{ width: SIZE, height: SIZE }} aria-hidden />
}
