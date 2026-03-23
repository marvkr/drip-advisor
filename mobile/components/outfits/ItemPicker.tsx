import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import type { WardrobeItem } from '../../types/wardrobe'

type Props = {
  items: WardrobeItem[]
  selected: WardrobeItem | null
  onSelect: (item: WardrobeItem | null) => void
}

export function ItemPicker({ items, selected, onSelect }: Props) {
  const displayItems = items.filter((i) => i.extracted_image_url)
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      {displayItems.map((item) => {
        const isSelected = selected?.id === item.id
        return (
          <Pressable
            key={item.id}
            style={[styles.item, isSelected && styles.itemSelected]}
            onPress={() => onSelect(isSelected ? null : item)}
          >
            <Image
              source={{ uri: item.extracted_image_url! }}
              style={styles.image}
              contentFit="cover"
              recyclingKey={item.id}
            />
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            {isSelected ? (
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark" size={14} color="#000" />
              </View>
            ) : null}
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { marginBottom: 20 },
  item: {
    width: 110,
    marginRight: 12,
    backgroundColor: '#111',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemSelected: { borderColor: '#fff' },
  image: { width: '100%', aspectRatio: 0.75, backgroundColor: '#222' },
  name: { color: '#fff', fontSize: 12, padding: 6 },
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
})
