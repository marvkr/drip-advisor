import sharp from 'sharp'

export async function toJpeg(buffer: Buffer, maxSize = 1600): Promise<Buffer> {
  return sharp(buffer)
    .resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer()
}

/**
 * Replace near-white pixels with transparency so garments can be overlaid on the avatar.
 * Threshold: pixels with R, G, B all > 230 become fully transparent.
 */
export async function removeWhiteBackground(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer).ensureAlpha()
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true })

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    if (r > 230 && g > 230 && b > 230) {
      data[i + 3] = 0 // set alpha to 0
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer()
}
