import { NextRequest } from 'next/server'
import { textToSpeech } from '@/lib/elevenlabs'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return Response.json({ error: 'text required' }, { status: 400 })
    }

    if (text.length > 5000) {
      return Response.json({ error: 'text too long (max 5000 chars)' }, { status: 400 })
    }

    const audioBuffer = await textToSpeech(text)
    const bytes = new Uint8Array(audioBuffer)

    return new Response(bytes, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': bytes.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('TTS error:', error)
    return Response.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    )
  }
}
