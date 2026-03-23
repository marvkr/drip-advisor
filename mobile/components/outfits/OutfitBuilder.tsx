import { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../lib/api'
import { ItemPicker } from './ItemPicker'
import type { WardrobeItem } from '../../types/wardrobe'
import type { Outfit } from '../../types/outfit'

const TOP_CATEGORIES = ['top', 'shirt', 'jacket', 'hoodie', 'sweater', 'blouse', 'coat', 'tee', 't-shirt']
const BOTTOM_CATEGORIES = ['bottom', 'pants', 'jeans', 'shorts', 'skirt', 'trousers']

function isTop(item: WardrobeItem) {
  return TOP_CATEGORIES.some((c) => item.category.toLowerCase().includes(c))
}

function isBottom(item: WardrobeItem) {
  return BOTTOM_CATEGORIES.some((c) => item.category.toLowerCase().includes(c))
}

type Props = {
  visible: boolean
  userId: string
  avatarUrl: string
  onClose: () => void
  onSuccess: (outfit: Outfit) => void
}

export function OutfitBuilder({ visible, userId, avatarUrl, onClose, onSuccess }: Props) {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [selectedTop, setSelectedTop] = useState<WardrobeItem | null>(null)
  const [selectedBottom, setSelectedBottom] = useState<WardrobeItem | null>(null)
  const [outfitName, setOutfitName] = useState('')
  const [occasion, setOccasion] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!visible) return
    setSelectedTop(null)
    setSelectedBottom(null)
    setOutfitName('')
    setOccasion('')
    setLoadingItems(true)
    api.wardrobe
      .list(userId)
      .then((data: { items: WardrobeItem[] }) => setWardrobeItems(data.items))
      .catch(() => Alert.alert('Error', 'Failed to load wardrobe items.'))
      .finally(() => setLoadingItems(false))
  }, [visible, userId])

  const handleGenerate = async () => {
    if (!selectedTop || !selectedBottom) return
    setGenerating(true)
    try {
      const data = await api.outfits.generate({
        avatar_url: avatarUrl,
        top_id: selectedTop.id,
        bottom_id: selectedBottom.id,
        user_id: userId,
        name: outfitName || `${selectedTop.name} + ${selectedBottom.name}`,
        occasion: occasion || undefined,
      })
      onSuccess(data.outfit)
      onClose()
    } catch {
      Alert.alert('Error', 'Failed to generate outfit. Try again.')
    } finally {
      setGenerating(false)
    }
  }

  const tops = wardrobeItems.filter(isTop)
  const bottoms = wardrobeItems.filter(isBottom)
  const canGenerate = !!selectedTop && !!selectedBottom && !generating

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => !generating && onClose()}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => !generating && onClose()}>
            <Ionicons name="close" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.title}>Build Outfit</Text>
          <View style={{ width: 24 }} />
        </View>

        {loadingItems ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : (
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            <Text style={styles.sectionLabel}>Select a Top</Text>
            {tops.length === 0 ? (
              <Text style={styles.empty}>No tops in your wardrobe</Text>
            ) : (
              <ItemPicker items={tops} selected={selectedTop} onSelect={setSelectedTop} />
            )}

            <Text style={styles.sectionLabel}>Select a Bottom</Text>
            {bottoms.length === 0 ? (
              <Text style={styles.empty}>No bottoms in your wardrobe</Text>
            ) : (
              <ItemPicker items={bottoms} selected={selectedBottom} onSelect={setSelectedBottom} />
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

            <Pressable
              style={[styles.generateButton, !canGenerate && styles.generateButtonDisabled]}
              onPress={handleGenerate}
              disabled={!canGenerate}
            >
              {generating ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.generateButtonText}>
                  {selectedTop && selectedBottom ? 'Generate Outfit' : 'Select a top & bottom'}
                </Text>
              )}
            </Pressable>
          </ScrollView>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  body: { flex: 1, padding: 20 },
  bodyContent: { paddingBottom: 40 },
  sectionLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  empty: { color: '#666', fontSize: 14, marginBottom: 16 },
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
  generateButtonDisabled: { opacity: 0.4 },
  generateButtonText: { color: '#000', fontSize: 16, fontWeight: '600' },
})
