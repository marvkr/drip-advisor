# Part 4: Mobile — All Screens & UI

You are working on the DripAdvisor hackathon project. Your job is to get the Expo mobile app fully working and polished.

## Your files (you OWN these — edit freely):
- `mobile/app/_layout.tsx`
- `mobile/app/(tabs)/index.tsx` — Wardrobe home screen
- `mobile/app/(tabs)/outfits.tsx` — Saved outfits screen
- `mobile/app/(tabs)/agent.tsx` — Style AI chat screen
- `mobile/app/onboarding.tsx` — Avatar setup (camera + gallery)
- `mobile/app/tryon/[itemId].tsx` — Try-on result screen
- `mobile/components/*` — All components
- `mobile/contexts/*` — All context providers
- `mobile/lib/api.ts` — API client
- `mobile/lib/user.ts` — User state
- `mobile/lib/supabase.ts` — Supabase client
- `mobile/app.json` — App config

## DO NOT touch:
- `backend/*` — other developers own all backend files

## Tasks (in order):

1. **Set API URL** — Create `mobile/.env` with `EXPO_PUBLIC_API_URL=http://localhost:3000` (or the deployed Vercel URL)

2. **Test onboarding flow**:
   - Open app → should see "Set up your avatar first" with button
   - Tap "Set Up Avatar" → modal opens
   - Test "Take Photo" → camera opens with pose guide overlay
   - Test "Upload from Gallery" → image picker opens
   - After upload → should navigate back with avatar set
   - Run the app with `cd mobile && npx expo start`

3. **Test wardrobe flow**:
   - After avatar is set, wardrobe screen should show empty state
   - Tap FAB (+) → image picker opens
   - Select a clothing screenshot → should POST to backend, show loading
   - Item should appear in grid with extracted garment image
   - Grid should show name, brand, category

4. **Test try-on flow**:
   - Tap any wardrobe item → navigates to `/tryon/[itemId]`
   - Shows "Generating your look..." loading
   - Displays full-screen try-on result
   - Close button returns to wardrobe

5. **Build outfit mixing** — The outfits tab needs a way to select a top + bottom and combine them. Add UI for:
   - Selecting items by category (filter tops/bottoms)
   - "Build Outfit" button that POSTs to `/api/outfit/generate`
   - Display result in outfits grid

6. **Test agent chat**:
   - Style AI tab shows welcome screen
   - Type a message → streams response
   - Verify streaming text appears incrementally (not all at once)
   - The API client in `lib/api.ts` parses Vercel AI SDK data stream format

7. **Test share intent**:
   - Share an image from Safari/Photos → DripAdvisor should appear in share sheet
   - Share modal should show the image with "Add to Wardrobe" button
   - Should POST to wardrobe add endpoint

8. **Polish**:
   - Loading states, error states, empty states all look good
   - Dark theme is consistent
   - Animations feel smooth
   - Camera permissions are handled gracefully

## Context:
- Expo app at `mobile/`, uses expo-router for file-based navigation
- 3 tabs: Wardrobe (index), Outfits, Style AI (agent)
- 2 modals: Onboarding, Try-on
- API client in `lib/api.ts` — all calls go to `EXPO_PUBLIC_API_URL`
- User state in `lib/user.ts` — uses demo user ID `demo-user-1` (no real auth)
- Share intent via `expo-share-intent` + `ShareIntentProvider` context
- Run with `cd mobile && npx expo start`
