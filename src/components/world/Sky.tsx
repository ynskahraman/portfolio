import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Drifting cartoon clouds + hot-air balloons floating over the map. Purely
// visual, no physics: a handful of flat-shaded meshes updated once per frame.

type Cloud = { x: number; y: number; z: number; scale: number; speed: number }

const clouds: Cloud[] = [
  { x: -70, y: 34, z: -50, scale: 1.4, speed: 1.6 },
  { x: 20, y: 40, z: -80, scale: 1.9, speed: 1.1 },
  { x: 80, y: 36, z: 10, scale: 1.2, speed: 2.0 },
  { x: -30, y: 44, z: 60, scale: 1.7, speed: 1.3 },
  { x: 60, y: 30, z: 70, scale: 1.1, speed: 1.8 },
  { x: -90, y: 38, z: 20, scale: 1.5, speed: 1.4 },
  { x: 0, y: 47, z: -20, scale: 2.1, speed: 0.9 },
  { x: 45, y: 42, z: -45, scale: 1.3, speed: 1.5 },
]

const WRAP = 130 // clouds wrap around once they drift past this x

function Clouds() {
  const refs = useRef<(THREE.Group | null)[]>([])

  useFrame((_, delta) => {
    for (let i = 0; i < clouds.length; i++) {
      const g = refs.current[i]
      if (!g) continue
      g.position.x += clouds[i].speed * delta
      if (g.position.x > WRAP) g.position.x = -WRAP
    }
  })

  return (
    <group>
      {clouds.map((c, i) => (
        <group
          key={i}
          ref={(g) => {
            refs.current[i] = g
          }}
          position={[c.x, c.y, c.z]}
          scale={c.scale}
        >
          <mesh>
            <sphereGeometry args={[3.2, 10, 8]} />
            <meshStandardMaterial color="#fff7ec" roughness={1} flatShading />
          </mesh>
          <mesh position={[3.1, -0.6, 0.4]}>
            <sphereGeometry args={[2.2, 10, 8]} />
            <meshStandardMaterial color="#fff2df" roughness={1} flatShading />
          </mesh>
          <mesh position={[-3, -0.8, -0.3]}>
            <sphereGeometry args={[2.4, 10, 8]} />
            <meshStandardMaterial color="#fff2df" roughness={1} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}

type Balloon = { x: number; z: number; y: number; color: string; stripe: string; phase: number }

const balloons: Balloon[] = [
  { x: -55, z: 45, y: 24, color: '#ef4444', stripe: '#fde047', phase: 0 },
  { x: 70, z: -35, y: 30, color: '#3b82f6', stripe: '#f8fafc', phase: 2.4 },
  { x: -15, z: -95, y: 27, color: '#a855f7', stripe: '#fb923c', phase: 4.1 },
]

function Balloons() {
  const refs = useRef<(THREE.Group | null)[]>([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < balloons.length; i++) {
      const g = refs.current[i]
      if (!g) continue
      const b = balloons[i]
      g.position.y = b.y + Math.sin(t * 0.4 + b.phase) * 2
      g.position.x = b.x + Math.sin(t * 0.15 + b.phase) * 5
      g.rotation.y = t * 0.1 + b.phase
    }
  })

  return (
    <group>
      {balloons.map((b, i) => (
        <group
          key={i}
          ref={(g) => {
            refs.current[i] = g
          }}
          position={[b.x, b.y, b.z]}
        >
          {/* envelope */}
          <mesh castShadow scale={[1, 1.15, 1]}>
            <sphereGeometry args={[3.4, 16, 14]} />
            <meshStandardMaterial color={b.color} roughness={0.6} />
          </mesh>
          <mesh scale={[1.01, 1.16, 1.01]}>
            <sphereGeometry args={[3.4, 16, 14, 0, Math.PI / 3]} />
            <meshStandardMaterial color={b.stripe} roughness={0.6} />
          </mesh>
          {/* throat + basket */}
          <mesh position={[0, -4.2, 0]}>
            <cylinderGeometry args={[0.9, 0.5, 1.4, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>
          <mesh position={[0, -5.6, 0]} castShadow>
            <boxGeometry args={[1.3, 1, 1.3]} />
            <meshStandardMaterial color="#92400e" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function Sky() {
  return (
    <group>
      <Clouds />
      <Balloons />
    </group>
  )
}
