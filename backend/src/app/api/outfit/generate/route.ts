import { NextRequest } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import { geminiFlashImage } from '@/lib/gemini'
import { generateText } from 'ai'

export async function POST(request: NextRequest) {
  try {
    const { avatar_url, top_id, bottom_id, user_id, name, occasion } = await request.json()

    if (!avatar_url || !top_id || !bottom_id) {
      return Response.json({ error: 'avatar_url, top_id, and bottom_id required' }, { status: 400 })
    }

    const supabase = createSupabaseClient()

    // Fetch both items
    const [{ data: top }, { data: bottom }] = await Promise.all([
      supabase.from('wardrobe_items').select('*').eq('id', top_id).single(),
      supabase.from('wardrobe_items').select('*').eq('id', bottom_id).single(),
    ])

    if (!top || !bottom) {
      return Response.json({ error: 'One or both items not found' }, { status: 404 })
    }

    // Fetch all images
    const [avatarRes, topRes, bottomRes] = await Promise.all([
      fetch(avatar_url),
      fetch(top.extracted_image_url),
      fetch(bottom.extracted_image_url),
    ])

    const avatarBuffer = Buffer.from(await avatarRes.arrayBuffer())
    const topBuffer = Buffer.from(await topRes.arrayBuffer())
    const bottomBuffer = Buffer.from(await bottomRes.arrayBuffer())

    const { files } = await generateText({
      model: geminiFlashImage,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', image: avatarBuffer },
            { type: 'image', image: topBuffer },
            { type: 'image', image: bottomBuffer },
            {
              type: 'text',
              text: `OUTFIT GENERATION — Generate a single photorealistic image of the person in Image 1 wearing the top from Image 2 AND the bottom from Image 3 together as a complete outfit.

IDENTITY LOCK (non-negotiable):
- Face, skin tone, hair color/style, body shape, and proportions must be pixel-identical to Image 1.
- Do NOT alter, beautify, or age the person in any way.

GARMENT APPLICATION:
- Dress the person in BOTH garments exactly as they appear — same colors, patterns, textures, and design details.
- The top (Image 2) should be tucked or untucked based on its natural style. Show realistic fit around shoulders, chest, and waist.
- The bottom (Image 3) should sit at the correct waist position with proper draping around hips, thighs, and legs.
- Where the top meets the bottom, show a natural transition — no floating gaps or unnatural overlaps.
- Render fabric weight correctly (stiff denim vs flowy linen vs structured cotton).

LIGHTING & SCENE:
- Match the lighting direction, color temperature, and intensity from Image 1.
- Add soft contact shadows between garments and on the body.
- Keep the same background as Image 1 (or a clean neutral background if the original is busy).

POSE:
- Keep the exact pose from Image 1. Both garments must conform to the pose.

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
      return Response.json({ error: 'Failed to generate outfit image' }, { status: 500 })
    }

    const outfitBuffer = Buffer.from(files[0].base64, 'base64')
    const outfitFileName = `outfits/${user_id || 'anon'}/${Date.now()}.png`

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(outfitFileName, outfitBuffer, {
        contentType: 'image/png',
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl: outfitUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(outfitFileName)

    // Create outfit record
    const { data: outfit, error: insertError } = await supabase
      .from('outfits')
      .insert({
        user_id: user_id || null,
        name: name || `${top.name} + ${bottom.name}`,
        occasion: occasion || null,
        top_id,
        bottom_id,
        generated_image_url: outfitUrl,
      })
      .select()
      .single()

    if (insertError) throw insertError

    return Response.json({ outfit })
  } catch (error) {
    console.error('Outfit generate error:', error)
    return Response.json(
      { error: 'Failed to generate outfit' },
      { status: 500 }
    )
  }
}
