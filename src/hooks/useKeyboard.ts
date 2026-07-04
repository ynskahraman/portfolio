import { useEffect, useRef } from 'react'

export type KeyboardState = {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  boost: boolean
  brake: boolean
  respawn: boolean
}

const initialState: KeyboardState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  boost: false,
  brake: false,
  respawn: false,
}

export function useKeyboard() {
  const keys = useRef<KeyboardState>({ ...initialState })

  useEffect(() => {
    const setMovement = (key: string, pressed: boolean) => {
      switch (key) {
        case 'w':
        case 'arrowup':
          keys.current.forward = pressed
          break
        case 's':
        case 'arrowdown':
          keys.current.backward = pressed
          break
        case 'a':
        case 'arrowleft':
          keys.current.left = pressed
          break
        case 'd':
        case 'arrowright':
          keys.current.right = pressed
          break
        case 'shift':
          keys.current.boost = pressed
          break
        case ' ':
        case 'spacebar':
        case 'control':
          keys.current.brake = pressed
          break
      }
    }

    const driveKeys = new Set([' ', 'spacebar', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'])

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      // Stop Space/arrows from scrolling the page or activating focused buttons.
      if (driveKeys.has(key)) event.preventDefault()
      setMovement(key, true)
      if (key === 'r') keys.current.respawn = true
    }

    const onKeyUp = (event: KeyboardEvent) => {
      setMovement(event.key.toLowerCase(), false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  const consumeRespawn = () => {
    if (!keys.current.respawn) return false
    keys.current.respawn = false
    return true
  }

  return { keys, consumeRespawn }
}
