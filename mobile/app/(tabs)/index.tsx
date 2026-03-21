import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { api } from '../../lib/api'
import { useUser } from '../../lib/user'

type WardrobeItem = {
  id: string
  name: string
  brand: string | null
  category: string
  extracted_image_url: string
  tryon_image_url: string | null
}

export default function WardrobeScreen() {
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const { userId, avatarUrl } = useUser()

  const loadItems = useCallback(async () => {
    if (!userId) return
    try {
      const data = await api.wardrobe.list(userId)
      setItems(data.items)
    } catch (err) {
      console.error('Failed to load wardrobe:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useFocusEffect(
    useCallback(() => {
      loadItems()
    }, [loadItems])
  )

  const handleAddItem = async () => {
    if (!avatarUrl) {
      router.push('/onboarding')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.8,
    })

    if (result.canceled || !result.assets[0].base64) return

    setAdding(true)
    try {
      const data = await api.wardrobe.add({
        image: result.assets[0].base64,
        user_id: userId,
      })
      setItems((prev) => [data.item, ...prev])
    } catch (err) {
      Alert.alert('Error', 'Failed to add item')
    } finally {
      setAdding(false)
    }
  }

  const handleTryOn = (itemId: string) => {
    if (!avatarUrl) {
      router.push('/onboarding')
      return
    }
    router.push(`/tryon/${itemId}`)
  }

  if (!avatarUrl) {
    return (
      <View style={styles.center}>
        <Ionicons name="person-circle-outline" size={80} color="#444" />
        <Text style={styles.emptyTitle}>Set up your avatar first</Text>
        <Text style={styles.emptySubtitle}>
          Take a photo so we can show you wearing any outfit
        </Text>
        <TouchableOpacity
          style={styles.setupButton}
          onPress={() => router.push('/onboarding')}
        >
          <Text style={styles.setupButtonText}>Set Up Avatar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="shirt-outline" size={60} color="#444" />
          <Text style={styles.emptyTitle}>Your wardrobe is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add clothing from screenshots, photos, or your camera
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          numColumns={2}
          contentContainerStyle={styles.grid}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleTryOn(item.id)}
            >
              <Image
                source={{ uri: item.extracted_image_url }}
                style={styles.cardImage}
              />
              <Text style={styles.cardName} numberOfLines={1}>
                {item.name}
              </Text>
              {item.brand && (
                <Text style={styles.cardBrand} numberOfLines={1}>
                  {item.brand}
                </Text>
              )}
              <Text style={styles.cardCategory}>{item.category}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddItem}
        disabled={adding}
      >
        {adding ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Ionicons name="add" size={28} color="#000" />
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#000',
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  setupButton: {
    marginTop: 24,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  setupButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  grid: { padding: 8 },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#111',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    aspectRatio: 0.75,
    backgroundColor: '#222',
  },
  cardName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    padding: 8,
    paddingBottom: 2,
  },
  cardBrand: {
    color: '#888',
    fontSize: 12,
    paddingHorizontal: 8,
  },
  cardCategory: {
    color: '#555',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
})
