import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { CuboidCollider, type RapierRigidBody, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { BOTS, type BotConfig } from '../data/bots'
import { botPositions, raceData, updateBotProgress } from '../state/gameStore'

const AHEAD = 0.16 // look-ahead along the ring (rad)

const euler = new THREE.Euler()
const quat = new THREE.Quaternion()
const current = new THREE.Quaternion()

function BotWheel({
  position,
  spinRef,
}: {
  position: [number, number, number]
  spinRef: React.RefObject<THREE.Mesh | null>
}) {
  return (
    <mesh ref={spinRef} position={position} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
      <meshStandardMaterial color="#1a1a1f" metalness={0.3} roughness={0.55} />
    </mesh>
  )
}

function Bot({ config }: { config: BotConfig }) {
  const body = useRef<RapierRigidBody>(null)
  const wheelSpin = useRef(0)
  const fl = useRef<THREE.Mesh>(null)
  const fr = useRef<THREE.Mesh>(null)
  const rl = useRef<THREE.Mesh>(null)
  const rr = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    const chassis = body.current
    if (!chassis) return
    const dt = Math.min(delta, 1 / 30)
    const i = config.index

    // Race start: teleport to the grid slot, facing the race direction.
    const grid = raceData.botGrid[i]
    if (grid) {
      raceData.botGrid[i] = null
      chassis.setTranslation({ x: grid.x, y: 0.8, z: grid.z }, true)
      chassis.setLinvel({ x: 0, y: 0, z: 0 }, true)
      chassis.setAngvel({ x: 0, y: 0, z: 0 }, true)
      euler.set(0, grid.yaw, 0)
      quat.setFromEuler(euler)
      chassis.setRotation(quat, true)
    }

    const pos = chassis.translation()
    if (pos.y < -12) {
      // fell through the world (huge frame delta) — put it back on the ring
      chassis.setTranslation({ x: Math.cos(config.startAngle) * config.radius, y: 0.6, z: Math.sin(config.startAngle) * config.radius }, true)
      chassis.setLinvel({ x: 0, y: 0, z: 0 }, true)
      return
    }

    botPositions[i].x = pos.x
    botPositions[i].z = pos.z
    updateBotProgress(i, pos.x, pos.z)

    // Held on the grid during the countdown.
    if (raceData.active && raceData.frozen) {
      chassis.setLinvel({ x: 0, y: chassis.linvel().y, z: 0 }, true)
      return
    }

    // Steer toward a point a little further around the ring, biased back onto
    // the preferred racing radius so the bot self-corrects after a bump.
    const angle = Math.atan2(pos.z, pos.x)
    const tx = Math.cos(angle + AHEAD) * config.radius
    const tz = Math.sin(angle + AHEAD) * config.radius
    let hx = tx - pos.x
    let hz = tz - pos.z
    const hlen = Math.hypot(hx, hz) || 1
    hx /= hlen
    hz /= hlen

    // Blend velocity toward the desired heading so collisions still shove it.
    const vel = chassis.linvel()
    chassis.setLinvel(
      {
        x: vel.x + (hx * config.speed - vel.x) * 0.12,
        y: vel.y,
        z: vel.z + (hz * config.speed - vel.z) * 0.12,
      },
      true,
    )

    // Face travel direction (model front is -Z).
    const yaw = Math.atan2(-hx, -hz)
    euler.set(0, yaw, 0)
    quat.setFromEuler(euler)
    const r = chassis.rotation()
    current.set(r.x, r.y, r.z, r.w)
    current.slerp(quat, 0.15)
    chassis.setRotation(current, true)

    wheelSpin.current += config.speed * dt * 2.4
    const s = wheelSpin.current
    if (fl.current) fl.current.rotation.x = s
    if (fr.current) fr.current.rotation.x = s
    if (rl.current) rl.current.rotation.x = s
    if (rr.current) rr.current.rotation.x = s
  })

  return (
    <RigidBody
      ref={body}
      type="dynamic"
      colliders={false}
      position={[Math.cos(config.startAngle) * config.radius, 0.6, Math.sin(config.startAngle) * config.radius]}
      ccd
      enabledRotations={[false, true, false]}
      linearDamping={0.5}
      angularDamping={2}
      friction={1}
      restitution={0.2}
      mass={2.4}
      canSleep={false}
    >
      <CuboidCollider args={[0.9, 0.4, 1.5]} position={[0, 0.42, 0]} />

      <group position={[0, 0.42, 0]} rotation={[0, Math.PI, 0]}>
        <RoundedBox args={[1.9, 0.5, 3.3]} radius={0.16} smoothness={5} castShadow receiveShadow>
          <meshStandardMaterial color={config.color} metalness={0.05} roughness={0.62} />
        </RoundedBox>
        <RoundedBox args={[1.5, 0.5, 1.5]} radius={0.16} smoothness={5} position={[0, 0.5, -0.1]} castShadow>
          <meshStandardMaterial color={config.cabin} metalness={0.1} roughness={0.5} />
        </RoundedBox>
        <mesh position={[0, 0.78, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.34, 24]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} />
        </mesh>
        {([0.62, -0.62] as const).map((x) => (
          <mesh key={x} position={[x, 0.12, 1.63]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color="#fffbeb" emissive="#fff2c0" emissiveIntensity={1.3} />
          </mesh>
        ))}
        <BotWheel position={[0.95, -0.16, 1.05]} spinRef={fr} />
        <BotWheel position={[-0.95, -0.16, 1.05]} spinRef={fl} />
        <BotWheel position={[0.95, -0.16, -1.05]} spinRef={rr} />
        <BotWheel position={[-0.95, -0.16, -1.05]} spinRef={rl} />
      </group>
    </RigidBody>
  )
}

export function BotCar() {
  return (
    <group>
      {BOTS.map((config) => (
        <Bot key={config.index} config={config} />
      ))}
    </group>
  )
}
