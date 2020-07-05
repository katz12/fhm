import util from 'util'

import { Lineup } from '../types/lineup'
import { readLineupImage } from './input/lineup'

const timeout = util.promisify(setTimeout)

const main = async () => {
  console.log('Capturing images')

  let lineup: Lineup | undefined
  while (!lineup) {
    console.log('Attempting to capture lineup')

    try {
      lineup = await readLineupImage()
    } catch (e) {
      console.log(`Lineup not read correctly\n${e}\nTrying again in 5 seconds`)
      await timeout(5000)
    }
  }

  console.log(lineup)
}

main()
