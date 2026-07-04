import { ContactShadows } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Suspense, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { InfoZone as InfoZoneType, Project } from '../data/profile'
import { getInfoZones, getProjects } from '../data/profile'
import type { Lang } from '../data/i18n'
import { BotCar } from './BotCar'
import { Car } from './Car'
import { InfoZone } from './InfoZone'
import { SkidMarks } from './SkidMarks'
import { ProjectExhibit } from './ProjectExhibit'
import { WelcomeSign } from './WelcomeSign'
import { World } from './world/World'

// Warm orange vertical gradient backdrop (Bruno-Simon style), set as the
// scene background via a tiny canvas texture — cheap and dependency-free.
function GradientSky() {
  const { scene } = useThree()
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    const grad = ctx.createLinearGradient(0, 0, 0, 256)
    grad.addColorStop(0, '#ef7e3b')
    grad.addColorStop(0.55, '#f59b58')
    grad.addColorStop(1, '#ffd9a8')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 2, 256)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    const prev = scene.background
    /* eslint-disable react-hooks/immutability */
    scene.background = tex
    return () => {
      scene.background = prev
      tex.dispose()
    }
    /* eslint-enable react-hooks/immutability */
  }, [scene])
  return null
}

type ExperienceProps = {
  lang: Lang
  onProjectEnter: (project: Project) => void
  onProjectExit: (projectId: string) => void
  onZoneEnter: (zone: InfoZoneType) => void
  onZoneExit: (zoneId: string) => void
}

export function Experience({
  lang,
  onProjectEnter,
  onProjectExit,
  onZoneEnter,
  onZoneExit,
}: ExperienceProps) {
  const infoZones = useMemo(() => getInfoZones(lang), [lang])
  const projects = useMemo(() => getProjects(lang), [lang])

  return (
    <Canvas
      shadows="soft"
      camera={{ position: [9, 11, 13], fov: 36 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.06,
        powerPreference: 'high-performance',
      }}
    >
      <GradientSky />
      <fog attach="fog" args={['#ffcaa0', 90, 220]} />

      <ambientLight intensity={0.75} color="#fff1e0" />
      <directionalLight
        castShadow
        position={[28, 38, 18]}
        intensity={1.8}
        color="#fff0d8"
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={160}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-bias={-0.0005}
        shadow-normalBias={0.03}
      />
      <hemisphereLight args={['#ffe2c0', '#c98a4a', 0.6]} />

      <Suspense fallback={null}>
        <Physics gravity={[0, -22, 0]} timeStep="vary">
          <World />
          <WelcomeSign lang={lang} />
          <Car />
          <BotCar />
          {infoZones.map((zone) => (
            <InfoZone key={zone.id} zone={zone} onEnter={onZoneEnter} onExit={onZoneExit} />
          ))}
          {projects.map((project) => (
            <ProjectExhibit
              key={project.id}
              project={project}
              onEnter={onProjectEnter}
              onExit={onProjectExit}
            />
          ))}
        </Physics>
        <SkidMarks />
        <ContactShadows position={[0, 0.02, 0]} opacity={0.3} scale={130} blur={2.8} far={26} />
      </Suspense>
    </Canvas>
  )
}
