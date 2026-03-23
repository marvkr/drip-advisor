import { useState, useCallback } from 'react'
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert, StyleSheet } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../lib/api'
import { useUser } from '../../lib/user'
import { OutfitCard } from '../../components/outfits/OutfitCard'
import { OutfitBuilder } from '../../components/outfits/OutfitBuilder'
import type { Outfit } from '../../types/outfit'

export default function OutfitsScreen() {
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [loading, setLoading] = useState(true)
  const [showBuilder, setShowBuilder] = useState(false)
  const { userId, avatarUrl } = useUser()

  useFocusEffect(
    useCallback(() => {
      if (!userId) return
      api.outfits
        .list(userId)
        .then((data: { outfits: Outfit[] }) => setOutfits(data.outfits))
        .catch(console.error)
        .finally(() => setLoading(false))
    }, [userId])
  )

  const openBuilder = () => {
    if (!avatarUrl) {
      Alert.alert('Avatar Required', 'Set up your avatar first to build outfits.')
      return
    }
    setShowBuilder(true)
  }

  const renderItem = useCallback(
    ({ item }: { item: Outfit }) => (
      <OutfitCard
        name={item.name}
        occasion={item.occasion}
        generated_image_url={item.generated_image_url}
      />
    ),
    []
  )

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {outfits.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="layers-outline" size={60} color="#444" />
          <Text style={styles.emptyTitle}>No outfits yet</Text>
          <Text style={styles.emptySubtitle}>Combine a top + bottom to create your first outfit</Text>
          <Pressable style={styles.ctaPrimary} onPress={() => router.push('/styler')}>
            <Ionicons name="swap-horizontal" size={20} color="#000" />
            <Text style={styles.ctaPrimaryText}>Swipe to Style</Text>
          </Pressable>
          <Pressable style={styles.ctaSecondary} onPress={openBuilder}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.ctaSecondaryText}>Pick Manually</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={outfits}
          numColumns={2}
          contentContainerStyle={styles.grid}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}

      {outfits.length > 0 ? (
        <>
          <Pressable style={styles.fabSecondary} onPress={() => router.push('/styler')}>
            <Ionicons name="swap-horizontal" size={24} color="#fff" />
          </Pressable>
          <Pressable style={styles.fab} onPress={openBuilder}>
            <Ionicons name="add" size={28} color="#000" />
          </Pressable>
        </>
      ) : null}

      {userId && avatarUrl ? (
        <OutfitBuilder
          visible={showBuilder}
          userId={userId}
          avatarUrl={avatarUrl}
          onClose={() => setShowBuilder(false)}
          onSuccess={(outfit) => setOutfits((prev) => [outfit, ...prev])}
        />
      ) : null}
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
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '600', marginTop: 16 },
  emptySubtitle: { color: '#888', fontSize: 14, textAlign: 'center', marginTop: 8 },
  ctaPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
    gap: 8,
  },
  ctaPrimaryText: { color: '#000', fontWeight: '600', fontSize: 16 },
  ctaSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#333',
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 12,
    gap: 8,
  },
  ctaSecondaryText: { color: '#fff', fontWeight: '500', fontSize: 16 },
  grid: { padding: 8 },
  fabSecondary: {
    position: 'absolute',
    right: 20,
    bottom: 88,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
