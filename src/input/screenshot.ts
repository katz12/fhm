// @ts-ignore - TODO need types
import screenshot from 'screenshot-desktop'

export const takeScreenshot = async (): Promise<Buffer> => {
  return await screenshot()
}
