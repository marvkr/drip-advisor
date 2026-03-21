import { NextRequest } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import { toJpeg } from '@/lib/image'

export async function POST(request: NextRequest) {
  try {
    const { image, user_id, gender } = await request.json()

    if (!image || !user_id) {
      return Response.json({ error: 'image and user_id required' }, { status: 400 })
    }

    const supabase = createSupabaseClient()
    const raw = Buffer.from(image, 'base64')

    // Convert to JPEG (handles PNG, WebP — HEIC is pre-converted by the client)
    let buffer: Buffer
    try {
      buffer = await toJpeg(raw)
    } catch {
      // If sharp fails, use the raw buffer as-is
      buffer = raw
    }
    const fileName = `avatars/${user_id}/${Date.now()}.jpg`

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id,
        avatar_url: publicUrl,
        style_preferences: gender ? { gender } : {},
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (profileError) throw profileError

    // Seed default wardrobe items if user has none
    const { count } = await supabase
      .from('wardrobe_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)

    if (count === 0 && gender) {
      const templateUserId = `template-${gender}`
      const { data: templateItems } = await supabase
        .from('wardrobe_items')
        .select('name, brand, category, original_image_url, extracted_image_url')
        .eq('user_id', templateUserId)

      if (templateItems && templateItems.length > 0) {
        const newItems = templateItems.map((item) => ({
          ...item,
          user_id,
        }))
        await supabase.from('wardrobe_items').insert(newItems)
      }
    }

    return Response.json({ avatar_url: publicUrl })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Avatar upload error:', message, error)
    return Response.json(
      { error: 'Failed to upload avatar', details: message },
      { status: 500 }
    )
  }
}
