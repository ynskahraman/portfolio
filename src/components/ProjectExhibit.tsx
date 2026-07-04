import { Float, RoundedBox, Text } from '@react-three/drei'
import { CuboidCollider, RapierRigidBody, RigidBody } from '@react-three/rapier'
import { useRef } from 'react'
import type { Project } from '../data/profile'

type ProjectExhibitProps = {
  project: Project
  onEnter: (project: Project) => void
  onExit: (projectId: string) => void
}

export function ProjectExhibit({ project, onEnter, onExit }: ProjectExhibitProps) {
  const body = useRef<RapierRigidBody>(null)

  return (
    <group position={project.position}>
      <RigidBody
        ref={body}
        type="fixed"
        sensor
        onIntersectionEnter={(payload) => {
          const userData = payload.other.rigidBody?.userData as { type?: string } | undefined
          if (userData?.type === 'car') onEnter(project)
        }}
        onIntersectionExit={(payload) => {
          const userData = payload.other.rigidBody?.userData as { type?: string } | undefined
          if (userData?.type === 'car') onExit(project.id)
        }}
      >
        <CuboidCollider args={[2.8, 2.5, 2.8]} position={[0, 2.2, 0]} />
      </RigidBody>

      <Float speed={1.5} rotationIntensity={0.08} floatIntensity={0.35}>
        <group>
          <RoundedBox args={[4.8, 0.4, 4.8]} radius={0.12} smoothness={5} position={[0, 0.2, 0]} receiveShadow>
            <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
          </RoundedBox>

          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 3, 12]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
          </mesh>

          <RoundedBox args={[4.2, 3.4, 0.3]} radius={0.14} smoothness={5} position={[0, 3.2, 0]} castShadow>
            <meshStandardMaterial
              color={project.color}
              roughness={0.25}
              metalness={0.35}
              emissive={project.color}
              emissiveIntensity={project.live ? 0.45 : 0.2}
            />
          </RoundedBox>

          {/* same text on both faces so the board reads from either side */}
          {([0, Math.PI] as const).map((flip) => (
            <group key={flip} rotation={[0, flip, 0]}>
              {project.live && (
                <mesh position={[1.6, 4.2, 0.2]}>
                  <sphereGeometry args={[0.18, 16, 16]} />
                  <meshStandardMaterial color="#22c55e" emissive="#4ade80" emissiveIntensity={1.5} />
                </mesh>
              )}
              <Text
                position={[0, 3.55, 0.2]}
                fontSize={0.34}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                maxWidth={3.6}
                textAlign="center"
              >
                {project.title}
              </Text>
              <Text
                position={[0, 2.85, 0.2]}
                fontSize={0.16}
                color="#f8fafc"
                anchorX="center"
                anchorY="middle"
                maxWidth={3.6}
                textAlign="center"
              >
                {project.period}
              </Text>
            </group>
          ))}

          <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.2, 2.6, 48]} />
            <meshStandardMaterial
              color={project.color}
              transparent
              opacity={0.35}
              emissive={project.color}
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      </Float>
    </group>
  )
}
