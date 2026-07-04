import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { CylinderCollider, RigidBody } from '@react-three/rapier'

const TIRE_R = 0.55
const TIRE_H = 0.42

// Stacks of racing tyres near the ramps, the pit-lane mouth and the track
// entrance. One InstancedMesh + one fixed rigid body for all of them.
type Stack = { x: number; z: number; h: number }

const stacks: Stack[] = [
  // pit lane / track entrance
  { x: 50, z: 8, h: 3 }, { x: 50, z: -8, h: 3 }, { x: 44, z: 10, h: 2 }, { x: 44, z: -10, h: 2 },
  // near ramps
  { x: -48, z: 13, h: 3 }, { x: -38, z: 5, h: 2 }, { x: 48, z: 13, h: 3 }, { x: 38, z: 5, h: 2 },
  { x: -29, z: -40, h: 2 }, { x: -19, z: -48, h: 3 }, { x: 29, z: -40, h: 2 }, { x: 19, z: -48, h: 3 },
  // plaza corners
  { x: -12, z: 34, h: 2 }, { x: 12, z: 34, h: 2 },
]

const dummy = new THREE.Object3D()

export function TireStacks() {
  const items = useMemo(() => {
    const list: { x: number; y: number; z: number; white: boolean }[] = []
    for (const s of stacks) {
      for (let k = 0; k < s.h; k++) {
        list.push({ x: s.x, y: TIRE_H / 2 + k * TIRE_H, z: s.z, white: k % 2 === 1 })
      }
    }
    return list
  }, [])
  const mesh = useRef<THREE.InstancedMesh>(null)

  useEffect(() => {
    const m = mesh.current
    if (!m) return
    const black = new THREE.Color('#1c1e24')
    const white = new THREE.Color('#e7e9ee')
    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      dummy.position.set(it.x, it.y, it.z)
      dummy.rotation.set(Math.PI / 2, 0, 0) // lay the torus flat so tyres stack
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      m.setColorAt(i, it.white ? white : black)
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [items])

  return (
    <group>
      <RigidBody type="fixed" colliders={false} friction={0.7} restitution={0.4}>
        {stacks.map((s, i) => (
          <CylinderCollider key={i} args={[(s.h * TIRE_H) / 2, TIRE_R + 0.2]} position={[s.x, (s.h * TIRE_H) / 2, s.z]} />
        ))}
      </RigidBody>
      <instancedMesh ref={mesh} args={[undefined, undefined, items.length]} castShadow frustumCulled={false}>
        <torusGeometry args={[TIRE_R - 0.18, 0.21, 10, 18]} />
        <meshStandardMaterial roughness={0.85} />
      </instancedMesh>
    </group>
  )
}
