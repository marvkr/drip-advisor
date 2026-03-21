import { NextRequest } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import { geminiFlashImage } from '@/lib/gemini'
import { generateText } from 'ai'

export async function POST(request: NextRequest) {
  try {
    const { avatar_url, item_id, user_id } = await request.json()

    if (!avatar_url || !item_id) {
      return Response.json({ error: 'avatar_url and item_id required' }, { status: 400 })
    }

    const supabase = createSupabaseClient()

    // Fetch the wardrobe item
    const { data: item, error: fetchError } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('id', item_id)
      .single()

    if (fetchError || !item) {
      return Response.json({ error: 'Item not found' }, { status: 404 })
    }

    // Fetch both images
    const [avatarRes, garmentRes] = await Promise.all([
      fetch(avatar_url),
      fetch(item.extracted_image_url),
    ])

    const avatarBuffer = Buffer.from(await avatarRes.arrayBuffer())
    const garmentBuffer = Buffer.from(await garmentRes.arrayBuffer())

    // Generate try-on with Gemini
    const { files } = await generateText({
      model: geminiFlashImage,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', image: avatarBuffer },
            { type: 'image', image: garmentBuffer },
            {
              type: 'text',
              text: `VIRTUAL TRY-ON — Generate a single photorealistic image of the person in Image 1 wearing the garment from Image 2.

IDENTITY LOCK (non-negotiable):
- Face, skin tone, hair color/style, body shape, and proportions must be pixel-identical to Image 1.
- Do NOT alter, beautify, or age the person in any way.

GARMENT APPLICATION:
- Dress the person in the garment exactly as it appears in Image 2 — same color, pattern, texture, and design details.
- Fit the garment to the person's body naturally: show realistic draping, creases at the elbows/waist, and fabric weight (e.g. stiff denim vs flowy silk).
- If the garment has a logo, print, or embroidery, render it with correct perspective distortion on the body.

LIGHTING & SCENE:
- Match the lighting direction, color temperature, and intensity from Image 1.
- Add soft contact shadows where the garment meets the body and between fabric folds.
- Keep the same background as Image 1 (or a clean neutral background if the original is busy).

POSE:
- Keep the exact pose from Image 1. Do not adjust arms, legs, or torso angle.
- The garment must conform to the pose, not the other way around.

OUTPUT: A single photorealistic full-body image, fashion-editorial quality, 1024px resolution.`,
            },
          ],
        },
      ],
      providerOptions: {
        google: { responseModalities: ['IMAGE', 'TEXT'] },
      },
    })

    if (!files || files.length === 0) {
      return Response.json({ error: 'Failed to generate try-on image' }, { status: 500 })
    }

    // Store the result
    const tryonBuffer = Buffer.from(files[0].base64, 'base64')
    const tryonFileName = `tryon/${user_id || 'anon'}/${item_id}_${Date.now()}.png`

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(tryonFileName, tryonBuffer, {
        contentType: 'image/png',
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl: tryonUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(tryonFileName)

    // Update wardrobe item with try-on URL
    await supabase
      .from('wardrobe_items')
      .update({ tryon_image_url: tryonUrl })
      .eq('id', item_id)

    return Response.json({ tryon_image_url: tryonUrl })
  } catch (error) {
    console.error('Try-on generate error:', error)
    return Response.json(
      { error: 'Failed to generate try-on' },
      { status: 500 }
    )
  }
}
