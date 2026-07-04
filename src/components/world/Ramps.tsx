import * as THREE from 'three'
import { RigidBody } from '@react-three/rapier'

const LEN = 10
const HEIGHT = 3
const WIDTH = 7

// A real wedge (triangular prism): thin edge meets the ground at y=0 and the
// surface ramps up to HEIGHT, so the car drives up smoothly and launches off
// the back. Built once and shared by every ramp.
const rampGeometry = (() => {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.lineTo(LEN, 0)
  shape.lineTo(LEN, HEIGHT)
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, { depth: WIDTH, bevelEnabled: false })
  geo.translate(-LEN / 2, 0, -WIDTH / 2) // centre on X/Z, base on ground
  geo.computeVertexNormals()
  return geo
})()

type RampProps = { position: [number, number]; yaw?: number }

function Ramp({ position, yaw = 0 }: RampProps) {
  return (
    <RigidBody
      type="fixed"
      colliders="hull"
      position={[position[0], 0, position[1]]}
      rotation={[0, yaw, 0]}
      friction={1}
    >
      <mesh geometry={rampGeometry} castShadow receiveShadow>
        <meshStandardMaterial color="#566072" roughness={0.7} metalness={0.12} />
      </mesh>
    </RigidBody>
  )
}

// Ramps live in clear infield spots (radius < 50), away from roads, pads,
// trees and the track band (56–68). Each launches toward open ground.
export function Ramps() {
  return (
    <group>
      <Ramp position={[-43, 9]} yaw={0} />
      <Ramp position={[43, 9]} yaw={Math.PI} />
      <Ramp position={[-24, -44]} yaw={-Math.PI / 2} />
      <Ramp position={[24, -44]} yaw={-Math.PI / 2} />
    </group>
  )
}
