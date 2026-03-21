import { NextRequest } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { image, user_id } = await request.json()

    if (!image || !user_id) {
      return Response.json({ error: 'image and user_id required' }, { status: 400 })
    }

    const supabase = createSupabaseClient()
    const buffer = Buffer.from(image, 'base64')
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

    // Upsert profile with avatar URL
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id,
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (profileError) throw profileError

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
