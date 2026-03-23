import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export function WelcomeEmpty() {
  return (
    <View style={styles.container}>
      <Ionicons name="sparkles" size={48} color="#444" />
      <Text style={styles.title}>DripAdvisor</Text>
      <Text style={styles.subtitle}>Ask me what to wear for any occasion</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
  },
})
