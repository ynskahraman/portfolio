import { Decorations } from './Decorations'
import { FerrisWheel } from './FerrisWheel'
import { NitroPickups } from './NitroPickups'
import { Ramps } from './Ramps'
import { Roads } from './Roads'
import { Sky } from './Sky'
import { Terrain } from './Terrain'
import { TireStacks } from './TireStacks'
import { Track } from './Track'

export function World() {
  return (
    <group>
      <Sky />
      <Terrain />
      <Roads />
      <Track />
      <Ramps />
      <Decorations />
      <TireStacks />
      <NitroPickups />
      <FerrisWheel />
    </group>
  )
}
