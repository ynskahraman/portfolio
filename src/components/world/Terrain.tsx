import { CuboidCollider, RigidBody } from '@react-three/rapier'

export function Terrain() {
  return (
    <group>
      {/* Big flat ground — single collider covers the whole drivable area. */}
      <RigidBody type="fixed" friction={1.3} restitution={0.05}>
        <CuboidCollider args={[120, 0.4, 120]} position={[0, -0.4, 0]} />
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <circleGeometry args={[115, 96]} />
          <meshStandardMaterial color="#f0a25f" roughness={1} metalness={0} />
        </mesh>
      </RigidBody>

      {/* Soft inner tint for visual depth around the hub. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <circleGeometry args={[44, 80]} />
        <meshStandardMaterial color="#f4ad6c" roughness={1} transparent opacity={0.7} />
      </mesh>

      {/* Faint outer band so the edge melts into the fog. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[104, 114, 96]} />
        <meshStandardMaterial color="#e89653" roughness={1} transparent opacity={0.6} />
      </mesh>
    </group>
  )
}
