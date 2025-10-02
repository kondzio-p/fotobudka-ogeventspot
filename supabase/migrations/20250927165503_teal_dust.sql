/*
  # Create pages system

  1. New Tables
    - `pages`
      - `id` (uuid, primary key)
      - `name` (text)
      - `slug` (text, unique)
      - `is_main` (boolean)
      - `navigation` (jsonb)
      - `videos` (jsonb)
      - `welcome_section` (jsonb)
      - `stats` (jsonb)
      - `gallery` (jsonb)
      - `locations` (jsonb)
      - `footer` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `pages` table
    - Add policy for public read access
    - Add policy for authenticated admin write access
*/

CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  is_main boolean DEFAULT false,
  navigation jsonb DEFAULT '{}',
  videos jsonb DEFAULT '[]',
  welcome_section jsonb DEFAULT '{}',
  stats jsonb DEFAULT '{}',
  gallery jsonb DEFAULT '{}',
  locations jsonb DEFAULT '{}',
  footer jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all pages
CREATE POLICY "Pages are publicly readable"
  ON pages
  FOR SELECT
  TO public
  USING (true);

-- Allow insert/update/delete for authenticated users (admin)
CREATE POLICY "Admin can manage pages"
  ON pages
  FOR ALL
  TO authenticated
  USING (true);

-- Insert default main page
INSERT INTO pages (name, slug, is_main, navigation, videos, welcome_section, stats, gallery, locations, footer)
VALUES (
  'Strona główna',
  '/',
  true,
  '{"facebookUrl": "https://www.facebook.com/profile.php?id=61553668165091", "instagramUrl": "https://www.instagram.com/og.eventspot/"}',
  '[
    {"src": "/assets/main/videos/film1.webm", "alt": "Event video 1", "startTime": 7},
    {"src": "/assets/main/videos/film2.webm", "alt": "Event video 2", "startTime": 3},
    {"src": "/assets/main/videos/film1.webm", "alt": "Event video 3", "startTime": 2},
    {"src": "/assets/main/videos/film2.webm", "alt": "Event video 4", "startTime": 4}
  ]',
  '{"welcomeText": "Fotobudka OG Event Spot!", "subtitle": "Dopełniamy, by na Twoim wydarzeniu nie zabrakło Atrakcji!"}',
  '{"clientsCount": "200+", "yearsOnMarket": "5 lat", "smilesCount": "∞"}',
  '{"images": [
    {"src": "/assets/main/images/360.png", "alt": "Gallery image 1"},
    {"src": "/assets/main/images/mirror.jpg", "alt": "Gallery image 2"},
    {"src": "/assets/main/images/heavysmoke.jpg", "alt": "Gallery image 3"},
    {"src": "/assets/main/images/fountain.jpg", "alt": "Gallery image 4"},
    {"src": "/assets/main/images/neons.jpg", "alt": "Gallery image 5"}
  ]}',
  '{"cities": ["Chojnice", "Gdańsk", "Sopot", "Gdynia", "Bytów", "Kartuzy", "Kościerzyna", "Słupsk", "Lębork", "Ustka", "Malbork", "Tczew", "Wejherowo", "Puck", "Hel", "Starogard Gdański"]}',
  '{"facebookUrl": "https://www.facebook.com/profile.php?id=61553668165091", "facebookText": "@OG Eventspot", "instagramUrl": "https://www.instagram.com/og.eventspot/", "instagramText": "@og.eventspot", "phoneNumber": "576 934 594"}'
) ON CONFLICT (slug) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();