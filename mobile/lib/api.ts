const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'

async function fetchJSON(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(error.error || 'Request failed')
  }

  return res.json()
}

export const api = {
  avatar: {
    upload: (body: { image: string; user_id: string }) =>
      fetchJSON('/api/avatar/upload', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  wardrobe: {
    add: (body: { image: string; user_id: string; category?: string; name?: string; brand?: string }) =>
      fetchJSON('/api/wardrobe/add', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    list: (userId: string) =>
      fetchJSON(`/api/wardrobe/list?user_id=${encodeURIComponent(userId)}`),
  },

  tryon: {
    generate: (body: { avatar_url: string; item_id: string; user_id: string }) =>
      fetchJSON('/api/tryon/generate', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  outfits: {
    list: (userId: string) =>
      fetchJSON(`/api/outfits/list?user_id=${encodeURIComponent(userId)}`),

    generate: (body: {
      avatar_url: string
      top_id: string
      bottom_id: string
      user_id: string
      name?: string
      occasion?: string
    }) =>
      fetchJSON('/api/outfit/generate', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  agent: {
    chat: async (
      body: { messages: { role: string; content: string }[]; user_id: string },
      onChunk: (chunk: string) => void
    ) => {
      const res = await fetch(`${API_BASE}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Chat request failed')

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })
        // Parse Vercel AI SDK data stream format
        const lines = text.split('\n')
        for (const line of lines) {
          if (line.startsWith('0:')) {
            // Text delta - parse the JSON string value
            try {
              const content = JSON.parse(line.slice(2))
              if (typeof content === 'string') {
                onChunk(content)
              }
            } catch {
              // Skip malformed lines
            }
          }
        }
      }
    },
  },
}
