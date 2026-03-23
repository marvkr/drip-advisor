import { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import type { Outfit } from '../../types/outfit'

type Props = Pick<Outfit, 'name' | 'occasion' | 'generated_image_url'>

export const OutfitCard = memo(function OutfitCard({ name, occasion, generated_image_url }: Props) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: generated_image_url }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
      {occasion ? (
        <Text style={styles.occasion} numberOfLines={1}>{occasion}</Text>
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#111',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: { width: '100%', aspectRatio: 0.75, backgroundColor: '#222' },
  name: { color: '#fff', fontSize: 14, fontWeight: '500', padding: 8, paddingBottom: 2 },
  occasion: { color: '#888', fontSize: 12, paddingHorizontal: 8, paddingBottom: 8 },
})
