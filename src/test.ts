import { readLineupImage } from './input/lineup'

const test = async () => {
  try {
    const lineup = await readLineupImage()
    console.log(JSON.stringify(lineup, null, 2))
  } catch (e) {
    console.log(e)
  }
}

test()
