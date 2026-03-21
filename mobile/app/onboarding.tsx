import { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../lib/api'
import { useUser } from '../lib/user'

export default function OnboardingScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [showCamera, setShowCamera] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const cameraRef = useRef<CameraView>(null)
  const { userId, setAvatarUrl } = useUser()

  const takePhoto = async () => {
    if (!cameraRef.current) return
    const result = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8 })
    if (result?.base64) {
      setPhoto(`data:image/jpeg;base64,${result.base64}`)
      setShowCamera(false)
      uploadAvatar(result.base64)
    }
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0].base64) {
      setPhoto(result.assets[0].uri)
      uploadAvatar(result.assets[0].base64)
    }
  }

  const uploadAvatar = async (base64: string) => {
    setUploading(true)
    try {
      const data = await api.avatar.upload({ image: base64, user_id: userId })
      setAvatarUrl(data.avatar_url)
      Alert.alert('Avatar Set!', 'You can now try on any item in your wardrobe.', [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (err) {
      Alert.alert('Error', 'Failed to upload avatar. Try again.')
    } finally {
      setUploading(false)
    }
  }

  if (showCamera) {
    if (!permission?.granted) {
      return (
        <View style={styles.center}>
          <Text style={styles.text}>Camera permission needed</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
            <Text style={styles.primaryButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
        >
          <View style={styles.poseOverlay}>
            <View style={styles.poseOutline} />
            <Text style={styles.poseText}>
              Stand at a slight angle{'\n'}Arms relaxed at your sides
            </Text>
          </View>
        </CameraView>
        <View style={styles.cameraControls}>
          <TouchableOpacity onPress={() => setShowCamera(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shutterButton} onPress={takePhoto}>
            <View style={styles.shutterInner} />
          </TouchableOpacity>
          <View style={{ width: 60 }} />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {photo ? (
        <Image source={{ uri: photo }} style={styles.preview} />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="person-circle-outline" size={120} color="#333" />
        </View>
      )}

      {uploading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 32 }} />
      ) : (
        <>
          <Text style={styles.title}>Set Up Your Avatar</Text>
          <Text style={styles.subtitle}>
            Stand at a slight angle with arms relaxed.{'\n'}
            This photo will be used for all virtual try-ons.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setShowCamera(true)}
          >
            <Ionicons name="camera" size={20} color="#000" />
            <Text style={styles.primaryButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={pickImage}>
            <Ionicons name="images" size={20} color="#fff" />
            <Text style={styles.secondaryButtonText}>Upload from Gallery</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  center: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: { color: '#fff', fontSize: 16, marginBottom: 16 },
  placeholder: {
    width: 200,
    height: 260,
    borderRadius: 16,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    width: 200,
    height: 260,
    borderRadius: 16,
    backgroundColor: '#111',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    marginTop: 24,
    gap: 8,
  },
  primaryButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#333',
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    marginTop: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  poseOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  poseOutline: {
    width: 180,
    height: 320,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
  },
  poseText: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  cancelText: { color: '#fff', fontSize: 16 },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },
})
