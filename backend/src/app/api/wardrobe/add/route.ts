import { NextRequest } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import { geminiFlashImage } from '@/lib/gemini'
import { toJpeg, removeWhiteBackground } from '@/lib/image'
import { generateText } from 'ai'

export async function POST(request: NextRequest) {
  try {
    const { image, user_id, category, name, brand } = await request.json()

    if (!image || !user_id) {
      return Response.json({ error: 'image and user_id required' }, { status: 400 })
    }

    const supabase = createSupabaseClient()

    // Convert any format (HEIC, PNG, WebP, etc.) to JPEG
    const rawBuffer = Buffer.from(image, 'base64')
    const originalBuffer = await toJpeg(rawBuffer)
    const originalFileName = `wardrobe/${user_id}/original_${Date.now()}.jpg`

    const { error: origUploadErr } = await supabase.storage
      .from('images')
      .upload(originalFileName, originalBuffer, {
        contentType: 'image/jpeg',
      })

    if (origUploadErr) throw origUploadErr

    const { data: { publicUrl: originalUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(originalFileName)

    // Extract garment using Gemini
    const { files } = await generateText({
      model: geminiFlashImage,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: originalBuffer,
            },
            {
              type: 'text',
              text: 'Extract the clothing item from this image. Remove the background and any model or mannequin. Return only the isolated garment on a clean white background. Preserve fabric texture, color accuracy, pattern detail, and natural shape.',
            },
          ],
        },
      ],
      providerOptions: {
        google: { responseModalities: ['IMAGE', 'TEXT'] },
      },
    })

    let extractedUrl = originalUrl
    if (files && files.length > 0) {
      const rawExtracted = Buffer.from(files[0].base64, 'base64')
      // Remove white background → transparent PNG for layering on avatar
      const extractedBuffer = await removeWhiteBackground(rawExtracted)
      const extractedFileName = `wardrobe/${user_id}/extracted_${Date.now()}.png`

      const { error: extUploadErr } = await supabase.storage
        .from('images')
        .upload(extractedFileName, extractedBuffer, {
          contentType: 'image/png',
        })

      if (!extUploadErr) {
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(extractedFileName)
        extractedUrl = publicUrl
      }
    }

    // Insert wardrobe item
    const { data: item, error: insertError } = await supabase
      .from('wardrobe_items')
      .insert({
        user_id,
        name: name || 'Untitled Item',
        brand: brand || null,
        category: category || 'top',
        original_image_url: originalUrl,
        extracted_image_url: extractedUrl,
      })
      .select()
      .single()

    if (insertError) throw insertError

    return Response.json({ item })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Wardrobe add error:', message, error)
    return Response.json(
      { error: 'Failed to add wardrobe item', details: message },
      { status: 500 }
    )
  }
}
