import { RigidBody } from '@react-three/rapier'

type HouseProps = {
  position: [number, number]
  rotation?: number
  wall: string
  roof: string
  scale?: number
}

function House({ position, rotation = 0, wall, roof, scale = 1 }: HouseProps) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[position[0], 0, position[1]]} rotation={[0, rotation, 0]}>
      <group scale={scale}>
        {/* body */}
        <mesh castShadow receiveShadow position={[0, 1.4, 0]}>
          <boxGeometry args={[4, 2.8, 4]} />
          <meshStandardMaterial color={wall} roughness={0.85} />
        </mesh>
        {/* roof — 4-sided pyramid */}
        <mesh castShadow position={[0, 3.6, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[3.3, 1.8, 4]} />
          <meshStandardMaterial color={roof} roughness={0.8} flatShading />
        </mesh>
        {/* door */}
        <mesh position={[0, 0.85, 2.01]}>
          <boxGeometry args={[0.9, 1.7, 0.08]} />
          <meshStandardMaterial color="#5b3b22" roughness={0.7} />
        </mesh>
        {/* windows */}
        {([-1.2, 1.2] as const).map((x) => (
          <mesh key={x} position={[x, 1.7, 2.01]}>
            <boxGeometry args={[0.8, 0.8, 0.06]} />
            <meshStandardMaterial color="#bfe3ff" emissive="#7fb8e6" emissiveIntensity={0.3} metalness={0.4} roughness={0.2} />
          </mesh>
        ))}
      </group>
    </RigidBody>
  )
}

// A village beyond the track (radius > 76) plus a couple in the infield.
// Nothing sits on the racing band (radius 54–70).
const houses: HouseProps[] = [
  { position: [-70, -40], rotation: 0.6, wall: '#f4e3c1', roof: '#c0563b', scale: 1.1 },
  { position: [-80, -22], rotation: 0.2, wall: '#e8d2b0', roof: '#8a5a3c' },
  { position: [-64, -56], rotation: 0.9, wall: '#f0e0c8', roof: '#3f6f8c', scale: 0.95 },
  { position: [-82, -6], rotation: 0.05, wall: '#ead7be', roof: '#9c6b3f' },
  { position: [-50, -66], rotation: -0.5, wall: '#f4e3c1', roof: '#5a7d4f', scale: 1.05 },
  { position: [70, 42], rotation: -2.2, wall: '#e6cfa8', roof: '#b04a3a' },
  { position: [80, 24], rotation: -1.9, wall: '#f0e2c6', roof: '#7a4a8c', scale: 1.1 },
  { position: [62, 56], rotation: -2.5, wall: '#ecd9b6', roof: '#3f6f8c' },
  { position: [88, 0], rotation: -1.6, wall: '#f4e3c1', roof: '#b04a3a', scale: 1.05 },
  { position: [-88, -44], rotation: 0.7, wall: '#ead7be', roof: '#5a7d4f' },
]

export function Houses() {
  return (
    <group>
      {houses.map((house) => (
        <House key={`${house.position[0]}-${house.position[1]}`} {...house} />
      ))}
    </group>
  )
}
