import { Text } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { crossFinishLine, passCheckpoint } from '../../state/gameStore'

const INNER = 56
const OUTER = 68
const MID = (INNER + OUTER) / 2
const GAP = 0.13 // entrance gap half-angle on the inner wall (east, angle 0)

type Seg = { x: number; z: number; yaw: number; len: number; i: number }

function buildBarriers(): Seg[] {
  const segs: Seg[] = []
  const N = 40
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2
    const yaw = Math.PI / 2 - a
    const innerInGap = Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < GAP
    if (!innerInGap) {
      segs.push({ x: Math.cos(a) * INNER, z: Math.sin(a) * INNER, yaw, len: (2 * Math.PI * INNER) / N + 0.5, i })
    }
    segs.push({ x: Math.cos(a) * OUTER, z: Math.sin(a) * OUTER, yaw, len: (2 * Math.PI * OUTER) / N + 0.5, i })
  }
  return segs
}

const dummy = new THREE.Object3D()

// One fixed body holds every collider; a single InstancedMesh draws every
// barrier — far cheaper than dozens of separate rigid bodies + meshes.
function Barriers() {
  const segs = useMemo(() => buildBarriers(), [])
  const mesh = useRef<THREE.InstancedMesh>(null)

  useEffect(() => {
    const m = mesh.current
    if (!m) return
    const red = new THREE.Color('#dc2626')
    const white = new THREE.Color('#f3f4f6')
    for (let k = 0; k < segs.length; k++) {
      const s = segs[k]
      dummy.position.set(s.x, 0.7, s.z)
      dummy.rotation.set(0, s.yaw, 0)
      dummy.scale.set(s.len, 1.4, 0.6)
      dummy.updateMatrix()
      m.setMatrixAt(k, dummy.matrix)
      m.setColorAt(k, s.i % 2 === 0 ? red : white)
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [segs])

  return (
    <group>
      <RigidBody type="fixed" colliders={false} friction={0.6} restitution={0.25}>
        {segs.map((s, k) => (
          <CuboidCollider key={k} args={[s.len / 2, 0.7, 0.3]} position={[s.x, 0.7, s.z]} rotation={[0, s.yaw, 0]} />
        ))}
      </RigidBody>
      <instancedMesh ref={mesh} args={[undefined, undefined, segs.length]} castShadow receiveShadow frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.65} />
      </instancedMesh>
    </group>
  )
}

// Checkered start/finish line across the track width — a single plane with a
// tiny checkerboard CanvasTexture (was 24 separate meshes).
function StartLine() {
  const texture = useMemo(() => {
    const cols = 2
    const rows = 12
    const canvas = document.createElement('canvas')
    canvas.width = cols
    canvas.height = rows
    const ctx = canvas.getContext('2d')!
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        ctx.fillStyle = (c + r) % 2 === 0 ? '#11151c' : '#f5f7fb'
        ctx.fillRect(c, r, 1, 1)
      }
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.magFilter = THREE.NearestFilter
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  useEffect(() => () => texture.dispose(), [texture])

  // Same footprint as the old per-square version: tangent x ∈ [-0.5, 1.5],
  // radial z ∈ [-OUTER, -INNER] on the straight below the gate.
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.5, 0.05, -MID]}>
      <planeGeometry args={[2, OUTER - INNER]} />
      <meshStandardMaterial map={texture} roughness={0.7} />
    </mesh>
  )
}

// Invisible timing sensors: finish line under the gate, checkpoint on the
// opposite straight. The store only counts a lap when both fire in order.
function LapSensors() {
  return (
    <RigidBody type="fixed" colliders={false} sensor>
      <CuboidCollider
        args={[1.4, 2, (OUTER - INNER) / 2 + 1]}
        position={[0, 1, -MID]}
        sensor
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.name === 'car') crossFinishLine()
        }}
      />
      <CuboidCollider
        args={[1.4, 2, (OUTER - INNER) / 2 + 1]}
        position={[0, 1, MID]}
        sensor
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.name === 'car') passCheckpoint()
        }}
      />
    </RigidBody>
  )
}

function Gate() {
  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow position={[MID, 7.2, 0]}>
        <boxGeometry args={[OUTER - INNER, 1.4, 0.8]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.5} />
      </mesh>
      {/* readable from both driving directions */}
      {([0, Math.PI] as const).map((flip) => (
        <group key={flip} position={[MID, 7.2, 0]} rotation={[0, flip, 0]}>
          <Text position={[0, 0, 0.45]} fontSize={0.8} color="#ffffff" anchorX="center" anchorY="middle" fontWeight={800}>
            START / FINISH
          </Text>
        </group>
      ))}
      {([INNER + 1, OUTER - 1] as const).map((x) => (
        <mesh key={x} castShadow position={[x, 4, 0]}>
          <boxGeometry args={[0.7, 8, 0.7]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function Track() {
  return (
    <group>
      {/* asphalt ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} receiveShadow>
        <ringGeometry args={[INNER, OUTER, 128]} />
        <meshStandardMaterial color="#363c47" roughness={0.92} metalness={0.04} />
      </mesh>
      {/* kerb lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[INNER + 0.4, INNER + 0.9, 128]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[OUTER - 0.9, OUTER - 0.4, 128]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
      </mesh>

      <Barriers />
      <StartLine />
      <LapSensors />
      <Gate />
    </group>
  )
}
