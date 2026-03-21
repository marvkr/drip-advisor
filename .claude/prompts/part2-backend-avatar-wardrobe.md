# Part 2: Backend — Avatar & Wardrobe APIs

You are working on the DripAdvisor hackathon project. Your job is to get the avatar upload and wardrobe APIs working end-to-end.

## Your files (you OWN these — edit freely):
- `backend/src/app/api/avatar/upload/route.ts`
- `backend/src/app/api/wardrobe/add/route.ts`
- `backend/src/app/api/wardrobe/list/route.ts`
- `backend/src/lib/supabase.ts`
- `backend/src/lib/gemini.ts`

## DO NOT touch:
- `backend/src/app/api/tryon/` — another developer owns this
- `backend/src/app/api/outfit/` — another developer owns this
- `backend/src/app/api/outfits/` — another developer owns this
- `backend/src/app/api/agent/` — another developer owns this
- `backend/src/lib/elevenlabs.ts` — another developer owns this
- `mobile/*` — another developer owns this

## Tasks (in order):

1. **Test avatar upload** — Use curl to POST a base64 image to `/api/avatar/upload`. Verify:
   - Image lands in Supabase Storage under `avatars/{user_id}/`
   - Profile row is created/updated in `profiles` table
   - Returns `{ avatar_url }` with a valid public URL

2. **Test wardrobe add** — POST a clothing screenshot to `/api/wardrobe/add`. Verify:
   - Original image stored in Supabase Storage
   - Gemini garment extraction runs and returns an isolated garment image
   - Extracted image stored in Supabase Storage
   - `wardrobe_items` row created with both URLs
   - Returns `{ item }` with full item data

3. **Iterate on garment extraction prompt** — The current prompt in the route is:
   > "Extract the clothing item from this image. Remove the background and any model or mannequin. Return only the isolated garment on a clean white background."

   Test with real screenshots (TikTok product pages, Instagram outfit posts, photos of clothes on hangers). Tune the prompt until extraction quality is consistently good.

4. **Test wardrobe list** — GET `/api/wardrobe/list?user_id=demo-user-1`. Verify it returns all items for that user sorted by `created_at` descending.

5. **Polish** — Add any missing input validation, handle edge cases (oversized images, invalid base64, missing Supabase bucket).

## Context:
- Backend is Next.js App Router at `backend/`
- Gemini model for image gen: `gemini-2.5-flash-preview-image-generation`
- Supabase Storage bucket: `images` (public)
- Test user ID: `demo-user-1`
- Run backend with `cd backend && npm run dev`
- Env vars are in `backend/.env.local`
