# Part 3: Backend — Try-On, Outfits & Agent APIs

You are working on the DripAdvisor hackathon project. Your job is to get the virtual try-on, outfit generation, and style agent APIs working end-to-end.

## Your files (you OWN these — edit freely):
- `backend/src/app/api/tryon/generate/route.ts`
- `backend/src/app/api/outfit/generate/route.ts`
- `backend/src/app/api/outfits/list/route.ts`
- `backend/src/app/api/agent/chat/route.ts`
- `backend/src/lib/elevenlabs.ts`

## DO NOT touch:
- `backend/src/app/api/avatar/` — another developer owns this
- `backend/src/app/api/wardrobe/` — another developer owns this
- `backend/src/lib/supabase.ts` — another developer owns this (read-only OK)
- `backend/src/lib/gemini.ts` — another developer owns this (read-only OK)
- `mobile/*` — another developer owns this

## Tasks (in order):

1. **Test try-on generation** — POST to `/api/tryon/generate` with an `avatar_url`, `item_id`, and `user_id`. This needs existing data in Supabase (an avatar and at least one wardrobe item). Verify:
   - Fetches the wardrobe item's `extracted_image_url` from DB
   - Downloads both avatar and garment images
   - Sends both to Gemini with the try-on prompt
   - Stores result in Supabase Storage
   - Updates `wardrobe_items.tryon_image_url`
   - Returns `{ tryon_image_url }`

2. **Iterate on try-on prompt** — The current prompt is:
   > "You are given two images: (1) a person standing at a slight 3/4 angle, arms relaxed, (2) an isolated clothing item on a white background. Generate a photorealistic image of the person wearing the clothing item."

   This is the MONEY SHOT of the app. Iterate until the output looks polished and realistic. Try different prompt strategies.

3. **Test outfit generation** — POST to `/api/outfit/generate` with `avatar_url`, `top_id`, `bottom_id`. Verify:
   - Fetches both items from DB
   - Downloads all 3 images (avatar + top + bottom)
   - Gemini generates combined look
   - Creates `outfits` row in DB
   - Returns `{ outfit }` with `generated_image_url`

4. **Test agent chat** — POST to `/api/agent/chat` with `messages` array and `user_id`. Verify:
   - Fetches user's wardrobe from Supabase for context
   - Streams response using Vercel AI SDK `streamText`
   - Response references actual wardrobe items by name
   - Streaming works (chunked response, not all-at-once)

5. **ElevenLabs TTS (stretch)** — Add a `/api/tts` endpoint or integrate TTS into the agent response. The `elevenlabs.ts` helper is already there. Make it return audio that the mobile app can play.

## Context:
- Backend is Next.js App Router at `backend/`
- Image gen model: `gemini-2.5-flash-preview-image-generation` (import from `@/lib/gemini`)
- Chat model: `gemini-2.5-pro-preview-05-06` (import from `@/lib/gemini`)
- Supabase client: import `createSupabaseClient` from `@/lib/supabase`
- Streaming uses Vercel AI SDK `streamText` → `result.toTextStreamResponse()`
- Run backend with `cd backend && npm run dev`
- Test user ID: `demo-user-1`
