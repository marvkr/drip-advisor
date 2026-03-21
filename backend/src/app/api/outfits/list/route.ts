import { NextRequest } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const user_id = request.nextUrl.searchParams.get('user_id')

    if (!user_id) {
      return Response.json({ error: 'user_id required' }, { status: 400 })
    }

    const supabase = createSupabaseClient()

    const { data: outfits, error } = await supabase
      .from('outfits')
      .select('*, top:wardrobe_items!top_id(*), bottom:wardrobe_items!bottom_id(*), shoes:wardrobe_items!shoes_id(*)')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return Response.json({ outfits: outfits || [] })
  } catch (error) {
    console.error('Outfits list error:', error)
    return Response.json(
      { error: 'Failed to list outfits' },
      { status: 500 }
    )
  }
}
