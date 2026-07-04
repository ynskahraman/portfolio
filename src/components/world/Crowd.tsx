import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { carPosition } from '../../state/gameStore'

const shirtColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#eab308', '#f97316', '#06b6d4']
const skinTones = ['#f1c9a5', '#e0ac7e', '#c68642', '#8d5524', '#ffdbac', '#a0672c']
const flagColors = ['#ef4444', '#3b82f6', '#facc15', '#22c55e', '#ec4899', '#f8fafc']

// Spectators packed into three raised grandstand tiers ringing the track.
// Rendered as two InstancedMeshes (bodies + heads) so hundreds animate at
// almost no cost. A Mexican wave sweeps around the ring, and anyone near the
// player's car jumps and cheers.
const TIERS = [
  { r: 70, n: 46, y: 0 },
  { r: 73.2, n: 50, y: 1.0 },
  { r: 76.4, n: 54, y: 2.0 },
]

type Person = { x: number; z: number; a: number; baseY: number; phase: number; tint: number; scale: number }

function buildPositions(): Person[] {
  const list: Person[] = []
  let idx = 0
  for (const { r, n, y } of TIERS) {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + (r % 2) * 0.08
      list.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        a,
        baseY: y,
        phase: (idx % 7) + Math.random() * 2,
        tint: idx,
        scale: 0.85 + Math.random() * 0.3,
      })
      idx++
    }
  }
  return list
}

type Flag = { x: number; z: number; y: number; phase: number; color: string }

function buildFlags(): Flag[] {
  const flags: Flag[] = []
  const n = 16
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + 0.17
    const tier = TIERS[k % TIERS.length]
    flags.push({
      x: Math.cos(a) * (tier.r + 0.6),
      z: Math.sin(a) * (tier.r + 0.6),
      y: tier.y,
      phase: k * 1.7,
      color: flagColors[k % flagColors.length],
    })
  }
  return flags
}

const dummy = new THREE.Object3D()

// Concrete tier platforms the crowd stands on — one flat ring + one front
// wall per tier, so the stands read as a small stadium.
function Stands() {
  return (
    <group>
      {TIERS.map(({ r, y }) => (
        <group key={r}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y + 0.01, 0]} receiveShadow>
            <ringGeometry args={[r - 1.5, r + 1.6, 96]} />
            <meshStandardMaterial color="#8b8f99" roughness={0.9} />
          </mesh>
          {y > 0 && (
            <mesh position={[0, y / 2, 0]}>
              <cylinderGeometry args={[r - 1.5, r - 1.5, y, 96, 1, true]} />
              <meshStandardMaterial color="#767b86" roughness={0.9} side={THREE.DoubleSide} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

export function Crowd() {
  const people = useMemo(() => buildPositions(), [])
  const flags = useMemo(() => buildFlags(), [])
  const count = people.length
  const bodies = useRef<THREE.InstancedMesh>(null)
  const heads = useRef<THREE.InstancedMesh>(null)
  const cloths = useRef<(THREE.Group | null)[]>([])

  // Assign shirt colours and skin tones once.
  useEffect(() => {
    const b = bodies.current
    const h = heads.current
    if (!b || !h) return
    const color = new THREE.Color()
    for (let i = 0; i < count; i++) {
      color.set(shirtColors[people[i].tint % shirtColors.length])
      b.setColorAt(i, color)
      color.set(skinTones[(people[i].tint * 7) % skinTones.length])
      h.setColorAt(i, color)
    }
    if (b.instanceColor) b.instanceColor.needsUpdate = true
    if (h.instanceColor) h.instanceColor.needsUpdate = true
  }, [count, people])

  useFrame((state) => {
    const b = bodies.current
    const h = heads.current
    if (!b || !h) return
    const t = state.clock.elapsedTime
    const waveAngle = t * 0.7 // Mexican wave sweeping around the ring

    for (let i = 0; i < count; i++) {
      const p = people[i]
      const dx = carPosition.x - p.x
      const dz = carPosition.z - p.z
      const dist = Math.hypot(dx, dz)
      const excite = Math.max(0, 1 - dist / 18)

      // Wave: a sharp pulse travelling around the stands.
      const waveDelta = Math.cos(p.a - waveAngle)
      const wave = waveDelta > 0 ? waveDelta ** 6 : 0

      const energy = Math.max(excite, wave * 0.8)
      const yaw = Math.atan2(dx, dz) // turn to watch the car

      // Gentle sway when idle; modest, springy hops when excited. Kept small
      // and slow so it reads as cheering, not popcorn.
      const amp = 0.03 + energy * 0.22
      const sp = 3.5 + energy * 5
      const bob = Math.abs(Math.sin(t * sp + p.phase)) * amp + wave * 0.18
      // squash & stretch sells the hop without big air time
      const stretch = 1 + Math.sin(t * sp * 2 + p.phase) * 0.05 * energy

      const s = p.scale
      dummy.position.set(p.x, p.baseY + 0.62 * s + bob, p.z)
      dummy.rotation.set(0, yaw, 0)
      dummy.scale.set(s, s * stretch, s)
      dummy.updateMatrix()
      b.setMatrixAt(i, dummy.matrix)

      dummy.position.y = p.baseY + 1.34 * s + bob
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      h.setMatrixAt(i, dummy.matrix)
    }
    b.instanceMatrix.needsUpdate = true
    h.instanceMatrix.needsUpdate = true

    // Flags flutter; they wave harder as the Mexican wave passes them.
    for (let i = 0; i < flags.length; i++) {
      const cloth = cloths.current[i]
      if (!cloth) continue
      const f = flags[i]
      const a = Math.atan2(f.z, f.x)
      const local = Math.cos(a - waveAngle)
      const boost = local > 0 ? local ** 4 : 0
      cloth.rotation.y = Math.sin(t * (3 + boost * 6) + f.phase) * (0.35 + boost * 0.5)
    }
  })

  return (
    <group>
      <Stands />
      <instancedMesh ref={bodies} args={[undefined, undefined, count]} castShadow frustumCulled={false}>
        <capsuleGeometry args={[0.28, 0.55, 4, 8]} />
        <meshStandardMaterial roughness={0.75} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, count]} castShadow frustumCulled={false}>
        <sphereGeometry args={[0.26, 12, 12]} />
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>

      {flags.map((f, i) => (
        <group key={i} position={[f.x, f.y, f.z]}>
          <mesh position={[0, 1.6, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 3.2, 6]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.4} />
          </mesh>
          {/* pivot group sits on the pole so the cloth swings from its edge */}
          <group
            ref={(g) => {
              cloths.current[i] = g
            }}
            position={[0, 2.9, 0]}
          >
            <mesh position={[0.65, 0, 0]}>
              <planeGeometry args={[1.3, 0.8]} />
              <meshStandardMaterial color={f.color} roughness={0.7} side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  )
}
