import { NextRequest } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const user_id = request.nextUrl.searchParams.get('user_id')
    if (!user_id) {
      return Response.json({ error: 'user_id required' }, { status: 400 })
    }

    const supabase = createSupabaseClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (!profile) {
      return Response.json({ avatar_url: null, gender: null })
    }

    return Response.json({
      avatar_url: profile.avatar_url,
      gender: profile.style_preferences?.gender ?? null,
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return Response.json({ avatar_url: null, gender: null })
  }
}
