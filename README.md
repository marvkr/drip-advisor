# DripAdvisor

**You are the model.** Take or upload a photo of yourself, screenshot clothing from any brand or TikTok, and instantly see yourself wearing it. Build outfits by mixing tops and bottoms across brands. A style agent knows your wardrobe and answers "what should I wear tonight?"

Built for the **Zero to Agent: Vercel x Deepmind SF Hackathon** (March 21, 2026).

## Architecture

```
React Native (Expo)  ←→  Next.js API Routes (Vercel)  ←→  Gemini / Supabase / ElevenLabs
     Mobile App                Backend                          External Services
```

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

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/avatar/upload` | Upload avatar photo |
| POST | `/api/wardrobe/add` | Add clothing item with garment extraction |
| GET | `/api/wardrobe/list` | List wardrobe items |
| POST | `/api/tryon/generate` | Virtual try-on generation |
| POST | `/api/outfit/generate` | Combined outfit generation |
| GET | `/api/outfits/list` | List saved outfits |
| POST | `/api/agent/chat` | Style agent chat (streaming) |

## Core Features

1. **Avatar Setup** — Take or upload a full-body photo
2. **Wardrobe** — Add clothing from screenshots, photos, or camera. AI extracts the garment automatically.
3. **Virtual Try-On** — See yourself wearing any item in your wardrobe
4. **Mix & Match** — Combine tops and bottoms from different brands
5. **Style Agent** — AI stylist that knows your wardrobe and suggests outfits
6. **Share Intent** — Share clothing screenshots directly from other apps (TikTok, Instagram, Safari)
