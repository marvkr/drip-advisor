import { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../lib/api'
import { useUser } from '../../lib/user'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function AgentScreen() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const flatListRef = useRef<FlatList>(null)
  const { userId } = useUser()

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || streaming || !userId) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    }

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput('')
    setStreaming(true)

    try {
      const chatMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      await api.agent.chat(
        { messages: chatMessages, user_id: userId },
        (chunk: string) => {
          setMessages((prev) => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last.role === 'assistant') {
              last.content += chunk
            }
            return updated
          })
        }
      )
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last.role === 'assistant') {
          last.content = 'Sorry, something went wrong. Try again.'
        }
        return updated
      })
    } finally {
      setStreaming(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {messages.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="sparkles" size={48} color="#444" />
          <Text style={styles.welcomeTitle}>DripAdvisor</Text>
          <Text style={styles.welcomeSubtitle}>
            Ask me what to wear for any occasion
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  item.role === 'user' ? styles.userText : styles.assistantText,
                ]}
              >
                {item.content || (streaming ? '...' : '')}
              </Text>
            </View>
          )}
        />
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="What should I wear tonight?"
          placeholderTextColor="#666"
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          editable={!streaming}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!input.trim() || streaming) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || streaming}
        >
          {streaming ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <Ionicons name="arrow-up" size={20} color="#000" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  welcomeTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
  },
  welcomeSubtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
  },
  messageList: { padding: 16, paddingBottom: 8 },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1a1a1a',
  },
  messageText: { fontSize: 15, lineHeight: 20 },
  userText: { color: '#000' },
  assistantText: { color: '#fff' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#222',
    backgroundColor: '#000',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    marginRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
  },
})
