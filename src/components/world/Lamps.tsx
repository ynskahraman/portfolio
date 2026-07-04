import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'

// Street lamps along the boulevards. Pole spans y 0..4.2 so the glowing head
// sits exactly on top of the post. All lamps share four InstancedMeshes
// (base / pole / cap / head) — 4 draw calls total instead of one per part.
const positions: [number, number][] = [
  [-6, 18], [6, 18], [-6, -6], [6, -6], [-6, -24], [6, -24],
  [-18, 6], [18, 6], [-6, 26], [6, 26],
]

type Part = { y: number; ref: React.RefObject<THREE.InstancedMesh | null> }

const dummy = new THREE.Object3D()

export function Lamps() {
  const base = useRef<THREE.InstancedMesh>(null)
  const pole = useRef<THREE.InstancedMesh>(null)
  const cap = useRef<THREE.InstancedMesh>(null)
  const head = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const parts: Part[] = [
      { y: 0.15, ref: base },
      { y: 2.1, ref: pole },
      { y: 4.18, ref: cap },
      { y: 4.42, ref: head },
    ]
    for (const { y, ref } of parts) {
      const m = ref.current
      if (!m) continue
      for (let i = 0; i < positions.length; i++) {
        dummy.position.set(positions[i][0], y, positions[i][1])
        dummy.rotation.set(0, 0, 0)
        dummy.scale.setScalar(1)
        dummy.updateMatrix()
        m.setMatrixAt(i, dummy.matrix)
      }
      m.instanceMatrix.needsUpdate = true
    }
  }, [])

  const n = positions.length
  return (
    <group>
      <instancedMesh ref={base} args={[undefined, undefined, n]} castShadow>
        <cylinderGeometry args={[0.32, 0.4, 0.3, 12]} />
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={pole} args={[undefined, undefined, n]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 4.2, 12]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.35} />
      </instancedMesh>
      <instancedMesh ref={cap} args={[undefined, undefined, n]} castShadow>
        <cylinderGeometry args={[0.26, 0.16, 0.18, 12]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={head} args={[undefined, undefined, n]}>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshStandardMaterial color="#fff6cf" emissive="#fde047" emissiveIntensity={1.6} />
      </instancedMesh>
    </group>
  )
}
