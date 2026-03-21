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

/**
 * Extract a garment layer by diffing a try-on image against the original avatar.
 * Pixels that changed significantly become the garment; unchanged areas become transparent.
 */
export async function extractGarmentLayer(
  avatarBuffer: Buffer,
  tryonBuffer: Buffer,
  size = 1024
): Promise<Buffer> {
  const { data: avatarData } = await sharp(avatarBuffer)
    .resize(size, size, { fit: 'cover' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { data: tryonData } = await sharp(tryonBuffer)
    .resize(size, size, { fit: 'cover' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const output = Buffer.alloc(size * size * 4)

  for (let i = 0; i < output.length; i += 4) {
    const diff =
      Math.abs(avatarData[i] - tryonData[i]) +
      Math.abs(avatarData[i + 1] - tryonData[i + 1]) +
      Math.abs(avatarData[i + 2] - tryonData[i + 2])

    if (diff > 50) {
      output[i] = tryonData[i]
      output[i + 1] = tryonData[i + 1]
      output[i + 2] = tryonData[i + 2]
      output[i + 3] = Math.min(255, Math.round(diff * 2))
    }
  }

  return sharp(output, {
    raw: { width: size, height: size, channels: 4 },
  })
    .png()
    .toBuffer()
}
