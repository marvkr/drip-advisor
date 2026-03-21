// Seeds template-male wardrobe items directly into Supabase (no backend server needed)
// Run from the backend directory: npx tsx ../scripts/seed-template-male.ts

import { createClient } from '@supabase/supabase-js'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const USER_ID = 'template-male'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const geminiFlashImage = google('gemini-2.5-flash-image')

const ITEMS = [
  // Tops
  { url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80', name: 'White Crew Neck Tee', category: 'top', brand: 'Uniqlo' },
  { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80', name: 'Light Blue Oxford Shirt', category: 'top', brand: 'Ralph Lauren' },
  { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80', name: 'Navy Polo Shirt', category: 'top', brand: 'Lacoste' },
  // Outerwear
  { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80', name: 'Grey Slim-Fit Blazer', category: 'outerwear', brand: 'Zara' },
  // Bottoms
  { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80', name: 'Dark Wash Slim Jeans', category: 'bottom', brand: "Levi's" },
  { url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80', name: 'Black Slim Chinos', category: 'bottom', brand: 'Banana Republic' },
  { url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80', name: 'Khaki Cargo Shorts', category: 'bottom', brand: 'Gap' },
  // Shoes
  { url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80', name: 'White Low-Top Sneakers', category: 'shoes', brand: 'Nike' },
  { url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80', name: 'Brown Leather Loafers', category: 'shoes', brand: 'Cole Haan' },
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
            { type: 'text', text: 'Extract the clothing item from this image. Remove the background and any model or mannequin. Return only the isolated garment on a clean white background. Preserve fabric texture, color accuracy, and natural shape.' },
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

  // Upload original
  const origPath = `wardrobe/${USER_ID}/original_${ts}.jpg`
  const { error: origErr } = await supabase.storage
    .from('images')
    .upload(origPath, originalBuffer, { contentType: 'image/jpeg', upsert: true })
  if (origErr) { console.error('  Upload failed:', origErr.message); return }

  const { data: { publicUrl: originalUrl } } = supabase.storage.from('images').getPublicUrl(origPath)

  // Extract garment
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

  console.log('\nDone! Template male wardrobe seeded.')
}

main().catch(console.error)
