import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'

const SIZE = 2

// Stacked white cube walls (Bruno-Simon style) scattered through the free-roam
// infield as obstacles to weave around and jump. Instanced + one rigid body.
function buildCubes() {
  const cubes: [number, number, number][] = []
  const line = (cx: number, cz: number, dx: number, dz: number, n: number, h: number) => {
    for (let i = 0; i < n; i++) {
      for (let y = 0; y < h; y++) {
        cubes.push([cx + dx * i * SIZE, SIZE / 2 + y * SIZE, cz + dz * i * SIZE])
      }
    }
  }
  line(-40, 26, 1, 0, 4, 2)
  line(-40, 28, 0, 1, 3, 1)
  line(34, 30, 1, 0, 4, 1)
  line(36, 30, 0, -1, 3, 2)
  line(-16, -14, 1, 0, 3, 1)
  line(14, -18, 0, 1, 3, 2)
  line(-10, 40, 1, 0, 3, 1)
  return cubes
}

const dummy = new THREE.Object3D()

export function BlockWalls() {
  const cubes = useMemo(() => buildCubes(), [])
  const mesh = useRef<THREE.InstancedMesh>(null)

  useEffect(() => {
    const m = mesh.current
    if (!m) return
    const base = new THREE.Color('#f4f1ea')
    const c = new THREE.Color()
    for (let i = 0; i < cubes.length; i++) {
      dummy.position.set(...cubes[i])
      dummy.rotation.set(0, 0, 0)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      c.copy(base).offsetHSL(0, 0, (Math.random() - 0.5) * 0.06)
      m.setColorAt(i, c)
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [cubes])

  return (
    <group>
      <RigidBody type="fixed" colliders={false} friction={0.8} restitution={0.1}>
        {cubes.map((p, i) => (
          <CuboidCollider key={i} args={[SIZE / 2, SIZE / 2, SIZE / 2]} position={p} />
        ))}
      </RigidBody>
      <instancedMesh ref={mesh} args={[undefined, undefined, cubes.length]} castShadow receiveShadow frustumCulled={false}>
        <boxGeometry args={[SIZE, SIZE, SIZE]} />
        <meshStandardMaterial roughness={0.85} metalness={0} flatShading />
      </instancedMesh>
    </group>
  )
}
