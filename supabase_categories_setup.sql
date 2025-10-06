-- Categories jadvalini yaratish
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Demo kategoriyalar qo'shish
INSERT INTO categories (name, description, color) VALUES 
('Telefonlar', 'Smartfonlar va mobil telefonlar', '#3B82F6'),
('Sovutgichlar', 'Sovutgich va muzlatgichlar', '#10B981'),
('Kir Yuvish', 'Kir yuvish mashinalari', '#F59E0B'),
('Televizorlar', 'TV va monitorlar', '#EF4444'),
('Konditsionerlar', 'Konditsioner va isitgichlar', '#8B5CF6'),
('Oshxona', 'Oshxona jihozlari', '#F97316')
ON CONFLICT (name) DO NOTHING;

-- Products jadvaliga category_id qo'shish (ixtiyoriy)
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Index qo'shish
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- RLS (Row Level Security) qo'shish
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Barcha foydalanuvchilar kategoriyalarni ko'ra olishi
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- Faqat admin kategoriya qo'sha oladi
CREATE POLICY "Only admin can insert categories" ON categories
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Faqat admin kategoriyani yangilay oladi
CREATE POLICY "Only admin can update categories" ON categories
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Faqat admin kategoriyani o'chira oladi
CREATE POLICY "Only admin can delete categories" ON categories
  FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');
