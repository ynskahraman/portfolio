import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CuboidCollider, type RapierRigidBody, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { spawnPosition } from '../data/profile'
import { useKeyboard } from '../hooks/useKeyboard'
import {
  carPosition,
  consumeNitroRefill,
  raceData,
  setGameState,
  touchInput,
  updatePlayerProgress,
} from '../state/gameStore'
import { CarModel } from './CarModel'

// Pre-allocated scratch objects — reused every frame to avoid GC pressure.
const forwardVector = new THREE.Vector3()
const rightVector = new THREE.Vector3()
const worldUp = new THREE.Vector3(0, 1, 0)
const quaternion = new THREE.Quaternion()
const idealPosition = new THREE.Vector3()
const lookTarget = new THREE.Vector3()

const SPAWN = { x: spawnPosition[0], y: spawnPosition[1], z: spawnPosition[2] }

// --- Tuning ------------------------------------------------------------------
const ACCEL = 28 // how quickly throttle builds speed
const MAX_SPEED = 18 // top forward speed
const BOOST_SPEED = 30 // top speed while nitro is firing
const REVERSE_SPEED = 8 // top reverse speed
const TURN_RATE = 2.7 // steering angular velocity (rad/s)
const NITRO_BURN = 1 / 2.6 // full tank lasts ~2.6s
const NITRO_RECHARGE = 1 / 6 // full recharge ~6s
// Chase camera. It trails BEHIND the car's heading (so you always see ahead),
// high up for a 3/4 look, and a touch to the right. The heading it uses is
// itself smoothed (CAM_TURN), so turns feel lazy instead of snapping the world.
const CAM_DIST = 11 // behind the car
const CAM_HEIGHT = 9 // above the car
const CAM_SIDE = 3.5 // offset to the car's right
const CAM_SMOOTH = 0.1 // camera position easing
const CAM_TURN = 0.045 // how fast the camera swings to follow a turn
const FOV_BASE = 38
const FOV_BOOST = 44

export function Car() {
  const body = useRef<RapierRigidBody>(null)
  const speed = useRef(0)
  const nitro = useRef(1)
  const flames = useRef<THREE.Group>(null)
  const camForward = useRef(new THREE.Vector3(0, 0, -1))
  const { keys, consumeRespawn } = useKeyboard()

  const resetCar = (chassis: RapierRigidBody) => {
    speed.current = 0
    chassis.setTranslation(SPAWN, true)
    chassis.setLinvel({ x: 0, y: 0, z: 0 }, true)
    chassis.setAngvel({ x: 0, y: 0, z: 0 }, true)
    chassis.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
  }

  useFrame((state, delta) => {
    const chassis = body.current
    if (!chassis) return

    // Clamp delta so a stutter/tab-switch can't fling the car across the map.
    const dt = Math.min(delta, 1 / 30)

    if (consumeRespawn()) resetCar(chassis)

    // Safety net: a huge frame delta (slow device, tab switch) can tunnel the
    // car through the ground collider — teleport it back instead of falling forever.
    if (chassis.translation().y < -12) resetCar(chassis)

    // Race start: teleport onto the grid slot, facing the race direction.
    if (raceData.playerGrid) {
      const g = raceData.playerGrid
      raceData.playerGrid = null
      speed.current = 0
      chassis.setTranslation({ x: g.x, y: 0.8, z: g.z }, true)
      chassis.setLinvel({ x: 0, y: 0, z: 0 }, true)
      chassis.setAngvel({ x: 0, y: 0, z: 0 }, true)
      quaternion.setFromAxisAngle(worldUp, g.yaw)
      chassis.setRotation(quaternion, true)
      camForward.current.set(0, 0, -1).applyQuaternion(quaternion)
    }

    const rotation = chassis.rotation()
    quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w)
    forwardVector.set(0, 0, -1).applyQuaternion(quaternion)

    let throttle = 0
    let steer = 0
    if (keys.current.forward || touchInput.forward) throttle += 1
    if (keys.current.backward || touchInput.backward) throttle -= 1
    if (keys.current.left || touchInput.left) steer += 1
    if (keys.current.right || touchInput.right) steer -= 1
    const boostHeld = keys.current.boost || touchInput.boost

    // Held on the grid during the race countdown.
    if (raceData.active && raceData.frozen) {
      throttle = 0
      steer = 0
      speed.current = 0
    }

    // Nitro: only fires while moving forward and there's charge left.
    const boosting = boostHeld && nitro.current > 0.02 && speed.current > 0.5
    if (boosting) nitro.current = Math.max(0, nitro.current - NITRO_BURN * dt)
    else nitro.current = Math.min(1, nitro.current + NITRO_RECHARGE * dt)
    if (consumeNitroRefill()) nitro.current = 1 // drove through a pickup

    // Arcade drive model: throttle drives a scalar speed, friction decays it,
    // then we set the planar velocity directly along the car's facing.
    const maxForward = boosting ? BOOST_SPEED : MAX_SPEED
    const accel = boosting ? ACCEL * 1.8 : ACCEL
    if (throttle > 0) speed.current += accel * dt
    else if (throttle < 0) speed.current -= ACCEL * dt
    else speed.current *= 0.94 // coast to a stop

    if (keys.current.brake) speed.current *= 0.82
    speed.current = Math.max(-REVERSE_SPEED, Math.min(maxForward, speed.current))
    if (Math.abs(speed.current) < 0.02) speed.current = 0

    const velocity = chassis.linvel()
    chassis.setLinvel(
      {
        x: forwardVector.x * speed.current,
        y: velocity.y, // keep gravity / ramp jumps intact
        z: forwardVector.z * speed.current,
      },
      true,
    )

    // Steering: only when moving; inverts in reverse, like a real car.
    if (steer !== 0 && Math.abs(speed.current) > 0.4) {
      const direction = speed.current < 0 ? -1 : 1
      const grip = Math.min(Math.abs(speed.current) / 5, 1)
      chassis.setAngvel({ x: 0, y: steer * direction * TURN_RATE * grip, z: 0 }, true)
    } else if (steer === 0) {
      const angular = chassis.angvel()
      chassis.setAngvel({ x: angular.x, y: angular.y * 0.8, z: angular.z }, true)
    }

    // Nitro flames flicker out the back while boosting.
    if (flames.current) {
      flames.current.visible = boosting
      if (boosting) {
        const flick = 0.7 + Math.random() * 0.6
        flames.current.scale.set(flick, flick, 1 + Math.random() * 0.8)
      }
    }

    // Smoothly swing the camera's heading toward the car's facing so it always
    // trails behind (you keep seeing ahead) without snapping during turns.
    if (Math.abs(speed.current) > 0.3) {
      camForward.current.lerp(forwardVector, 1 - Math.pow(1 - CAM_TURN, dt * 60))
      if (camForward.current.lengthSq() > 0.0001) camForward.current.normalize()
    }
    const cf = camForward.current
    rightVector.copy(cf).cross(worldUp) // camera's right on the ground

    const position = chassis.translation()
    idealPosition
      .set(position.x, position.y, position.z)
      .addScaledVector(cf, -CAM_DIST)
      .addScaledVector(rightVector, CAM_SIDE)
      .addScaledVector(worldUp, CAM_HEIGHT)
    state.camera.position.lerp(idealPosition, 1 - Math.pow(1 - CAM_SMOOTH, dt * 60))

    lookTarget.set(position.x, position.y + 1, position.z).addScaledVector(cf, 4)
    state.camera.lookAt(lookTarget)

    // FOV kick on boost for a sense of speed.
    const cam = state.camera as THREE.PerspectiveCamera
    const targetFov = boosting ? FOV_BOOST : FOV_BASE
    if (Math.abs(cam.fov - targetFov) > 0.05) {
      cam.fov += (targetFov - cam.fov) * (1 - Math.pow(0.02, dt))
      cam.updateProjectionMatrix()
    }

    // Publish live pose (cheap, no React notify) for NPCs, skid marks, minimap.
    carPosition.x = position.x
    carPosition.y = position.y
    carPosition.z = position.z
    carPosition.fx = forwardVector.x
    carPosition.fz = forwardVector.z
    // Skid when cornering or braking hard at speed (feeds the SkidMarks pool).
    carPosition.drifting =
      position.y < 1.4 &&
      ((Math.abs(steer) > 0 && Math.abs(speed.current) > 12) ||
        (keys.current.brake && Math.abs(speed.current) > 7))

    // Race progress for live ranking.
    if (raceData.active && !raceData.frozen) updatePlayerProgress(position.x, position.z)

    // Push telemetry to the HUD store — rounded so identical frames skip the
    // React notify entirely (see setGameState).
    setGameState({
      nitro: Math.round(nitro.current * 100) / 100,
      boosting,
      speed: Math.round(Math.abs(speed.current) * 10) / 10,
    })
  })

  return (
    <RigidBody
      ref={body}
      name="car"
      userData={{ type: 'car' }}
      colliders={false}
      position={spawnPosition}
      ccd
      linearDamping={0.4}
      angularDamping={2}
      canSleep={false}
      restitution={0.12}
      friction={1.4}
      mass={2.4}
    >
      <CuboidCollider args={[0.9, 0.4, 1.5]} position={[0, 0.42, 0]} />

      <CarModel />

      {/* Nitro flames — trail out the back (rear = +Z, hidden unless boosting) */}
      <group ref={flames} visible={false}>
        {([0.42, -0.42] as const).map((x) => (
          <mesh key={x} position={[x, 0.35, 1.85]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.16, 1, 12]} />
            <meshBasicMaterial color="#7dd3fc" transparent opacity={0.85} />
          </mesh>
        ))}
      </group>
    </RigidBody>
  )
}
