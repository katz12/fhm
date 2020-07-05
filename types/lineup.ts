import { MarkOptional } from 'ts-essentials'
import exp from 'constants'

export interface LineupPlayer {
  name: string
  role: string
}

export interface ForwardLine {
  lw: LineupPlayer
  c: LineupPlayer
  rw: LineupPlayer
}

export interface DefensiveLine {
  ld: LineupPlayer
  rd: LineupPlayer
}

export interface Lineup {
  forwards: [ForwardLine, ForwardLine, ForwardLine, ForwardLine]
  defense: [DefensiveLine, DefensiveLine, DefensiveLine]
}
