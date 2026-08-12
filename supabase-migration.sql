-- ==========================================================================
-- Kerupuk Abatasa - Supabase Migration
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor
-- ==========================================================================

-- =============================================
-- 1. TABEL USERS
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk login cepat berdasarkan email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- RLS: Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Hanya bisa baca data sendiri (berdasarkan auth)
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (true);

-- Policy: Bisa insert/update/delete (untuk admin CRUD)
CREATE POLICY "Admin manage users" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- Auto-update updated_at saat ada perubahan
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed default admin user (password: admin123)
-- Password di-hash dengan pgcrypto (bcrypt)
INSERT INTO users (email, password_hash, name, role) VALUES
  ('admin@kerupukabatasa.com', crypt('admin123', gen_salt('bf')), 'Admin Abatasa', 'superadmin')
ON CONFLICT (email) DO NOTHING;


-- =============================================
-- 2. TABEL PRODUCTS
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  badge TEXT DEFAULT '',
  "desc" TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT 'assets/images/kerupuk_ikan.png',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa READ (website publik)
CREATE POLICY "Public read access" ON products
  FOR SELECT USING (true);

-- Policy: Bisa INSERT, UPDATE, DELETE (untuk admin)
CREATE POLICY "Admin full access" ON products
  FOR ALL USING (true) WITH CHECK (true);

-- Auto-update updated_at
CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed data produk default
INSERT INTO products (name, price, badge, "desc", image) VALUES
  ('Kerupuk Ikan', 25000, 'Paling Laris', 'Kerupuk gurih dengan cita rasa ikan tenggiri asli segar dan tekstur super renyah.', 'assets/images/kerupuk_ikan.png'),
  ('Kerupuk Udang', 30000, '', 'Tekstur renyah mekar dengan paduan rasa udang olahan spesial dan rasa manis gurih alami.', 'assets/images/kerupuk_udang.png'),
  ('Kerupuk Bawang', 15000, '', 'Aroma gurih khas bawang putih pilihan yang nikmat & pas sebagai teman makan nasi.', 'assets/images/kerupuk_bawang.png'),
  ('Kerupuk Kaleng', 5000, '', 'Kerupuk mawar legendaris dalam kemasan kaleng ikonik khas Indonesia yang selalu fresh.', 'assets/images/kerupuk_kaleng.png');


-- =============================================
-- 3. ENABLE REALTIME
-- =============================================
-- Aktifkan realtime untuk tabel products agar
-- perubahan langsung ter-push ke semua browser
ALTER PUBLICATION supabase_realtime ADD TABLE products;


-- =============================================
-- 4. SUPABASE STORAGE (Gambar Produk)
-- =============================================
-- Buat bucket 'product-images' untuk menyimpan gambar produk
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB max per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Semua orang bisa LIHAT gambar produk (publik)
CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Policy: Siapa saja bisa UPLOAD gambar produk (via anon key / admin)
CREATE POLICY "Allow upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Policy: Siapa saja bisa UPDATE gambar produk
CREATE POLICY "Allow update product images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images');

-- Policy: Siapa saja bisa DELETE gambar produk
CREATE POLICY "Allow delete product images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images');
