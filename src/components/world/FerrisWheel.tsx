import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'

const RADIUS = 9
const HUB_Y = 11
const CABINS = 8
const SPIN = 0.18 // rad/s

const cabinColors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6', '#f97316']

// A slowly turning ferris wheel on the north rim of the map — a landmark you
// can see from anywhere on the track. The wheel spins as one group; each
// cabin counter-rotates so it always hangs upright.
export function FerrisWheel({ position = [-35, 88] as [number, number] }) {
  const wheel = useRef<THREE.Group>(null)
  const cabins = useRef<(THREE.Group | null)[]>([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const angle = t * SPIN
    if (wheel.current) wheel.current.rotation.z = angle
    for (let i = 0; i < CABINS; i++) {
      const c = cabins.current[i]
      if (c) c.rotation.z = -angle
    }
  })

  // Face the wheel toward the map centre.
  const yaw = Math.atan2(-position[0], -position[1]) + Math.PI / 2

  return (
    <group position={[position[0], 0, position[1]]} rotation={[0, yaw, 0]}>
      {/* A-frame legs */}
      {([-1, 1] as const).map((side) => (
        <group key={side}>
          <mesh castShadow position={[side * 2.6, HUB_Y / 2, 1.4]} rotation={[0, 0, side * 0.24]}>
            <boxGeometry args={[0.6, HUB_Y + 1.5, 0.6]} />
            <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.5} />
          </mesh>
          <mesh castShadow position={[side * 2.6, HUB_Y / 2, -1.4]} rotation={[0, 0, side * 0.24]}>
            <boxGeometry args={[0.6, HUB_Y + 1.5, 0.6]} />
            <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.5} />
          </mesh>
        </group>
      ))}
      {/* hub axle */}
      <mesh position={[0, HUB_Y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 3.4, 12]} />
        <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* spinning wheel: rim + spokes + cabins */}
      <group ref={wheel} position={[0, HUB_Y, 0]}>
        <mesh castShadow>
          <torusGeometry args={[RADIUS, 0.28, 10, 48]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.3} roughness={0.45} />
        </mesh>
        <mesh>
          <torusGeometry args={[RADIUS * 0.55, 0.16, 8, 40]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.3} roughness={0.5} />
        </mesh>
        {Array.from({ length: CABINS }, (_, i) => {
          const a = (i / CABINS) * Math.PI * 2
          return (
            <group key={i}>
              {/* spoke */}
              <mesh rotation={[0, 0, a]} position={[Math.cos(a) * RADIUS * 0.5, Math.sin(a) * RADIUS * 0.5, 0]}>
                <boxGeometry args={[RADIUS, 0.18, 0.18]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.3} roughness={0.5} />
              </mesh>
              {/* cabin pivot at the rim; counter-rotated every frame */}
              <group
                ref={(g) => {
                  cabins.current[i] = g
                }}
                position={[Math.cos(a) * RADIUS, Math.sin(a) * RADIUS, 0]}
              >
                <mesh castShadow position={[0, -1, 0]}>
                  <boxGeometry args={[1.5, 1.3, 1.3]} />
                  <meshStandardMaterial color={cabinColors[i]} roughness={0.55} />
                </mesh>
                <mesh position={[0, -0.15, 0]}>
                  <cylinderGeometry args={[0.08, 0.08, 0.6, 6]} />
                  <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.4} />
                </mesh>
              </group>
            </group>
          )
        })}
      </group>

      {/* solid base so the car can't drive through the legs */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[3.6, 1.5, 2.2]} position={[0, 1.5, 0]} />
      </RigidBody>
    </group>
  )
}
