import { useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../lib/api'
import { useUser } from '../lib/user'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const ITEM_WIDTH = 80
const ITEM_SPACING = 10
const SNAP_INTERVAL = ITEM_WIDTH + ITEM_SPACING

const AVATAR_WIDTH = 220
const AVATAR_HEIGHT = 360

type WardrobeItem = {
  id: string
  name: string
  brand: string | null
  category: string
  extracted_image_url: string
  tryon_image_url: string | null
}

const TOP_CATEGORIES = ['top', 'shirt', 'jacket', 'hoodie', 'sweater', 'blouse', 'coat', 'tee', 't-shirt', 'outerwear']
const BOTTOM_CATEGORIES = ['bottom', 'pants', 'jeans', 'shorts', 'skirt', 'trousers', 'dress']
const SHOE_CATEGORIES = ['shoes', 'sneakers', 'boots', 'sandals', 'loafers', 'heels', 'footwear']

function matchesCategory(item: WardrobeItem, keywords: string[]) {
  const cat = item.category.toLowerCase()
  return keywords.some((k) => cat.includes(k))
}

function CategoryCarousel({
  label,
  items,
  selectedIndex,
  onSelect,
}: {
  label: string
  items: WardrobeItem[]
  selectedIndex: number
  onSelect: (index: number) => void
}) {
  const flatListRef = useRef<FlatList>(null)
  const sidePadding = (SCREEN_WIDTH - ITEM_WIDTH) / 2

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x
    const index = Math.round(offset / SNAP_INTERVAL)
    onSelect(Math.max(0, Math.min(index, items.length - 1)))
  }

  if (items.length === 0) {
    return (
      <View style={styles.carouselSection}>
        <Text style={styles.carouselLabel}>{label}</Text>
        <View style={styles.emptyCarousel}>
          <Text style={styles.emptyCarouselText}>No {label.toLowerCase()}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.carouselSection}>
      <Text style={styles.carouselLabel}>{label}</Text>
      <FlatList
        ref={flatListRef}
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: sidePadding }}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.carouselItem,
              index === selectedIndex && styles.carouselItemSelected,
            ]}
            onPress={() => {
              onSelect(index)
              flatListRef.current?.scrollToOffset({
                offset: index * SNAP_INTERVAL,
                animated: true,
              })
            }}
            activeOpacity={0.8}
          >
            <Image source={{ uri: item.extracted_image_url }} style={styles.carouselImage} />
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

export default function StylerScreen() {
  const { userId, avatarUrl } = useUser()
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const [topIndex, setTopIndex] = useState(0)
  const [bottomIndex, setBottomIndex] = useState(0)
  const [shoeIndex, setShoeIndex] = useState(0)

  useFocusEffect(
    useCallback(() => {
      if (!userId) return
      api.wardrobe
        .list(userId)
        .then((data: { items: WardrobeItem[] }) => setWardrobeItems(data.items))
        .catch(console.error)
        .finally(() => setLoading(false))
    }, [userId])
  )

  const tops = wardrobeItems.filter((i) => matchesCategory(i, TOP_CATEGORIES))
  const bottoms = wardrobeItems.filter((i) => matchesCategory(i, BOTTOM_CATEGORIES))
  const shoes = wardrobeItems.filter((i) => matchesCategory(i, SHOE_CATEGORIES))

  const selectedTop = tops[topIndex] ?? null
  const selectedBottom = bottoms[bottomIndex] ?? null
  const selectedShoes = shoes[shoeIndex] ?? null

  const handleGenerate = async () => {
    if (!selectedTop || !selectedBottom || !avatarUrl) {
      Alert.alert('Select Items', 'Pick at least a top and bottom to generate a look.')
      return
    }
    setGenerating(true)
    try {
      const name = [selectedTop.name, selectedBottom.name, selectedShoes?.name].filter(Boolean).join(' + ')
      await api.outfits.generate({
        avatar_url: avatarUrl,
        top_id: selectedTop.id,
        bottom_id: selectedBottom.id,
        shoes_id: selectedShoes?.id,
        user_id: userId!,
        name,
      })
      Alert.alert('Outfit Saved!', 'Check the Outfits tab to see your look.', [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch {
      Alert.alert('Error', 'Failed to generate outfit. Try again.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Try-on preview — shows the last selected piece fitted on the avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarFrame}>
          {(() => {
            const tryonUrl = selectedShoes?.tryon_image_url || selectedBottom?.tryon_image_url || selectedTop?.tryon_image_url
            if (tryonUrl) {
              return <Image source={{ uri: tryonUrl }} style={styles.avatar} resizeMode="cover" />
            }
            if (avatarUrl) {
              return <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="cover" />
            }
            return (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person-circle-outline" size={80} color="#333" />
              </View>
            )
          })()}
        </View>

        {/* Item names */}
        <Text style={styles.outfitLabel} numberOfLines={1}>
          {[selectedTop?.name, selectedBottom?.name, selectedShoes?.name]
            .filter(Boolean)
            .join('  ·  ') || 'Select items below'}
        </Text>
      </View>

      {/* Swipeable carousels */}
      <View style={styles.carouselsContainer}>
        <CategoryCarousel label="Tops" items={tops} selectedIndex={topIndex} onSelect={setTopIndex} />
        <CategoryCarousel label="Bottoms" items={bottoms} selectedIndex={bottomIndex} onSelect={setBottomIndex} />
        <CategoryCarousel label="Shoes" items={shoes} selectedIndex={shoeIndex} onSelect={setShoeIndex} />
      </View>

      {/* Generate button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.generateButton,
            (!selectedTop || !selectedBottom || generating) && styles.generateButtonDisabled,
          ]}
          onPress={handleGenerate}
          disabled={!selectedTop || !selectedBottom || generating}
        >
          {generating ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Ionicons name="sparkles" size={18} color="#000" />
              <Text style={styles.generateButtonText}>Generate Polished Look</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Close */}
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
  },
  // Avatar with overlays
  avatarSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 240,
  },
  avatarFrame: {
    width: AVATAR_WIDTH,
    height: AVATAR_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  avatar: {
    width: AVATAR_WIDTH,
    height: AVATAR_HEIGHT,
  },
  avatarPlaceholder: {
    width: AVATAR_WIDTH,
    height: AVATAR_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outfitLabel: {
    color: '#888',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  // Carousels
  carouselsContainer: {
    paddingBottom: 4,
  },
  carouselSection: {
    marginBottom: 8,
  },
  carouselLabel: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 20,
    marginBottom: 6,
  },
  emptyCarousel: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCarouselText: {
    color: '#444',
    fontSize: 12,
  },
  carouselItem: {
    width: ITEM_WIDTH,
    marginRight: ITEM_SPACING,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  carouselItemSelected: {
    borderColor: '#fff',
  },
  carouselImage: {
    width: '100%',
    aspectRatio: 0.85,
    backgroundColor: '#1a1a1a',
  },
  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 6,
  },
  generateButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  generateButtonDisabled: {
    opacity: 0.4,
  },
  generateButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
  },
  // Close
  closeButton: {
    position: 'absolute',
    top: 56,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
