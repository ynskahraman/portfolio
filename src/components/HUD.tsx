import { useEffect, useState } from 'react'
import type { InfoZone, Project } from '../data/profile'
import { getProfile } from '../data/profile'
import { ui, type Lang } from '../data/i18n'
import {
  RACE_LAPS,
  RACER_COUNT,
  exitRace,
  playerRank,
  raceGo,
  setGameState,
  startRace,
  useGameState,
} from '../state/gameStore'
import { Minimap } from './Minimap'
import { TouchControls } from './TouchControls'

function formatLap(ms: number) {
  const total = Math.max(0, ms)
  const m = Math.floor(total / 60000)
  const s = Math.floor((total % 60000) / 1000)
  const cs = Math.floor((total % 1000) / 10)
  return `${m}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`
}

// Live lap clock — ticks on its own small interval so the rest of the HUD
// doesn't re-render 60 times a second.
function LapClock({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(startedAt)
  useEffect(() => {
    const id = setInterval(() => setNow(performance.now()), 90)
    return () => clearInterval(id)
  }, [])
  return <strong>{formatLap(now - startedAt)}</strong>
}

type HUDProps = {
  lang: Lang
  onLangChange: (lang: Lang) => void
  activeZone: InfoZone | null
  activeProject: Project | null
}

export function HUD({ lang, onLangChange, activeZone, activeProject }: HUDProps) {
  const [showControls, setShowControls] = useState(false)
  const [dismissedWelcome, setDismissedWelcome] = useState(false)
  const { nitro, boosting, speed, lastLap, bestLap, lapStartedAt, racePhase, raceCountdown, raceLap, racePosition, raceRank, raceTimeMs } =
    useGameState()
  const t = ui[lang]
  const profile = getProfile(lang)
  const racing = racePhase === 'countdown' || racePhase === 'racing'

  // Countdown: 3 → 2 → 1 → GO.
  useEffect(() => {
    if (racePhase !== 'countdown') return
    const t1 = setTimeout(() => setGameState({ raceCountdown: 2 }), 1000)
    const t2 = setTimeout(() => setGameState({ raceCountdown: 1 }), 2000)
    const t3 = setTimeout(() => raceGo(), 3000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [racePhase])

  // Refresh the live rank while racing.
  useEffect(() => {
    if (racePhase !== 'racing') return
    const rank = setInterval(() => setGameState({ racePosition: playerRank() }), 300)
    return () => clearInterval(rank)
  }, [racePhase])

  return (
    <div className="hud">
      <header className="brand">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{profile.name}</h1>
          <p className="subtitle">{profile.title}</p>
        </div>
        <div className="brand-actions">
          <div className="lang-switch" role="group" aria-label="Language">
            <button
              type="button"
              className={lang === 'tr' ? 'active' : ''}
              onClick={() => onLangChange('tr')}
            >
              TR
            </button>
            <button
              type="button"
              className={lang === 'en' ? 'active' : ''}
              onClick={() => onLangChange('en')}
            >
              EN
            </button>
          </div>
          <button
            type="button"
            className={`chip-btn${racing ? '' : ' chip-btn--race'}`}
            onClick={() => (racing ? exitRace() : startRace())}
          >
            {racing ? t.quitRace : t.startRace}
          </button>
          <button type="button" className="chip-btn" onClick={() => setShowControls((v) => !v)}>
            {showControls ? t.hideControls : t.controls}
          </button>
        </div>
      </header>

      {!dismissedWelcome && racePhase === 'none' && (
        <section className="welcome-card">
          <h2>{t.welcomeHeading}</h2>
          <p>{profile.welcome}</p>
          <button type="button" className="text-btn" onClick={() => setDismissedWelcome(true)}>
            {t.welcomeCta}
          </button>
        </section>
      )}

      {showControls && (
        <section className="controls-panel">
          <table>
            <tbody>
              <tr>
                <td>
                  <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd>
                </td>
                <td>{t.move}</td>
              </tr>
              <tr>
                <td>
                  <kbd>Shift</kbd>
                </td>
                <td>{t.boost}</td>
              </tr>
              <tr>
                <td>
                  <kbd>Space</kbd>
                </td>
                <td>{t.brake}</td>
              </tr>
              <tr>
                <td>
                  <kbd>R</kbd>
                </td>
                <td>{t.reset}</td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      {activeZone && (
        <section className="context-card zone-card">
          <p className="context-label">{t.zone}</p>
          <h3>{activeZone.title}</h3>
          <p className="context-sub">{activeZone.subtitle}</p>
          <ul>
            {activeZone.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {activeZone.id === 'contact' && (
            <div className="contact-links">
              <a href={`mailto:${profile.email}`}>{t.email}</a>
              <a href={profile.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a href={`${import.meta.env.BASE_URL}cv.pdf`} target="_blank" rel="noreferrer">
                {t.cv}
              </a>
            </div>
          )}
        </section>
      )}

      {activeProject && (
        <section className="context-card project-card">
          <p className="context-label">{t.project}</p>
          <h3>{activeProject.title}</h3>
          <p className="context-sub">{activeProject.period}</p>
          <p>{activeProject.description}</p>
          {activeProject.url ? (
            <a href={activeProject.url} target="_blank" rel="noreferrer" className="live-link">
              {activeProject.live ? t.live : t.open}
            </a>
          ) : (
            <span className="soon-tag">{t.soon}</span>
          )}
        </section>
      )}

      {/* Race countdown / GO overlay — the pop animation ends invisible, so
          the GO element can simply stay mounted while racing */}
      {racePhase === 'countdown' && (
        <div className="countdown" key={raceCountdown}>
          {raceCountdown}
        </div>
      )}
      {racePhase === 'racing' && <div className="countdown countdown--go">{t.go}</div>}

      {/* Race status: lap + live position */}
      {racePhase === 'racing' && (
        <div className="race-pill">
          <span className="laps__item">
            <span className="laps__label">{t.lap}</span>
            <strong>
              {raceLap}/{RACE_LAPS}
            </strong>
          </span>
          <span className="laps__item">
            <span className="laps__label">{t.pos}</span>
            <strong>
              {racePosition}/{RACER_COUNT}
            </strong>
          </span>
        </div>
      )}

      {/* Race result */}
      {racePhase === 'finished' && (
        <section className="race-result">
          <h2>{raceRank === 1 ? t.raceWin : t.raceDone}</h2>
          <p className="race-result__rank">
            {t.pos} <strong>{raceRank}/{RACER_COUNT}</strong>
          </p>
          {raceTimeMs !== null && (
            <p className="race-result__time">
              {t.totalTime}: <strong>{formatLap(raceTimeMs)}</strong>
            </p>
          )}
          {raceRank !== 1 && <p className="race-result__msg">{t.raceLose}</p>}
          <div className="race-result__actions">
            <button type="button" className="chip-btn chip-btn--race" onClick={() => startRace()}>
              {t.raceAgain}
            </button>
            <button type="button" className="chip-btn" onClick={() => exitRace()}>
              {t.backToFree}
            </button>
          </div>
        </section>
      )}

      {/* Lap timer — appears once the car first crosses the start line */}
      {lapStartedAt !== null && racePhase !== 'finished' && (
        <div className="laps">
          <span className="laps__item">
            <span className="laps__label">{t.lap}</span>
            <LapClock startedAt={lapStartedAt} />
          </span>
          {lastLap !== null && (
            <span className="laps__item">
              <span className="laps__label">{t.lap} ✓</span>
              <strong>{formatLap(lastLap)}</strong>
            </span>
          )}
          {bestLap !== null && (
            <span className="laps__item laps__item--best">
              <span className="laps__label">{t.bestLap}</span>
              <strong>{formatLap(bestLap)}</strong>
            </span>
          )}
        </div>
      )}

      {/* Speed + nitro gauge */}
      <div className={`nitro${boosting ? ' nitro--active' : ''}`}>
        <span className="speedo">
          <strong>{Math.round(speed * 3.6)}</strong>
          <small>{t.kmh}</small>
        </span>
        <span className="nitro__label">{t.nitro}</span>
        <div className="nitro__bar">
          <span className="nitro__fill" style={{ width: `${Math.round(nitro * 100)}%` }} />
        </div>
      </div>

      {(dismissedWelcome || racePhase !== 'none') && <Minimap lang={lang} />}

      <TouchControls />

      {!activeZone && !activeProject && racePhase === 'none' && (
        <div className="control-hint">
          <kbd>W</kbd>
          <kbd>A</kbd>
          <kbd>S</kbd>
          <kbd>D</kbd>
          <span>{t.drive}</span>
          <kbd>Shift</kbd>
          <span>{t.boost}</span>
          <kbd>R</kbd>
          <span>{t.reset}</span>
        </div>
      )}
    </div>
  )
}
