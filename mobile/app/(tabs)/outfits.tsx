import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../lib/api'
import { useUser } from '../../lib/user'

type Outfit = {
  id: string
  name: string
  occasion: string | null
  generated_image_url: string
  created_at: string
}

type WardrobeItem = {
  id: string
  name: string
  brand: string | null
  category: string
  extracted_image_url: string
}

const TOP_CATEGORIES = ['top', 'shirt', 'jacket', 'hoodie', 'sweater', 'blouse', 'coat', 'tee', 't-shirt']
const BOTTOM_CATEGORIES = ['bottom', 'pants', 'jeans', 'shorts', 'skirt', 'trousers']

function isTop(item: WardrobeItem) {
  return TOP_CATEGORIES.some((c) => item.category.toLowerCase().includes(c))
}

function isBottom(item: WardrobeItem) {
  return BOTTOM_CATEGORIES.some((c) => item.category.toLowerCase().includes(c))
}

export default function OutfitsScreen() {
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [loading, setLoading] = useState(true)
  const { userId, avatarUrl } = useUser()

  // Build modal state
  const [showBuilder, setShowBuilder] = useState(false)
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [selectedTop, setSelectedTop] = useState<WardrobeItem | null>(null)
  const [selectedBottom, setSelectedBottom] = useState<WardrobeItem | null>(null)
  const [outfitName, setOutfitName] = useState('')
  const [occasion, setOccasion] = useState('')
  const [generating, setGenerating] = useState(false)

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

  const openBuilder = async () => {
    if (!avatarUrl) {
      Alert.alert('Avatar Required', 'Set up your avatar first to build outfits.')
      return
    }
    setShowBuilder(true)
    setSelectedTop(null)
    setSelectedBottom(null)
    setOutfitName('')
    setOccasion('')
    setLoadingItems(true)
    try {
      const data = await api.wardrobe.list(userId!)
      setWardrobeItems(data.items)
    } catch {
      Alert.alert('Error', 'Failed to load wardrobe items.')
    } finally {
      setLoadingItems(false)
    }
  }

  const handleGenerate = async () => {
    if (!selectedTop || !selectedBottom || !avatarUrl) return
    setGenerating(true)
    try {
      const data = await api.outfits.generate({
        avatar_url: avatarUrl,
        top_id: selectedTop.id,
        bottom_id: selectedBottom.id,
        user_id: userId!,
        name: outfitName || `${selectedTop.name} + ${selectedBottom.name}`,
        occasion: occasion || undefined,
      })
      setOutfits((prev) => [data.outfit, ...prev])
      setShowBuilder(false)
    } catch {
      Alert.alert('Error', 'Failed to generate outfit. Try again.')
    } finally {
      setGenerating(false)
    }
  }

  const tops = wardrobeItems.filter(isTop)
  const bottoms = wardrobeItems.filter(isBottom)

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
          <Text style={styles.emptySubtitle}>
            Combine a top + bottom to create your first outfit
          </Text>
          <TouchableOpacity style={styles.buildButtonEmpty} onPress={() => router.push('/styler')}>
            <Ionicons name="swap-horizontal" size={20} color="#000" />
            <Text style={styles.buildButtonEmptyText}>Swipe to Style</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buildButtonSecondary} onPress={openBuilder}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.buildButtonSecondaryText}>Pick Manually</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={outfits}
          numColumns={2}
          contentContainerStyle={styles.grid}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                source={{ uri: item.generated_image_url }}
                style={styles.cardImage}
              />
              <Text style={styles.cardName} numberOfLines={1}>
                {item.name}
              </Text>
              {item.occasion && (
                <Text style={styles.cardOccasion} numberOfLines={1}>
                  {item.occasion}
                </Text>
              )}
            </View>
          )}
        />
      )}

      {outfits.length > 0 && (
        <>
          <TouchableOpacity style={styles.fabSecondary} onPress={() => router.push('/styler')}>
            <Ionicons name="swap-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.fab} onPress={openBuilder}>
            <Ionicons name="add" size={28} color="#000" />
          </TouchableOpacity>
        </>
      )}

      <Modal
        visible={showBuilder}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => !generating && setShowBuilder(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => !generating && setShowBuilder(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Build Outfit</Text>
            <View style={{ width: 24 }} />
          </View>

          {loadingItems ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : (
            <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 40 }}>
              <Text style={styles.sectionLabel}>Select a Top</Text>
              {tops.length === 0 ? (
                <Text style={styles.noItemsText}>No tops in your wardrobe</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.picker}>
                  {tops.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.pickerItem,
                        selectedTop?.id === item.id && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedTop(item)}
                    >
                      <Image source={{ uri: item.extracted_image_url }} style={styles.pickerImage} />
                      <Text style={styles.pickerName} numberOfLines={1}>{item.name}</Text>
                      {selectedTop?.id === item.id && (
                        <View style={styles.checkBadge}>
                          <Ionicons name="checkmark" size={14} color="#000" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <Text style={styles.sectionLabel}>Select a Bottom</Text>
              {bottoms.length === 0 ? (
                <Text style={styles.noItemsText}>No bottoms in your wardrobe</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.picker}>
                  {bottoms.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.pickerItem,
                        selectedBottom?.id === item.id && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedBottom(item)}
                    >
                      <Image source={{ uri: item.extracted_image_url }} style={styles.pickerImage} />
                      <Text style={styles.pickerName} numberOfLines={1}>{item.name}</Text>
                      {selectedBottom?.id === item.id && (
                        <View style={styles.checkBadge}>
                          <Ionicons name="checkmark" size={14} color="#000" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <TextInput
                style={styles.input}
                value={outfitName}
                onChangeText={setOutfitName}
                placeholder="Outfit name (optional)"
                placeholderTextColor="#666"
              />
              <TextInput
                style={styles.input}
                value={occasion}
                onChangeText={setOccasion}
                placeholder="Occasion (optional)"
                placeholderTextColor="#666"
              />

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
                  <Text style={styles.generateButtonText}>
                    {selectedTop && selectedBottom
                      ? 'Generate Outfit'
                      : 'Select a top & bottom'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>
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
  buildButtonEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
    gap: 8,
  },
  buildButtonEmptyText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  buildButtonSecondary: {
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
  buildButtonSecondaryText: {
    color: '#fff',
    fontWeight: '500',
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
  cardOccasion: {
    color: '#888',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
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
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  sectionLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  noItemsText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
  },
  picker: {
    marginBottom: 20,
  },
  pickerItem: {
    width: 110,
    marginRight: 12,
    backgroundColor: '#111',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pickerItemSelected: {
    borderColor: '#fff',
  },
  pickerImage: {
    width: '100%',
    aspectRatio: 0.75,
    backgroundColor: '#222',
  },
  pickerName: {
    color: '#fff',
    fontSize: 12,
    padding: 6,
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  generateButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 8,
  },
  generateButtonDisabled: {
    opacity: 0.4,
  },
  generateButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
})
