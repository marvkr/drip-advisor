// Seeds template-female wardrobe items directly into Supabase (no backend server needed)
// Run from the backend directory: NODE_PATH=./node_modules npx tsx ../scripts/seed-template-female.ts

import { createClient } from '@supabase/supabase-js'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const USER_ID = 'template-female'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const geminiFlashImage = google('gemini-2.5-flash-image')

// Real Zara product images scraped from zara.com/us/en
const ITEMS = [
  // Tops
  {
    url: 'https://static.zara.net/assets/public/0a3b/834a/1ebd42c09aa8/1dc85e3c58e7/02348725805-p/02348725805-p.jpg',
    name: 'White Ruffled Sleeve Button Top',
    category: 'top',
    brand: 'Zara',
  },
  {
    url: 'https://static.zara.net/assets/public/679d/68f9/5dd64a849cd7/5066a5dda509/06085800622-p/06085800622-p.jpg',
    name: 'Pale Pink Strap Top',
    category: 'top',
    brand: 'Zara',
  },
  {
    url: 'https://static.zara.net/assets/public/fbe5/b98b/e21745a7b7c4/72afbad5e4b7/06050304800-a1/06050304800-a1.jpg',
    name: 'Black Lace Long Sleeve Top',
    category: 'top',
    brand: 'Zara',
  },
  // Bottoms
  {
    url: 'https://static.zara.net/assets/public/8b5d/1fd8/aec24c61a68d/77bcab0c31e3/07149073800-p/07149073800-p.jpg',
    name: 'Black Tailored Crease Trousers',
    category: 'bottom',
    brand: 'Zara',
  },
  {
    url: 'https://static.zara.net/assets/public/1241/d483/79134a829e0c/bf7e10bfea40/02405777104-e10/02405777104-e10.jpg',
    name: 'Beige Striped High-Waist Trousers',
    category: 'bottom',
    brand: 'Zara',
  },
  {
    url: 'https://static.zara.net/assets/public/9293/8de1/ac334084bfb5/20eb132ccf2b/04661408800-f1/04661408800-f1.jpg',
    name: 'Black High-Waist Pleated Pants',
    category: 'bottom',
    brand: 'Zara',
  },
  // Shoes
  {
    url: 'https://static.zara.net/assets/public/6e62/2779/8b6a4fe4a870/5b20dc15f2dd/14300710500-e10/14300710500-e10.jpg',
    name: 'Green Bow Low-Heel Sandals',
    category: 'shoes',
    brand: 'Zara',
  },
  {
    url: 'https://static.zara.net/assets/public/e65b/8a0b/f0bc4f1bb42b/01bcba0fc73a/14504710091-e10/14504710091-e10.jpg',
    name: 'Gold Sequined Pointed Flats',
    category: 'shoes',
    brand: 'Zara',
  },
  {
    url: 'https://static.zara.net/assets/public/dcfc/99fb/30d54a8fb309/433acd4a917b/14505710070-e10/14505710070-e10.jpg',
    name: 'Orange Embossed Loafers',
    category: 'shoes',
    brand: 'Zara',
  },
]

async function extractGarment(imageBuffer: Buffer): Promise<Buffer | null> {
  try {
    const { files } = await generateText({
      model: geminiFlashImage,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', image: imageBuffer },
            {
              type: 'text',
              text: 'Extract the clothing item or shoe from this image. Remove the background and any model or mannequin. Return only the isolated garment or shoe on a clean white background. Preserve fabric texture, color accuracy, pattern detail, and natural shape.',
            },
          ],
        },
      ],
      providerOptions: { google: { responseModalities: ['IMAGE', 'TEXT'] } },
    })
    if (files && files.length > 0) {
      return Buffer.from(files[0].base64, 'base64')
    }
  } catch (err) {
    console.warn('  Gemini extraction failed, using original:', (err as Error).message)
  }
  return null
}

async function seedItem(item: (typeof ITEMS)[0]) {
  console.log(`\nAdding: ${item.name} (${item.category})...`)

  const res = await fetch(item.url)
  if (!res.ok) { console.error(`  Image fetch failed: ${res.status}`); return }
  const originalBuffer = Buffer.from(await res.arrayBuffer())
  const ts = Date.now()

  const origPath = `wardrobe/${USER_ID}/original_${ts}.jpg`
  const { error: origErr } = await supabase.storage
    .from('images')
    .upload(origPath, originalBuffer, { contentType: 'image/jpeg', upsert: true })
  if (origErr) { console.error('  Upload failed:', origErr.message); return }

  const { data: { publicUrl: originalUrl } } = supabase.storage.from('images').getPublicUrl(origPath)

  console.log('  Extracting garment with Gemini...')
  const extractedBuffer = await extractGarment(originalBuffer)

  let extractedUrl = originalUrl
  if (extractedBuffer) {
    const extPath = `wardrobe/${USER_ID}/extracted_${ts}.png`
    const { error: extErr } = await supabase.storage
      .from('images')
      .upload(extPath, extractedBuffer, { contentType: 'image/png', upsert: true })
    if (!extErr) {
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(extPath)
      extractedUrl = publicUrl
      console.log('  Extracted.')
    }
  } else {
    console.log('  Using original as fallback.')
  }

  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert({ user_id: USER_ID, name: item.name, brand: item.brand, category: item.category, original_image_url: originalUrl, extracted_image_url: extractedUrl })
    .select()
    .single()

  if (error) { console.error('  DB insert failed:', error.message); return }
  console.log(`  Inserted: ${data.id}`)
}

async function main() {
  console.log(`Seeding wardrobe for: ${USER_ID}\n`)

  const { data: existing } = await supabase.from('wardrobe_items').select('id').eq('user_id', USER_ID)
  if (existing && existing.length > 0) {
    console.log(`Warning: ${existing.length} items already exist. Ctrl+C to abort, continuing in 3s...`)
    await new Promise(r => setTimeout(r, 3000))
  }

  for (const item of ITEMS) {
    await seedItem(item)
  }

  console.log('\nDone! Template female wardrobe seeded.')
}

main().catch(console.error)
