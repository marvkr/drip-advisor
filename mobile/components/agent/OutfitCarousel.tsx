import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import type { WardrobeItem } from '../../types/wardrobe'

type Props = {
  items: WardrobeItem[]
}

export function OutfitCarousel({ items }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <Image
            source={{ uri: item.extracted_image_url! }}
            style={styles.image}
            contentFit="contain"
            transition={200}
            recyclingKey={item.id}
          />
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          {item.brand ? (
            <Text style={styles.brand} numberOfLines={1}>{item.brand}</Text>
          ) : null}
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { marginTop: 8, maxWidth: '90%' },
  content: { gap: 10 },
  card: {
    width: 100,
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 8,
  },
  image: {
    width: 84,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  name: {
    color: '#fff',
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
    textAlign: 'center',
  },
  brand: {
    color: '#666',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
})
