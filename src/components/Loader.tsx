import { useProgress } from '@react-three/drei'
import { useEffect, useState } from 'react'
import { getProfile } from '../data/profile'
import { ui, type Lang } from '../data/i18n'

export function Loader({ lang }: { lang: Lang }) {
  const { progress, active } = useProgress()
  const [done, setDone] = useState(false)
  const [hidden, setHidden] = useState(false)
  const profile = getProfile(lang)
  const t = ui[lang]

  // Fade out once nothing is actively loading. `active` flips false when the
  // THREE loading manager is idle — which is also the initial state when a
  // scene has no tracked assets, so we can't wait for progress to reach 100.
  useEffect(() => {
    if (active) return
    const fade = window.setTimeout(() => setDone(true), 400)
    return () => window.clearTimeout(fade)
  }, [active])

  // Hard fallback: never let the overlay trap the user, even if a loader hangs.
  useEffect(() => {
    const fallback = window.setTimeout(() => setDone(true), 8000)
    return () => window.clearTimeout(fallback)
  }, [])

  // Unmount after the fade transition finishes.
  useEffect(() => {
    if (!done) return
    const unmount = window.setTimeout(() => setHidden(true), 650)
    return () => window.clearTimeout(unmount)
  }, [done])

  if (hidden) return null

  const shownProgress = active ? Math.round(progress) : 100

  return (
    <div className={`loader${done ? ' loader--done' : ''}`} aria-hidden={done}>
      <div className="loader__inner">
        <p className="loader__eyebrow">{t.eyebrow}</p>
        <h1 className="loader__name">{profile.name}</h1>
        <p className="loader__title">{profile.title}</p>

        <div className="loader__bar">
          <span className="loader__fill" style={{ width: `${shownProgress}%` }} />
        </div>
        <p className="loader__hint">
          {done || !active ? t.ready : `${t.loading} · ${shownProgress}%`}
        </p>
      </div>
    </div>
  )
}
