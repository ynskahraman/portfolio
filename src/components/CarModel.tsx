import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

// BASE_URL-relative so the model still loads when the site is served from a
// sub-path (e.g. GitHub Pages project sites).
const URL = `${import.meta.env.BASE_URL}car.glb`

// The GLB is one merged mesh, centred at the origin, with its LENGTH along X
// (bbox ≈ 2 × 0.53 × 1.11). We rotate it so the length aligns with our forward
// (-Z) axis, scale it to fit the physics body, and lift it so the wheels sit on
// the ground. Tweak these three if the car looks off:
const SCALE = 1.5
const YAW = -Math.PI / 2 // flip to +Math.PI/2 if the car faces backwards
const Y_OFFSET = 0.44

export function CarModel() {
  const { scene } = useGLTF(URL)
  const model = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh) {
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
    return clone
  }, [scene])

  return <primitive object={model} scale={SCALE} rotation={[0, YAW, 0]} position={[0, Y_OFFSET, 0]} />
}

useGLTF.preload(URL)
