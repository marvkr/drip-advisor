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
const ITEM_WIDTH = 100
const ITEM_SPACING = 12
const SNAP_INTERVAL = ITEM_WIDTH + ITEM_SPACING

type WardrobeItem = {
  id: string
  name: string
  brand: string | null
  category: string
  extracted_image_url: string
}

const TOP_CATEGORIES = ['top', 'shirt', 'jacket', 'hoodie', 'sweater', 'blouse', 'coat', 'tee', 't-shirt']
const BOTTOM_CATEGORIES = ['bottom', 'pants', 'jeans', 'shorts', 'skirt', 'trousers']
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
          <Text style={styles.emptyCarouselText}>No {label.toLowerCase()} in wardrobe</Text>
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
        contentContainerStyle={{
          paddingHorizontal: sidePadding,
        }}
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
            {index === selectedIndex && (
              <View style={styles.selectedIndicator}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        )}
      />
      <Text style={styles.itemName} numberOfLines={1}>
        {items[selectedIndex]?.name ?? ''}
      </Text>
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

  const handleGenerate = async () => {
    if (!selectedTop || !selectedBottom || !avatarUrl) {
      Alert.alert('Select Items', 'Pick at least a top and bottom to generate a look.')
      return
    }
    setGenerating(true)
    try {
      const name = `${selectedTop.name} + ${selectedBottom.name}`
      await api.outfits.generate({
        avatar_url: avatarUrl,
        top_id: selectedTop.id,
        bottom_id: selectedBottom.id,
        user_id: userId,
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
      {/* Avatar */}
      <View style={styles.avatarSection}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="contain" />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-circle-outline" size={100} color="#333" />
          </View>
        )}
      </View>

      {/* Swipeable carousels */}
      <View style={styles.carouselsContainer}>
        <CategoryCarousel
          label="Tops"
          items={tops}
          selectedIndex={topIndex}
          onSelect={setTopIndex}
        />
        <CategoryCarousel
          label="Bottoms"
          items={bottoms}
          selectedIndex={bottomIndex}
          onSelect={setBottomIndex}
        />
        <CategoryCarousel
          label="Shoes"
          items={shoes}
          selectedIndex={shoeIndex}
          onSelect={setShoeIndex}
        />
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
              <Text style={styles.generateButtonText}>Generate Look</Text>
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
  // Avatar
  avatarSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  avatar: {
    width: 180,
    height: 280,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 180,
    height: 280,
    borderRadius: 16,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Carousels
  carouselsContainer: {
    paddingBottom: 8,
  },
  carouselSection: {
    marginBottom: 12,
  },
  carouselLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 20,
    marginBottom: 8,
  },
  emptyCarousel: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCarouselText: {
    color: '#444',
    fontSize: 13,
  },
  carouselItem: {
    width: ITEM_WIDTH,
    marginRight: ITEM_SPACING,
    borderRadius: 12,
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
    backgroundColor: '#222',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  itemName: {
    color: '#ccc',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 8,
  },
  generateButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
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
    fontSize: 16,
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
