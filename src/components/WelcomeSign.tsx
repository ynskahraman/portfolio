import { Float, RoundedBox, Text } from '@react-three/drei'
import { contact } from '../data/profile'
import type { Lang } from '../data/i18n'

const tagline: Record<Lang, string> = {
  tr: 'Arabayla gez · Projeleri keşfet',
  en: 'Drive around · Explore the projects',
}

export function WelcomeSign({ lang }: { lang: Lang }) {
  return (
    <Float speed={1} floatIntensity={0.2} rotationIntensity={0.03}>
      <group position={[0, 0, -2]}>
        <RoundedBox args={[8.5, 0.35, 2.2]} radius={0.1} smoothness={4} position={[0, 2.6, 0]} castShadow>
          <meshStandardMaterial color="#ffffff" roughness={0.25} />
        </RoundedBox>
        <mesh position={[0, 1.3, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.16, 2.6, 12]} />
          <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.35} />
        </mesh>
        {/* same text on both faces so the sign reads from either side */}
        {([0.2, -0.2] as const).map((z) => (
          <group key={z} rotation={[0, z < 0 ? Math.PI : 0, 0]}>
            <Text position={[0, 2.95, Math.abs(z)]} fontSize={0.38} color="#0f172a" anchorX="center" anchorY="middle" fontWeight={800}>
              {contact.name}
            </Text>
            <Text position={[0, 2.35, Math.abs(z)]} fontSize={0.2} color="#475569" anchorX="center" anchorY="middle">
              {tagline[lang]}
            </Text>
          </group>
        ))}
      </group>
    </Float>
  )
}
