-- Create fake farmer profiles and produce data

-- First, let's add some fake farmer profiles (these will need to be linked to actual auth users later)
INSERT INTO profiles (id, user_id, user_type, full_name, phone, location) VALUES
  (gen_random_uuid(), gen_random_uuid(), 'farmer', 'Ramesh Kumar', '+919876543210', 'Punjab, India'),
  (gen_random_uuid(), gen_random_uuid(), 'farmer', 'Priya Patel', '+919876543211', 'Gujarat, India'),
  (gen_random_uuid(), gen_random_uuid(), 'farmer', 'Suresh Singh', '+919876543212', 'Haryana, India'),
  (gen_random_uuid(), gen_random_uuid(), 'farmer', 'Meera Devi', '+919876543213', 'Uttar Pradesh, India'),
  (gen_random_uuid(), gen_random_uuid(), 'farmer', 'Krishnan Nair', '+919876543214', 'Kerala, India');

-- Now add some produce from these farmers
INSERT INTO produce (farmer_id, name, description, price_per_kg, quantity_kg, harvest_date, location, image_url) 
SELECT 
  p.id as farmer_id,
  CASE p.full_name
    WHEN 'Ramesh Kumar' THEN 'Organic Basmati Rice'
    WHEN 'Priya Patel' THEN 'Fresh Tomatoes'
    WHEN 'Suresh Singh' THEN 'Premium Wheat'
    WHEN 'Meera Devi' THEN 'Organic Potatoes'
    WHEN 'Krishnan Nair' THEN 'Fresh Coconuts'
  END as name,
  CASE p.full_name
    WHEN 'Ramesh Kumar' THEN 'Premium quality organic basmati rice, grown without chemicals'
    WHEN 'Priya Patel' THEN 'Farm-fresh tomatoes, perfect for cooking and salads'
    WHEN 'Suresh Singh' THEN 'High-grade wheat, ideal for making flour and bread'
    WHEN 'Meera Devi' THEN 'Organic potatoes, rich in nutrients and flavor'
    WHEN 'Krishnan Nair' THEN 'Fresh coconuts straight from the farm'
  END as description,
  CASE p.full_name
    WHEN 'Ramesh Kumar' THEN 85.00
    WHEN 'Priya Patel' THEN 45.00
    WHEN 'Suresh Singh' THEN 32.00
    WHEN 'Meera Devi' THEN 28.00
    WHEN 'Krishnan Nair' THEN 25.00
  END as price_per_kg,
  CASE p.full_name
    WHEN 'Ramesh Kumar' THEN 1000.00
    WHEN 'Priya Patel' THEN 500.00
    WHEN 'Suresh Singh' THEN 2000.00
    WHEN 'Meera Devi' THEN 800.00
    WHEN 'Krishnan Nair' THEN 300.00
  END as quantity_kg,
  CURRENT_DATE - INTERVAL '7 days' as harvest_date,
  p.location,
  CASE p.full_name
    WHEN 'Ramesh Kumar' THEN 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400'
    WHEN 'Priya Patel' THEN 'https://images.unsplash.com/photo-1546470427-227a17f49877?w=400'
    WHEN 'Suresh Singh' THEN 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'
    WHEN 'Meera Devi' THEN 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400'
    WHEN 'Krishnan Nair' THEN 'https://images.unsplash.com/photo-1582804567060-fb8886522611?w=400'
  END as image_url
FROM profiles p 
WHERE p.user_type = 'farmer';

-- Add more variety of produce
INSERT INTO produce (farmer_id, name, description, price_per_kg, quantity_kg, harvest_date, location, image_url) 
SELECT 
  farmer_id,
  'Organic Onions' as name,
  'Fresh organic onions, perfect for cooking' as description,
  35.00 as price_per_kg,
  600.00 as quantity_kg,
  CURRENT_DATE - INTERVAL '5 days' as harvest_date,
  location,
  'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400' as image_url
FROM profiles 
WHERE user_type = 'farmer' AND full_name = 'Priya Patel';

INSERT INTO produce (farmer_id, name, description, price_per_kg, quantity_kg, harvest_date, location, image_url) 
SELECT 
  farmer_id,
  'Green Chilies' as name,
  'Spicy green chilies, freshly harvested' as description,
  120.00 as price_per_kg,
  150.00 as quantity_kg,
  CURRENT_DATE - INTERVAL '3 days' as harvest_date,
  location,
  'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400' as image_url
FROM profiles 
WHERE user_type = 'farmer' AND full_name = 'Meera Devi';