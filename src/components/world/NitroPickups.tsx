import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CylinderCollider, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { queueNitroRefill } from '../../state/gameStore'

const RESPAWN_S = 8

// Floating nitro canisters. Driving through one instantly refills the tank;
// it fades out and respawns a few seconds later. Two live on the race ring,
// the rest near the ramps so jumps chain into boosts.
const positions: [number, number][] = [
  // on the track ring (r ≈ 62), clear of the start line and entrance gap
  [-44, 44],
  [44, -44],
  // infield, lined up with the ramps' launch directions
  [-43, 20],
  [43, 20],
  [0, -44],
]

function Pickup({ position }: { position: [number, number] }) {
  const group = useRef<THREE.Group>(null)
  const hiddenUntil = useRef(0)
  const now = useRef(0)

  useFrame((state) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    now.current = t
    const visible = t >= hiddenUntil.current
    g.visible = visible
    if (visible) {
      g.rotation.y = t * 2.2
      g.position.y = 1.15 + Math.sin(t * 2.6 + position[0]) * 0.22
    }
  })

  return (
    <group position={[position[0], 0, position[1]]}>
      <RigidBody
        type="fixed"
        colliders={false}
        sensor
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.name !== 'car') return
          if (now.current < hiddenUntil.current) return // already collected
          queueNitroRefill()
          hiddenUntil.current = now.current + RESPAWN_S
        }}
      >
        <CylinderCollider args={[1.4, 1.5]} position={[0, 1.2, 0]} sensor />
      </RigidBody>

      {/* canister */}
      <group ref={group} position={[0, 1.15, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.32, 0.6, 6, 12]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#38bdf8" emissiveIntensity={0.8} roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[0.1, 0.16, 0.22, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.045, 8, 24]} />
          <meshBasicMaterial color="#7dd3fc" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* ground marker */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[0.8, 1.1, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export function NitroPickups() {
  return (
    <group>
      {positions.map((p) => (
        <Pickup key={`${p[0]}-${p[1]}`} position={p} />
      ))}
    </group>
  )
}
