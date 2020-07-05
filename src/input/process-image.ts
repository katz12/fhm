import sharp from 'sharp'

interface Config {
  crop?: {
    x: number
    y: number
    w: number
    h: number
  }
  invert?: true
}

export const processImage = async (
  buf: Buffer,
  dest: string,
  config: Config = {}
) => {
  let sharpPromise = sharp(buf)

  if (config.crop) {
    const { x: left, y: top, w: width, h: height } = config.crop
    sharpPromise = sharpPromise.extract({
      left,
      top,
      width,
      height,
    })
  }

  if (config.invert) {
    sharpPromise = sharpPromise.negate()
  }

  await sharpPromise.resize(3000).toFile(dest)
}
