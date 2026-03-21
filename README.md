# DripAdvisor

**You are the model.** Take or upload a photo of yourself, screenshot clothing from any brand or TikTok, and instantly see yourself wearing it. Build outfits by mixing tops and bottoms across brands. A style agent knows your wardrobe and answers "what should I wear tonight?"

## Hackathon

Built for **Zero to Agent: Vercel x Google DeepMind Hackathon SF** — Saturday, March 21, 2026 at Shack15, San Francisco.

**Team:** @marvkr

## What It Does

DripAdvisor is a mobile-first AI styling app. The core loop:

1. **Avatar Setup** — Take or upload a full-body photo of yourself
2. **Add Clothing** — Screenshot items from TikTok, Instagram, brand sites, or photograph them in-store. AI extracts the garment automatically.
3. **Virtual Try-On** — Tap any wardrobe item and see a photorealistic image of *you* wearing it
4. **Mix & Match** — Combine tops and bottoms from different brands into a single outfit
5. **Style Agent** — Chat with an AI stylist that knows your wardrobe. Ask "what should I wear to a rooftop dinner?" and it suggests specific items, auto-generates the try-on, and reads the recommendation aloud.

## Demo Flow (3 min)

1. Open app → pose guide → "Take Photo" → avatar created **(20s)**
2. Tap "+" → screenshot of Lululemon top → garment extracted **(20s)**
3. Tap "Try On" → full-screen: you wearing the top **(20s)**
4. Add bottom from different brand → try on **(20s)**
5. Swipe through wardrobe — you're the model every time **(15s)**
6. Select top + bottom → "Build Outfit" → combined look **(25s)**
7. Style chat → "rooftop dinner tonight" → streams recommendation → try-on auto-generates → ElevenLabs reads aloud **(40s)**

## Architecture

```
React Native (Expo)  ←→  Next.js API Routes (Vercel)  ←→  Gemini / Supabase / ElevenLabs
     Mobile App                Backend                          External Services
```

The Expo app is the frontend only — all AI calls, image processing, and database operations go through the Next.js API backend deployed on Vercel. API keys stay server-side.

## Tech Stack

| Layer | Tool |
|-------|------|
| Mobile Frontend | React Native + Expo |
| Camera | `expo-camera` |
| Image Picker | `expo-image-picker` |
| Share Intent | `expo-share-intent` |
| Navigation | `expo-router` |
| Backend | Next.js App Router (API routes) |
| Deployment | Vercel |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| Image Generation | Gemini 2.5 Flash (image generation) |
| Style Agent LLM | Gemini 2.5 Pro |
| Agent Streaming | Vercel AI SDK |
| Voice | ElevenLabs TTS |

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/avatar/upload` | Upload avatar photo → Supabase Storage |
| POST | `/api/wardrobe/add` | Add clothing item → Gemini extracts garment |
| GET | `/api/wardrobe/list` | List wardrobe items |
| POST | `/api/tryon/generate` | Virtual try-on → Gemini composites garment onto avatar |
| POST | `/api/outfit/generate` | Combined outfit → Gemini generates top + bottom look |
| GET | `/api/outfits/list` | List saved outfits |
| POST | `/api/agent/chat` | Style agent chat (Vercel AI SDK streaming) |

## Data Models

```sql
-- profiles
id, user_id, avatar_url, style_preferences, created_at

-- wardrobe_items
id, user_id, name, brand, category (top|bottom|dress|shoes),
source_url, original_image_url, extracted_image_url, tryon_image_url,
created_at

-- outfits
id, user_id, name, occasion, top_id, bottom_id, shoes_id,
generated_image_url, created_at
```

## Setup

### Backend

```bash
cd backend
cp .env.local.example .env.local
# Fill in your API keys
npm install
npm run dev
```

### Mobile

```bash
cd mobile
# Set EXPO_PUBLIC_API_URL in .env
npm install
npx expo start
```

### Database

Run `supabase-schema.sql` in your Supabase SQL editor to create the tables.

Create a storage bucket called `images` with public access.
