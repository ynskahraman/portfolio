import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { carPosition } from '../../state/gameStore'

// Scattered clear of roads, pads and the racing band (radius 54–70):
// some in the infield (r < 50), the rest as a backdrop outside the track (r > 76).
const positions: [number, number][] = [
  // infield
  [-18, 24], [18, 24], [-38, -6], [38, -6], [-10, -48], [10, -48], [-44, 16], [44, 16], [0, 44],
  // outer backdrop ring (r ≈ 82)
  [82, 0], [58, 58], [0, 82], [-58, 58], [-82, 0], [-58, -58], [0, -82], [58, -58], [40, 72],
]

export function Trees() {
  const tops = useRef<THREE.Group[]>([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < tops.current.length; i++) {
      const top = tops.current[i]
      if (!top) continue
      const [x, z] = positions[i]
      const dx = carPosition.x - x
      const dz = carPosition.z - z
      const dist = Math.hypot(dx, dz) || 1
      const near = Math.max(0, 1 - dist / 8) // 0..1 as car approaches

      // Gentle idle wind + a stronger lean away from a passing car.
      top.rotation.z = Math.sin(t * 1.4 + i) * 0.05 - (dx / dist) * near * 0.5
      top.rotation.x = Math.cos(t * 1.2 + i) * 0.04 + (dz / dist) * near * 0.5
      top.scale.setScalar(1 + near * 0.08 * Math.sin(t * 12))
    }
  })

  return (
    <group>
      {positions.map(([x, z], i) => (
        <group key={`${x}-${z}`} position={[x, 0, z]}>
          <mesh castShadow position={[0, 1.1, 0]}>
            <cylinderGeometry args={[0.18, 0.3, 2.2, 10]} />
            <meshStandardMaterial color="#7a5638" roughness={0.9} />
          </mesh>
          <group
            ref={(g) => {
              if (g) tops.current[i] = g
            }}
            position={[0, 2.2, 0]}
          >
            <mesh castShadow position={[0, 0.5, 0]}>
              <coneGeometry args={[1.45, 2.4, 12]} />
              <meshStandardMaterial color="#3d8b5f" roughness={0.8} flatShading />
            </mesh>
            <mesh castShadow position={[0, 1.5, 0]}>
              <coneGeometry args={[1.05, 1.8, 12]} />
              <meshStandardMaterial color="#4fa072" roughness={0.8} flatShading />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  )
}
