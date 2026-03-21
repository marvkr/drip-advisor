import { NextRequest } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const user_id = request.nextUrl.searchParams.get('user_id')

    if (!user_id) {
      return Response.json({ error: 'user_id required' }, { status: 400 })
    }

    const supabase = createSupabaseClient()

    const { data: items, error } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return Response.json({ items: items || [] })
  } catch (error) {
    console.error('Wardrobe list error:', error)
    return Response.json(
      { error: 'Failed to list wardrobe' },
      { status: 500 }
    )
  }
}
