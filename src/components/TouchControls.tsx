import { useMemo } from 'react'
import { touchInput } from '../state/gameStore'

type Flag = keyof typeof touchInput

function HoldButton({
  flag,
  className,
  children,
  label,
}: {
  flag: Flag
  className?: string
  children: React.ReactNode
  label: string
}) {
  const press = (down: boolean) => (e: React.PointerEvent) => {
    e.preventDefault()
    touchInput[flag] = down
  }
  return (
    <button
      type="button"
      className={`touch-btn${className ? ` ${className}` : ''}`}
      aria-label={label}
      onPointerDown={press(true)}
      onPointerUp={press(false)}
      onPointerLeave={press(false)}
      onPointerCancel={press(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  )
}

// On-screen driving controls for touch devices: steering on the left,
// gas / reverse / nitro on the right. They just flip the shared touchInput
// flags, which the car OR-s with the keyboard every frame.
export function TouchControls() {
  const isTouch = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
    [],
  )
  if (!isTouch) return null

  return (
    <>
      <div className="touch-cluster touch-cluster--left">
        <HoldButton flag="left" label="Steer left">
          ◀
        </HoldButton>
        <HoldButton flag="right" label="Steer right">
          ▶
        </HoldButton>
      </div>
      <div className="touch-cluster touch-cluster--right">
        <HoldButton flag="boost" className="touch-btn--nitro" label="Nitro">
          ⚡
        </HoldButton>
        <HoldButton flag="backward" label="Reverse">
          ▼
        </HoldButton>
        <HoldButton flag="forward" className="touch-btn--gas" label="Gas">
          ▲
        </HoldButton>
      </div>
    </>
  )
}
