import {
  DefensiveLine,
  ForwardLine,
  Lineup,
  LineupPlayer,
} from '../../types/lineup'
import { processImage } from './process-image'
import { ValueOf } from 'ts-essentials'
import { getImagePath } from './storage'
import { takeScreenshot } from './screenshot'

const tesseract = require('node-tesseract-ocr')

const config = {
  lang: 'eng',
  // TODO - what do these two do?
  oem: 1,
  psm: 3,
}

const NAME_REGEX = /[A-Z]\. [A-Z][a-z]+/
const POSITIONS = ['lw', 'c', 'rw', 'ld', 'rd'] as const

export const readLineupImage = async (): Promise<Lineup> => {
  const image = await takeScreenshot()
  const imagePath = await getImagePath('out.jpg')
  await processImage(image, imagePath, {
    crop: { x: 633, y: 272, w: 1272, h: 181 },
    invert: true,
  })

  const raw = await tesseract.recognize(imagePath, config)
  const lines = raw.split('\n')
  const cleanedLines = cleanLines(lines)

  const lineup = identifyLineup(cleanedLines)
  if (checkLineup(lineup)) {
    return lineup
  } else {
    throw new Error('Lineup invalid')
  }
}

const cleanLines = (lines: string[]) => {
  return lines.map(line => line.replace(/[\r\f]/, '')).filter(line => !!line)
}

type MissingPlayer = 'missing'
type MakeOptional<T extends ForwardLine | DefensiveLine> = {
  [key in keyof T]: T[key] | MissingPlayer
}
type OptionalForwardLine = MakeOptional<ForwardLine>
type OptionalDefensiveLine = MakeOptional<DefensiveLine>

export interface OptionalLineup {
  forwards: [
    OptionalForwardLine,
    OptionalForwardLine,
    OptionalForwardLine,
    OptionalForwardLine
  ]
  defense: [OptionalDefensiveLine, OptionalDefensiveLine, OptionalDefensiveLine]
}

interface ParsedPlayers {
  lw: LineupPlayer[]
  c: LineupPlayer[]
  rw: LineupPlayer[]
  ld: LineupPlayer[]
  rd: LineupPlayer[]
}

const identifyLineup = (lines: string[]): OptionalLineup => {
  const players: ParsedPlayers = {
    lw: [],
    c: [],
    rw: [],
    ld: [],
    rd: [],
  }

  // Player name and role will be on consecutive lines like:
  // - A.Panarin
  // - Screener
  //
  // All LWs come first, then Cs, RWs, LDs, RDs
  let position: keyof ParsedPlayers = 'lw'
  let playersSeen = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const nextLine = lines[i + 1]
    if (line.match(NAME_REGEX)) {
      playersSeen++
      players[position].push({ name: line, role: nextLine })
      i++

      if (
        (['lw', 'c', 'rw'].includes(position) && playersSeen === 4) ||
        (['ld', 'rd'].includes(position) && playersSeen === 3)
      ) {
        position = POSITIONS[POSITIONS.indexOf(position) + 1]
        playersSeen = 0
      }
    }
  }

  const { lw, c, rw, ld, rd } = players
  const orMissing = (
    player: LineupPlayer | undefined
  ): ValueOf<OptionalForwardLine> | ValueOf<OptionalDefensiveLine> =>
    player || 'missing'
  const buildForwardLine = (i: number): OptionalForwardLine => ({
    lw: orMissing(lw[i]),
    c: orMissing(c[i]),
    rw: orMissing(rw[i]),
  })
  const buildDefenseLine = (i: number): OptionalDefensiveLine => ({
    ld: orMissing(ld[i]),
    rd: orMissing(rd[i]),
  })

  return {
    forwards: [
      buildForwardLine(0),
      buildForwardLine(1),
      buildForwardLine(2),
      buildForwardLine(3),
    ],
    defense: [buildDefenseLine(0), buildDefenseLine(1), buildDefenseLine(2)],
  }
}

const checkLineup = (lineup: OptionalLineup): lineup is Lineup => {
  const { forwards, defense } = lineup

  ;[...forwards, ...defense].forEach((line, i) => {
    Object.values(line).forEach(player => {
      if (player === 'missing') {
        throw new Error(
          `Player missing from line at index ${i}: ${JSON.stringify(line)}`
        )
      }

      const { name, role } = player
      if (!name || !role) {
        throw new Error(
          `Incorrectly parsed player. name: ${name || 'undefined'} role: ${
            role || 'undefined'
          }`
        )
      }
    })
  })

  return true
}
