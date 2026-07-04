import { Float, RoundedBox, Text } from '@react-three/drei'
import { CuboidCollider, RapierRigidBody, RigidBody } from '@react-three/rapier'
import { useRef } from 'react'
import type { InfoZone as InfoZoneType } from '../data/profile'

type InfoZoneProps = {
  zone: InfoZoneType
  onEnter: (zone: InfoZoneType) => void
  onExit: (zoneId: string) => void
}

export function InfoZone({ zone, onEnter, onExit }: InfoZoneProps) {
  const body = useRef<RapierRigidBody>(null)

  return (
    <group position={zone.position}>
      <RigidBody
        ref={body}
        type="fixed"
        sensor
        onIntersectionEnter={(payload) => {
          const userData = payload.other.rigidBody?.userData as { type?: string } | undefined
          if (userData?.type === 'car') onEnter(zone)
        }}
        onIntersectionExit={(payload) => {
          const userData = payload.other.rigidBody?.userData as { type?: string } | undefined
          if (userData?.type === 'car') onExit(zone.id)
        }}
      >
        <CuboidCollider args={[5, 3, 5]} position={[0, 2, 0]} />
      </RigidBody>

      <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.25}>
        <group position={[0, 0.2, 0]}>
          <RoundedBox args={[7.5, 0.35, 5.5]} radius={0.08} smoothness={4} position={[0, 0.18, 0]} receiveShadow>
            <meshStandardMaterial color="#e2e8f0" roughness={0.35} metalness={0.1} />
          </RoundedBox>

          <mesh position={[0, 2.2, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.14, 4.2, 12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.4} />
          </mesh>

          <RoundedBox args={[6.8, 4.2, 0.25]} radius={0.1} smoothness={4} position={[0, 3.8, 0]} castShadow>
            <meshStandardMaterial color={zone.accent} roughness={0.35} metalness={0.2} />
          </RoundedBox>

          {/* same text on both faces so the board reads from either side */}
          {([0, Math.PI] as const).map((flip) => (
            <group key={flip} rotation={[0, flip, 0]}>
              <Text
                position={[0, 4.55, 0.2]}
                fontSize={0.42}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                maxWidth={5.8}
                textAlign="center"
              >
                {zone.title}
              </Text>
              <Text
                position={[0, 3.95, 0.2]}
                fontSize={0.22}
                color="#e2e8f0"
                anchorX="center"
                anchorY="middle"
                maxWidth={5.8}
                textAlign="center"
              >
                {zone.subtitle}
              </Text>
            </group>
          ))}

          <mesh position={[0, 1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[3.2, 32]} />
            <meshStandardMaterial
              color={zone.accent}
              transparent
              opacity={0.18}
              emissive={zone.accent}
              emissiveIntensity={0.4}
            />
          </mesh>
        </group>
      </Float>
    </group>
  )
}
