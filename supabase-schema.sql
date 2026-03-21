-- DripAdvisor Database Schema

-- Profiles
create table if not exists profiles (
  id uuid default gen_random_uuid() primary key,
  user_id text unique not null,
  avatar_url text,
  style_preferences jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Wardrobe Items
create table if not exists wardrobe_items (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  name text not null default 'Untitled Item',
  brand text,
  category text not null default 'top' check (category in ('top', 'bottom', 'dress', 'shoes', 'accessory', 'outerwear')),
  source_url text,
  original_image_url text not null,
  extracted_image_url text not null,
  tryon_image_url text,
  created_at timestamptz default now()
);

-- Outfits
create table if not exists outfits (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  name text not null default 'Untitled Outfit',
  occasion text,
  top_id uuid references wardrobe_items(id),
  bottom_id uuid references wardrobe_items(id),
  shoes_id uuid references wardrobe_items(id),
  generated_image_url text not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_wardrobe_user on wardrobe_items(user_id);
create index if not exists idx_outfits_user on outfits(user_id);
create index if not exists idx_profiles_user on profiles(user_id);

-- Storage: create a bucket called 'images' with public access
-- Run in Supabase dashboard: Storage > New bucket > name: images > Public: true

-- Default wardrobe items: add items with user_id = 'template-male' or 'template-female'
-- These are copied to new users on signup based on their gender selection.
-- Example: INSERT INTO wardrobe_items (user_id, name, brand, category, original_image_url, extracted_image_url)
--   VALUES ('template-male', 'Classic White Tee', 'Uniqlo', 'top', '...', '...');
