import { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../lib/api'
import { useUser } from '../../lib/user'

export default function TryOnScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>()
  const [tryonUrl, setTryonUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { userId, avatarUrl } = useUser()

  useEffect(() => {
    if (!avatarUrl || !itemId || !userId) return

    api.tryon
      .generate({ avatar_url: avatarUrl, item_id: itemId, user_id: userId })
      .then((data: { tryon_image_url: string }) => setTryonUrl(data.tryon_image_url))
      .catch(() => setError('Failed to generate try-on'))
      .finally(() => setLoading(false))
  }, [avatarUrl, itemId, userId])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Generating your look...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {tryonUrl && (
        <Image source={{ uri: tryonUrl }} style={styles.image} resizeMode="contain" />
      )}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Ionicons name="close" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  image: {
    flex: 1,
    width: '100%',
  },
  loadingText: {
    color: '#888',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
    marginTop: 16,
    fontSize: 16,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#222',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryText: { color: '#fff', fontSize: 14 },
  closeButton: {
    position: 'absolute',
    top: 56,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
