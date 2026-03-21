import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { View, ActivityIndicator } from 'react-native'
import { ShareIntentProvider } from '../contexts/ShareIntentContext'
import { ShareIntentModal } from '../components/ShareIntentModal'
import { UserProvider, useUser } from '../lib/user'

function AppContent() {
  const { isAuthenticated, loading } = useUser()

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    )
  }

  return (
    <ShareIntentProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: '#000' },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="auth" options={{ headerShown: false }} />
        ) : (
          <>
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
          </>
        )}
      </Stack>
      <ShareIntentModal />
    </ShareIntentProvider>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </SafeAreaProvider>
  )
}
