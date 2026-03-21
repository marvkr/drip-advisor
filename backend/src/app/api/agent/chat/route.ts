import { NextRequest } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import { geminiPro } from '@/lib/gemini'
import { streamText } from 'ai'

export async function POST(request: NextRequest) {
  try {
    const { messages, user_id } = await request.json()

    if (!messages) {
      return Response.json({ error: 'messages required' }, { status: 400 })
    }

    const supabase = createSupabaseClient()

    // Fetch user's wardrobe for context
    let wardrobeContext = 'No wardrobe items yet.'
    if (user_id) {
      const { data: items } = await supabase
        .from('wardrobe_items')
        .select('id, name, brand, category')
        .eq('user_id', user_id)

      if (items && items.length > 0) {
        wardrobeContext = JSON.stringify(items, null, 2)
      }
    }

    const result = streamText({
      model: geminiPro,
      system: `You are DripAdvisor, a confident personal stylist AI. You have access to the user's wardrobe below. When asked what to wear, suggest a specific combination of items from their wardrobe for the occasion. Be concise and stylish — one outfit, why it works, done. Always reference items by name. After responding, the app will automatically generate a try-on image of your suggested outfit.

User wardrobe:
${wardrobeContext}`,
      messages,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Agent chat error:', error)
    return Response.json(
      { error: 'Failed to process chat' },
      { status: 500 }
    )
  }
}
