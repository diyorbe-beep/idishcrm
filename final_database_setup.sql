-- ==============================================
-- TO'LIQ DATABASE SETUP - Supabase uchun
-- ==============================================

-- 1. Products jadvaliga tannarx ustunlarini qo'shish (agar mavjud bo'lmasa)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'cost_price') THEN
        ALTER TABLE products ADD COLUMN cost_price DECIMAL(15,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'selling_price') THEN
        ALTER TABLE products ADD COLUMN selling_price DECIMAL(15,2);
    END IF;
END $$;

-- 2. Mavjud mahsulotlar uchun tannarx va sotiladigan narxni belgilash
UPDATE products 
SET cost_price = COALESCE(cost_price, price * 0.7), 
    selling_price = COALESCE(selling_price, price)
WHERE cost_price IS NULL OR selling_price IS NULL;

-- 3. Demo foydalanuvchilarni qo'shish (agar mavjud bo'lmasa)
INSERT INTO users (name, email, password_hash, role, phone) 
SELECT 'Ahmad Karimov', 'admin@idishbozor.uz', '$2a$10$rQZ8K9vL8K9vL8K9vL8K9e', 'admin', '+998901234567'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@idishbozor.uz');

INSERT INTO users (name, email, password_hash, role, phone) 
SELECT 'Madina Aliyeva', 'sotuvchi@idishbozor.uz', '$2a$10$rQZ8K9vL8K9vL8K9vL8K9e', 'sotuvchi', '+998901234568'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'sotuvchi@idishbozor.uz');

-- 4. Demo mahsulotlarni qo'shish (agar mavjud bo'lmasa)
INSERT INTO products (name, category, brand, price, cost_price, selling_price, discount, quantity, min_quantity, barcode, description) 
SELECT 'Samsung Galaxy A54', 'Telefonlar', 'Samsung', 4200000, 2940000, 4200000, 5, 15, 5, '8801234567890', 'Yangi Samsung Galaxy A54 smartfon'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE barcode = '8801234567890');

INSERT INTO products (name, category, brand, price, cost_price, selling_price, discount, quantity, min_quantity, barcode, description) 
SELECT 'LG Inverter Konditsioner', 'Konditsionerlar', 'LG', 8500000, 5950000, 8500000, 10, 8, 3, '8801234567891', '12 BTU inverter konditsioner'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE barcode = '8801234567891');

-- 5. Demo ta'minotchilarni qo'shish (agar mavjud bo'lmasa)
INSERT INTO suppliers (name, contact_person, phone, email, address) 
SELECT 'Samsung Uzbekistan', 'Aziz Karimov', '+998712345678', 'aziz@samsung.uz', 'Toshkent, Yunusobod tumani'
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE name = 'Samsung Uzbekistan');

INSERT INTO suppliers (name, contact_person, phone, email, address) 
SELECT 'LG Electronics', 'Madina Aliyeva', '+998712345679', 'madina@lg.uz', 'Toshkent, Mirzo Ulugbek tumani'
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE name = 'LG Electronics');

-- 6. Categories jadvalini yaratish (agar mavjud bo'lmasa)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Demo kategoriyalarni qo'shish
INSERT INTO categories (name, description, color) VALUES 
('Telefonlar', 'Smartfonlar va mobil telefonlar', '#3B82F6'),
('Sovutgichlar', 'Sovutgich va muzlatgichlar', '#10B981'),
('Kir Yuvish', 'Kir yuvish mashinalari', '#F59E0B'),
('Televizorlar', 'TV va monitorlar', '#EF4444'),
('Konditsionerlar', 'Konditsioner va isitgichlar', '#8B5CF6'),
('Oshxona', 'Oshxona jihozlari', '#F97316')
ON CONFLICT (name) DO NOTHING;

-- 8. Products jadvaliga category_id qo'shish (ixtiyoriy)
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- 9. Index qo'shish
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- 10. Storage bucket yaratish (agar mavjud bo'lmasa)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 11. Barcha mavjud policies'larni o'chirish
DO $$
DECLARE
    r RECORD;
BEGIN
    -- storage.objects uchun barcha policies'ni o'chirish
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
    END LOOP;
    
    -- storage.buckets uchun barcha policies'ni o'chirish
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'buckets') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.buckets';
    END LOOP;
    
    -- categories uchun barcha policies'ni o'chirish
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'categories') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON categories';
    END LOOP;
END $$;

-- 12. RLS'ni butunlay o'chirish
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 13. Qo'shimcha demo ma'lumotlar
INSERT INTO products (name, category, brand, price, cost_price, selling_price, discount, quantity, min_quantity, barcode, description) 
SELECT 'iPhone 15 Pro', 'Telefonlar', 'Apple', 12000000, 8400000, 12000000, 0, 8, 3, '8801234567892', 'Yangi iPhone 15 Pro Max'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE barcode = '8801234567892');

INSERT INTO products (name, category, brand, price, cost_price, selling_price, discount, quantity, min_quantity, barcode, description) 
SELECT 'Bosch Kir Yuvish Mashinasi', 'Kir Yuvish', 'Bosch', 3500000, 2450000, 3500000, 8, 12, 4, '8801234567893', '8kg yuklovchi kir yuvish mashinasi'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE barcode = '8801234567893');

INSERT INTO products (name, category, brand, price, cost_price, selling_price, discount, quantity, min_quantity, barcode, description) 
SELECT 'Samsung 55" Smart TV', 'Televizorlar', 'Samsung', 6500000, 4550000, 6500000, 12, 6, 2, '8801234567894', '55 dyuymli 4K Smart TV'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE barcode = '8801234567894');

-- 14. Demo mijozlar
INSERT INTO customers (name, phone, email, address, bonus_points, total_purchases) 
SELECT 'Akmal Karimov', '+998901234569', 'akmal@example.com', 'Toshkent, Chilonzor tumani', 150, 2500000
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE phone = '+998901234569');

INSERT INTO customers (name, phone, email, address, bonus_points, total_purchases) 
SELECT 'Malika Toshmatova', '+998901234570', 'malika@example.com', 'Toshkent, Shayxontohur tumani', 75, 1200000
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE phone = '+998901234570');

-- 15. Demo savdolar
INSERT INTO sales (customer_id, user_id, total, payment_method) 
SELECT 
  (SELECT id FROM customers WHERE phone = '+998901234569' LIMIT 1),
  (SELECT id FROM users WHERE email = 'admin@idishbozor.uz' LIMIT 1),
  4200000,
  'naqd'
WHERE EXISTS (SELECT 1 FROM customers WHERE phone = '+998901234569')
AND EXISTS (SELECT 1 FROM users WHERE email = 'admin@idishbozor.uz');

-- 16. Demo savdo elementlari
INSERT INTO sale_items (sale_id, product_id, quantity, price, discount) 
SELECT 
  (SELECT id FROM sales WHERE total = 4200000 LIMIT 1),
  (SELECT id FROM products WHERE barcode = '8801234567890' LIMIT 1),
  1,
  4200000,
  5
WHERE EXISTS (SELECT 1 FROM sales WHERE total = 4200000)
AND EXISTS (SELECT 1 FROM products WHERE barcode = '8801234567890');

-- 17. Demo ombor harakatlari
INSERT INTO stock_movements (product_id, type, quantity, reason, user_id) 
SELECT 
  (SELECT id FROM products WHERE barcode = '8801234567890' LIMIT 1),
  'kirim',
  20,
  'Yangi mahsulot keltirildi',
  (SELECT id FROM users WHERE email = 'admin@idishbozor.uz' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM products WHERE barcode = '8801234567890')
AND EXISTS (SELECT 1 FROM users WHERE email = 'admin@idishbozor.uz');

-- 18. Demo xarid buyurtmalari
INSERT INTO purchase_orders (supplier_id, total_amount, status, delivery_date, notes) 
SELECT 
  (SELECT id FROM suppliers WHERE name = 'Samsung Uzbekistan' LIMIT 1),
  8400000,
  'tasdiqlangan',
  NOW() + INTERVAL '7 days',
  'Yangi telefonlar uchun buyurtma'
WHERE EXISTS (SELECT 1 FROM suppliers WHERE name = 'Samsung Uzbekistan');

-- 19. Demo xarid buyurtma elementlari
INSERT INTO purchase_order_items (order_id, product_id, quantity, unit_price) 
SELECT 
  (SELECT id FROM purchase_orders WHERE notes = 'Yangi telefonlar uchun buyurtma' LIMIT 1),
  (SELECT id FROM products WHERE barcode = '8801234567890' LIMIT 1),
  10,
  2940000
WHERE EXISTS (SELECT 1 FROM purchase_orders WHERE notes = 'Yangi telefonlar uchun buyurtma')
AND EXISTS (SELECT 1 FROM products WHERE barcode = '8801234567890');

-- ==============================================
-- SETUP TUGADI
-- ==============================================