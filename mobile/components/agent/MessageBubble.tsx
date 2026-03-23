import { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { OutfitCarousel } from './OutfitCarousel'
import type { WardrobeItem } from '../../types/wardrobe'

type Props = {
  role: 'user' | 'assistant'
  content: string
  outfitItems?: WardrobeItem[]
  showLoader?: boolean
}

export const MessageBubble = memo(function MessageBubble({
  role,
  content,
  outfitItems,
  showLoader,
}: Props) {
  const isUser = role === 'user'
  return (
    <View style={isUser ? styles.userRow : styles.assistantRow}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {content || (showLoader ? '...' : '')}
        </Text>
      </View>
      {outfitItems && outfitItems.length > 0 ? (
        <OutfitCarousel items={outfitItems} />
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  userRow: { alignItems: 'flex-end', marginBottom: 8 },
  assistantRow: { alignItems: 'flex-start', marginBottom: 8 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  userBubble: { backgroundColor: '#fff' },
  assistantBubble: { backgroundColor: '#1a1a1a' },
  text: { fontSize: 15, lineHeight: 20 },
  userText: { color: '#000' },
  assistantText: { color: '#fff' },
})
