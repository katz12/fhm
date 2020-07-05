import fs from 'fs'
const { stat, mkdir } = fs.promises

const IMAGE_PATH = 'images'

const ensurePathExists = async () => {
  try {
    await stat(IMAGE_PATH)
  } catch (e) {
    await mkdir(IMAGE_PATH)
  }
}

export const getImagePath = async (image: string) => {
  await ensurePathExists()
  return `${IMAGE_PATH}/${image}`
}
