import { BlockWalls } from './BlockWalls'
import { Crowd } from './Crowd'
import { Houses } from './Houses'
import { Lamps } from './Lamps'
import { Trees } from './Trees'

export function Decorations() {
  return (
    <group>
      <Trees />
      <Lamps />
      <Houses />
      <BlockWalls />
      <Crowd />
    </group>
  )
}
