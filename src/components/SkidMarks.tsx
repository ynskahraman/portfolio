import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { carPosition } from '../state/gameStore'

const POOL = 320 // ring buffer of skid quads; oldest fade out by being reused
const STAMP_DIST = 0.4 // metres between stamps
const REAR = 1.15 // rear axle offset behind the car centre
const HALF_TRACK = 0.55 // half distance between rear wheels

const dummy = new THREE.Object3D()
const qYaw = new THREE.Quaternion()
const qTilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)
const up = new THREE.Vector3(0, 1, 0)

// Tyre marks stamped under the rear wheels while cornering or braking hard.
// One InstancedMesh used as a ring buffer — constant cost however long you drift.
export function SkidMarks() {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const head = useRef(0)
  const lastX = useRef(0)
  const lastZ = useRef(0)

  // Park every instance at zero scale until it's stamped.
  useEffect(() => {
    const m = mesh.current
    if (!m) return
    dummy.position.set(0, -1, 0)
    dummy.scale.setScalar(0)
    dummy.updateMatrix()
    for (let i = 0; i < POOL; i++) m.setMatrixAt(i, dummy.matrix)
    m.instanceMatrix.needsUpdate = true
  }, [])

  useFrame(() => {
    const m = mesh.current
    if (!m || !carPosition.drifting) return

    const { x, z, fx, fz } = carPosition
    const dx = x - lastX.current
    const dz = z - lastZ.current
    if (dx * dx + dz * dz < STAMP_DIST * STAMP_DIST) return
    lastX.current = x
    lastZ.current = z

    // rear axle centre and the ground-plane right vector
    const bx = x - fx * REAR
    const bz = z - fz * REAR
    const rx = -fz
    const rz = fx
    const yaw = Math.atan2(-fx, -fz)
    qYaw.setFromAxisAngle(up, yaw)

    for (const side of [-1, 1]) {
      dummy.position.set(bx + rx * side * HALF_TRACK, 0.03, bz + rz * side * HALF_TRACK)
      dummy.quaternion.copy(qYaw).multiply(qTilt)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      m.setMatrixAt(head.current % POOL, dummy.matrix)
      head.current++
    }
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, POOL]} frustumCulled={false}>
      <planeGeometry args={[0.26, 0.62]} />
      <meshBasicMaterial color="#241f1a" transparent opacity={0.4} depthWrite={false} />
    </instancedMesh>
  )
}
