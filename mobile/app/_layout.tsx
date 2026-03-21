import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ShareIntentProvider } from '../contexts/ShareIntentContext'
import { ShareIntentModal } from '../components/ShareIntentModal'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ShareIntentProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            contentStyle: { backgroundColor: '#000' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="onboarding"
            options={{
              title: 'Set Up Your Avatar',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="tryon/[itemId]"
            options={{
              title: 'Try On',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="styler"
            options={{
              title: 'Style Your Look',
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </Stack>
        <ShareIntentModal />
      </ShareIntentProvider>
    </SafeAreaProvider>
  )
}
