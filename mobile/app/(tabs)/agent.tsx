import { useState, useRef, useEffect, useCallback } from 'react'
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'
import { api } from '../../lib/api'
import { useUser } from '../../lib/user'
import { parseOutfitTag } from '../../lib/parseOutfitTag'
import { WelcomeEmpty } from '../../components/agent/WelcomeEmpty'
import { MessageBubble } from '../../components/agent/MessageBubble'
import { ChatInput } from '../../components/agent/ChatInput'
import type { WardrobeItem } from '../../types/wardrobe'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  outfitItems?: WardrobeItem[]
}

export default function AgentScreen() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const flatListRef = useRef<FlatList>(null)
  const { userId } = useUser()
  const wardrobeRef = useRef<WardrobeItem[]>([])

  useEffect(() => {
    if (!userId) return
    api.wardrobe
      .list(userId)
      .then(({ items }: { items: WardrobeItem[] }) => { wardrobeRef.current = items })
      .catch(() => {})
  }, [userId])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || streaming || !userId) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text }
    const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '' }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput('')
    setStreaming(true)

    try {
      const chatMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }))

      await api.agent.chat({ messages: chatMessages, user_id: userId }, (chunk: string) => {
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last.role === 'assistant') last.content += chunk
          return updated
        })
      })

      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last.role !== 'assistant' || !last.content) return updated
        const { clean, ids } = parseOutfitTag(last.content)
        last.content = clean
        if (ids.length > 0) {
          last.outfitItems = ids
            .map((id) => wardrobeRef.current.find((item) => item.id === id))
            .filter((item): item is WardrobeItem => !!item && !!item.extracted_image_url)
        }
        return updated
      })
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last.role === 'assistant') last.content = 'Sorry, something went wrong. Try again.'
        return updated
      })
    } finally {
      setStreaming(false)
    }
  }

  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => (
      <MessageBubble
        role={item.role}
        content={item.content}
        outfitItems={item.outfitItems}
        showLoader={streaming && index === messages.length - 1}
      />
    ),
    [streaming, messages.length]
  )

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {messages.length === 0 ? (
        <WelcomeEmpty />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}
      <ChatInput
        value={input}
        onChangeText={setInput}
        onSubmit={sendMessage}
        streaming={streaming}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  list: { padding: 16, paddingBottom: 8 },
})
