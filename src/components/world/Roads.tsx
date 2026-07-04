// Flat painted roads. The ground collider handles physics, so these are purely
// visual — laid just above the grass at y ≈ 0.02.

type Strip = { position: [number, number]; size: [number, number] }

const roads: Strip[] = [
  { position: [0, 1], size: [12, 74] }, // north–south boulevard (contact ↔ gallery)
  { position: [0, 6], size: [62, 12] }, // east–west boulevard (zones)
  { position: [0, -30], size: [58, 8] }, // project gallery street
  { position: [-24, 6], size: [8, 22] }, // spur to about / experience
  { position: [24, 6], size: [8, 22] }, // spur to skills / community
  { position: [34, 0], size: [48, 9] }, // pit lane: hub → track entrance (east gap)
]

function Road({ position, size }: Strip) {
  return (
    <group position={[position[0], 0.02, position[1]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={size} />
        <meshStandardMaterial color="#3d4450" roughness={0.9} metalness={0.04} />
      </mesh>
      {/* dashed centre line along the longer axis */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={size[0] > size[1] ? [size[0] * 0.94, 0.3] : [0.3, size[1] * 0.94]} />
        <meshStandardMaterial color="#f8d34a" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function Roads() {
  return (
    <group>
      {/* central plaza */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]} receiveShadow>
        <circleGeometry args={[13, 64]} />
        <meshStandardMaterial color="#454d5a" roughness={0.9} metalness={0.04} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.026, 0]}>
        <ringGeometry args={[3.4, 3.8, 48]} />
        <meshStandardMaterial color="#f8d34a" roughness={0.7} />
      </mesh>

      {roads.map((road) => (
        <Road key={`${road.position.join('-')}`} {...road} />
      ))}
    </group>
  )
}
