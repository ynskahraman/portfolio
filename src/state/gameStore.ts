import { useSyncExternalStore } from 'react'

export const RACE_LAPS = 3
export const RACER_COUNT = 4 // player + 3 bots

export type RacePhase = 'none' | 'countdown' | 'racing' | 'finished'

export type GameState = {
  nitro: number // 0..1 remaining charge
  boosting: boolean
  speed: number // current planar speed (m/s)
  lastLap: number | null // ms
  bestLap: number | null // ms
  lapStartedAt: number | null // performance.now() when the current lap began
  // race mode
  racePhase: RacePhase
  raceCountdown: number // 3..1 during countdown
  raceLap: number // player's current lap, 1-based
  racePosition: number // live rank 1..RACER_COUNT
  raceRank: number | null // final rank once finished
  raceTimeMs: number | null // final total time
}

let state: GameState = {
  nitro: 1,
  boosting: false,
  speed: 0,
  lastLap: null,
  bestLap: null,
  lapStartedAt: null,
  racePhase: 'none',
  raceCountdown: 3,
  raceLap: 1,
  racePosition: RACER_COUNT,
  raceRank: null,
  raceTimeMs: null,
}
const listeners = new Set<() => void>()

// Live car pose — mutated every frame WITHOUT notifying React subscribers,
// so 3D props (NPCs, foliage, skid marks, minimap) can read it cheaply.
export const carPosition = { x: 0, y: 0, z: 0, fx: 0, fz: -1, drifting: false }

// Live bot positions for the minimap, written by each BotCar's useFrame.
export const botPositions: { x: number; z: number }[] = [
  { x: 0, z: 0 },
  { x: 0, z: 0 },
  { x: 0, z: 0 },
]

// Touch (mobile) input — OR-ed with the keyboard inside the Car's frame loop.
export const touchInput = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  boost: false,
}

export function setGameState(patch: Partial<GameState>) {
  // Skip the React notify when nothing actually changed — the car pushes
  // telemetry every frame, and re-rendering the HUD at 60fps for identical
  // values is wasted work.
  let changed = false
  for (const key of Object.keys(patch) as (keyof GameState)[]) {
    if (state[key] !== patch[key]) {
      changed = true
      break
    }
  }
  if (!changed) return
  state = { ...state, ...patch }
  for (const listener of listeners) listener()
}

// --- Nitro pickups -----------------------------------------------------------
// A pickup queues a refill; the car consumes it on its next physics frame.
let nitroRefillQueued = false
export function queueNitroRefill() {
  nitroRefillQueued = true
}
export function consumeNitroRefill() {
  const queued = nitroRefillQueued
  nitroRefillQueued = false
  return queued
}

// --- Race --------------------------------------------------------------------
// Race direction is +angle around the ring (the direction the bots drive).
// Progress is measured in radians travelled since the start; one lap = 2π.
// Mutable per-frame data lives here; React-visible snapshots go via setGameState.
export const raceData = {
  active: false,
  frozen: false, // true during the countdown — cars are held on the grid
  startedAt: 0,
  playerProgress: 0,
  playerLastAngle: 0,
  playerLapsDone: 0,
  botProgress: [0, 0, 0],
  botLastAngle: [0, 0, 0],
  botFinished: [false, false, false],
  finishedBots: 0,
  // teleport requests, consumed by the car components on their next frame
  playerGrid: null as { x: number; z: number; yaw: number } | null,
  botGrid: [null, null, null] as ({ x: number; z: number; yaw: number } | null)[],
}

// Grid slots just behind the start line at (0, -MID); race direction there is
// +x, so "behind" is -x. Player gets the front-inside slot.
const GRID: { x: number; z: number; yaw: number }[] = [
  { x: -4, z: -59.5, yaw: -Math.PI / 2 },
  { x: -4, z: -64.5, yaw: -Math.PI / 2 },
  { x: -8, z: -59.5, yaw: -Math.PI / 2 },
  { x: -8, z: -64.5, yaw: -Math.PI / 2 },
]

export function trackAngle(x: number, z: number) {
  return Math.atan2(z, x)
}

// Smallest signed angle difference, for wrap-aware progress accumulation.
export function angleDelta(now: number, prev: number) {
  let d = now - prev
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return d
}

export function startRace() {
  raceData.active = true
  raceData.frozen = true
  raceData.playerProgress = 0
  raceData.playerLapsDone = 0
  raceData.playerLastAngle = trackAngle(GRID[0].x, GRID[0].z)
  raceData.finishedBots = 0
  for (let i = 0; i < 3; i++) {
    raceData.botProgress[i] = 0
    raceData.botFinished[i] = false
    raceData.botGrid[i] = GRID[i + 1]
    raceData.botLastAngle[i] = trackAngle(GRID[i + 1].x, GRID[i + 1].z)
  }
  raceData.playerGrid = GRID[0]
  checkpointPassed = false
  setGameState({
    racePhase: 'countdown',
    raceCountdown: 3,
    raceLap: 1,
    racePosition: RACER_COUNT,
    raceRank: null,
    raceTimeMs: null,
    lastLap: null,
    lapStartedAt: null,
  })
}

export function raceGo() {
  raceData.frozen = false
  raceData.startedAt = performance.now()
  setGameState({ racePhase: 'racing', raceCountdown: 0 })
}

export function exitRace() {
  raceData.active = false
  raceData.frozen = false
  setGameState({ racePhase: 'none' })
}

// Called from the player's frame loop while a race is running.
export function updatePlayerProgress(x: number, z: number) {
  const a = trackAngle(x, z)
  // Only accumulate while on/near the ring band, so cutting through the
  // infield doesn't rack up progress.
  const r = Math.hypot(x, z)
  const d = angleDelta(a, raceData.playerLastAngle)
  raceData.playerLastAngle = a
  if (r > 40) raceData.playerProgress += d
}

export function updateBotProgress(i: number, x: number, z: number) {
  const a = trackAngle(x, z)
  const d = angleDelta(a, raceData.botLastAngle[i])
  raceData.botLastAngle[i] = a
  if (!raceData.active || raceData.frozen || raceData.botFinished[i]) return
  raceData.botProgress[i] += d
  if (raceData.botProgress[i] >= RACE_LAPS * Math.PI * 2) {
    raceData.botFinished[i] = true
    raceData.finishedBots++
  }
}

export function playerRank() {
  let rank = 1
  for (let i = 0; i < 3; i++) {
    if (raceData.botProgress[i] > raceData.playerProgress) rank++
  }
  return rank
}

// --- Lap timing ----------------------------------------------------------------
// The checkpoint (opposite side of the ring) must be hit between two
// finish-line crossings, so shuttling back and forth can't fake a lap.
let checkpointPassed = false
export function passCheckpoint() {
  checkpointPassed = true
}
export function crossFinishLine() {
  const now = performance.now()
  if (state.lapStartedAt !== null && checkpointPassed) {
    const lap = now - state.lapStartedAt
    setGameState({
      lastLap: lap,
      bestLap: state.bestLap === null || lap < state.bestLap ? lap : state.bestLap,
      lapStartedAt: now,
    })
    // race lap bookkeeping
    if (state.racePhase === 'racing') {
      raceData.playerLapsDone++
      if (raceData.playerLapsDone >= RACE_LAPS) {
        setGameState({
          racePhase: 'finished',
          raceRank: raceData.finishedBots + 1,
          raceTimeMs: now - raceData.startedAt,
        })
        raceData.active = false
      } else {
        setGameState({ raceLap: raceData.playerLapsDone + 1 })
      }
    }
  } else {
    setGameState({ lapStartedAt: now })
  }
  checkpointPassed = false
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

export function useGameState() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
