import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useShareIntentContext } from '../contexts/ShareIntentContext'
import { api } from '../lib/api'
import { useUser } from '../lib/user'

export function ShareIntentModal() {
  const { sharedContent, isShareModalVisible, dismissShareModal } =
    useShareIntentContext()
  const { userId } = useUser()
  const [name, setName] = useState('')
  const [adding, setAdding] = useState(false)

  const handleAddToWardrobe = async () => {
    if (!sharedContent) return

    setAdding(true)
    try {
      // Get the shared image file
      const files = sharedContent.files
      if (!files || files.length === 0) {
        Alert.alert('No image found', 'Share an image to add to your wardrobe.')
        return
      }

      // Read the file as base64
      const file = files[0]
      const response = await fetch(file.path)
      const blob = await response.blob()
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.split(',')[1])
        }
        reader.readAsDataURL(blob)
      })

      await api.wardrobe.add({
        image: base64,
        user_id: userId,
        name: name || undefined,
      })

      Alert.alert('Added!', 'Item added to your wardrobe.', [
        { text: 'OK', onPress: dismissShareModal },
      ])
    } catch (err) {
      Alert.alert('Error', 'Failed to add item to wardrobe.')
    } finally {
      setAdding(false)
    }
  }

  if (!isShareModalVisible || !sharedContent) return null

  const imageUri = sharedContent.files?.[0]?.path

  return (
    <Modal
      visible={isShareModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={dismissShareModal}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={dismissShareModal}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Add to Wardrobe</Text>
          <View style={{ width: 24 }} />
        </View>

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
        )}

        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder="Item name (optional)"
          placeholderTextColor="#666"
        />

        <TouchableOpacity
          style={[styles.addButton, adding && styles.addButtonDisabled]}
          onPress={handleAddToWardrobe}
          disabled={adding}
        >
          {adding ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.addButtonText}>Add to Wardrobe</Text>
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#111',
    marginBottom: 20,
  },
  nameInput: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
})
