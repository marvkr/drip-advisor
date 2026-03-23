import { View, TextInput, Pressable, ActivityIndicator, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  value: string
  onChangeText: (text: string) => void
  onSubmit: () => void
  streaming: boolean
}

export function ChatInput({ value, onChangeText, onSubmit, streaming }: Props) {
  const canSend = value.trim().length > 0 && !streaming
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="What should I wear tonight?"
        placeholderTextColor="#666"
        onSubmitEditing={onSubmit}
        returnKeyType="send"
        editable={!streaming}
      />
      <Pressable
        style={[styles.button, !canSend && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={!canSend}
      >
        {streaming ? (
          <ActivityIndicator color="#000" size="small" />
        ) : (
          <Ionicons name="arrow-up" size={20} color="#000" />
        )}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#222',
    backgroundColor: '#000',
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    marginRight: 8,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#333' },
})
