import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useShareIntent, type ShareIntent } from 'expo-share-intent'

type ShareIntentContextType = {
  sharedContent: ShareIntent | null
  isShareModalVisible: boolean
  dismissShareModal: () => void
}

const ShareIntentContext = createContext<ShareIntentContextType>({
  sharedContent: null,
  isShareModalVisible: false,
  dismissShareModal: () => {},
})

export function ShareIntentProvider({ children }: { children: ReactNode }) {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent()
  const [isShareModalVisible, setIsShareModalVisible] = useState(false)
  const [sharedContent, setSharedContent] = useState<ShareIntent | null>(null)

  useEffect(() => {
    if (hasShareIntent && shareIntent) {
      setSharedContent(shareIntent)
      setIsShareModalVisible(true)
    }
  }, [hasShareIntent, shareIntent])

  const dismissShareModal = () => {
    setIsShareModalVisible(false)
    setSharedContent(null)
    resetShareIntent()
  }

  return (
    <ShareIntentContext.Provider
      value={{ sharedContent, isShareModalVisible, dismissShareModal }}
    >
      {children}
    </ShareIntentContext.Provider>
  )
}

export const useShareIntentContext = () => useContext(ShareIntentContext)
