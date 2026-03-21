// Seed script: adds sample men's clothing items to the wardrobe via the API
// Usage: npx tsx scripts/seed-wardrobe.ts

const API_BASE = process.env.API_URL || 'http://localhost:3000'
const USER_ID = 'demo-user-1'

const ITEMS = [
  // Tops
  {
    url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600',
    name: 'White Crew Neck Tee',
    category: 'top',
    brand: 'Zara',
  },
  {
    url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
    name: 'Navy Polo Shirt',
    category: 'top',
    brand: 'Zara',
  },
  {
    url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600',
    name: 'Light Blue Oxford Shirt',
    category: 'top',
    brand: 'Zara',
  },
  // Bottoms
  {
    url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
    name: 'Blue Denim Jeans',
    category: 'bottom',
    brand: 'Zara',
  },
  {
    url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600',
    name: 'Khaki Chino Shorts',
    category: 'bottom',
    brand: 'Zara',
  },
  {
    url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600',
    name: 'Black Slim Pants',
    category: 'bottom',
    brand: 'Zara',
  },
  // Shoes
  {
    url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600',
    name: 'White Sneakers',
    category: 'shoes',
    brand: 'Zara',
  },
  {
    url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600',
    name: 'Brown Leather Loafers',
    category: 'shoes',
    brand: 'Zara',
  },
]

async function seedItem(item: typeof ITEMS[0]) {
  console.log(`Adding: ${item.name}...`)

  // Fetch image and convert to base64
  const res = await fetch(item.url)
  if (!res.ok) {
    console.error(`  Failed to fetch image for ${item.name}: ${res.status}`)
    return
  }
  const buffer = Buffer.from(await res.arrayBuffer())
  const base64 = buffer.toString('base64')

  // POST to wardrobe/add
  const apiRes = await fetch(`${API_BASE}/api/wardrobe/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: base64,
      user_id: USER_ID,
      category: item.category,
      name: item.name,
      brand: item.brand,
    }),
  })

  if (!apiRes.ok) {
    const err = await apiRes.text()
    console.error(`  API error for ${item.name}: ${err}`)
    return
  }

  const data = await apiRes.json()
  console.log(`  Done: ${data.item?.id}`)
}

async function main() {
  console.log(`Seeding wardrobe for user: ${USER_ID}`)
  console.log(`API: ${API_BASE}\n`)

  for (const item of ITEMS) {
    await seedItem(item)
  }

  console.log('\nDone! All items seeded.')
}

main().catch(console.error)
