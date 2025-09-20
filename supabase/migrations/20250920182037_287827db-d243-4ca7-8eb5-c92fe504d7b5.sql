-- Insert fake farmer profiles for demonstration
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'rajesh.farmer@gmail.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"user_type": "farmer", "full_name": "Rajesh Kumar", "phone": "9876543210"}'),
  ('550e8400-e29b-41d4-a716-446655440002', 'priya.organic@gmail.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"user_type": "farmer", "full_name": "Priya Sharma", "phone": "9876543211"}'),
  ('550e8400-e29b-41d4-a716-446655440003', 'suresh.farm@gmail.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"user_type": "farmer", "full_name": "Suresh Patel", "phone": "9876543212"}'),
  ('550e8400-e29b-41d4-a716-446655440004', 'lakshmi.greens@gmail.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"user_type": "farmer", "full_name": "Lakshmi Reddy", "phone": "9876543213"}'),
  ('550e8400-e29b-41d4-a716-446655440005', 'arun.vegetables@gmail.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"user_type": "farmer", "full_name": "Arun Singh", "phone": "9876543214"}');

-- The trigger will automatically create profiles for these users

-- Insert fake produce data
INSERT INTO public.produce (id, farmer_id, name, description, price_per_kg, quantity_kg, location, harvest_date, image_url, is_available)
VALUES 
  -- Rajesh Kumar's produce
  ('650e8400-e29b-41d4-a716-446655440001', (SELECT id FROM profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'), 'Fresh Tomatoes', 'Juicy red tomatoes, perfect for cooking and salads. Grown without pesticides using traditional farming methods.', 45.00, 150, 'Pune, Maharashtra', '2024-01-15', 'https://images.unsplash.com/photo-1546470427-e22b67d6dde5?w=400', true),
  ('650e8400-e29b-41d4-a716-446655440002', (SELECT id FROM profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'), 'Organic Carrots', 'Sweet and crunchy organic carrots. Rich in beta-carotene and perfect for juicing or cooking.', 60.00, 80, 'Pune, Maharashtra', '2024-01-10', 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400', true),
  
  -- Priya Sharma's produce  
  ('650e8400-e29b-41d4-a716-446655440003', (SELECT id FROM profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440002'), 'Organic Spinach', 'Fresh green spinach leaves, organically grown. High in iron and vitamins. Perfect for healthy meals.', 40.00, 50, 'Nashik, Maharashtra', '2024-01-18', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400', true),
  ('650e8400-e29b-41d4-a716-446655440004', (SELECT id FROM profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440002'), 'Fresh Mint', 'Aromatic fresh mint leaves. Ideal for teas, chutneys, and garnishing. Grown organically.', 80.00, 25, 'Nashik, Maharashtra', '2024-01-20', 'https://images.unsplash.com/photo-1628779238738-0d0de9dc0cd1?w=400', true),
  
  -- Suresh Patel's produce
  ('650e8400-e29b-41d4-a716-446655440005', (SELECT id FROM profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440003'), 'Fresh Onions', 'High-quality white onions. Essential for Indian cooking. Long shelf life and great flavor.', 30.00, 200, 'Ahmedabad, Gujarat', '2024-01-12', 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400', true),
  ('650e8400-e29b-41d4-a716-446655440006', (SELECT id FROM profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440003'), 'Green Chillies', 'Spicy green chillies perfect for Indian cuisine. Fresh and fiery hot. Adds authentic heat to dishes.', 120.00, 40, 'Ahmedabad, Gujarat', '2024-01-16', 'https://images.unsplash.com/photo-1583300852775-d4f02d0c9eb4?w=400', true),
  
  -- Lakshmi Reddy's produce
  ('650e8400-e29b-41d4-a716-446655440007', (SELECT id FROM profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440004'), 'Fresh Cauliflower', 'White, firm cauliflower heads. Perfect for curries, parathas, and healthy cooking. Pesticide-free.', 50.00, 75, 'Hyderabad, Telangana', '2024-01-14', 'https://images.unsplash.com/photo-1510627489930-0c1b0bfb6785?w=400', true),
  ('650e8400-e29b-41d4-a716-446655440008', (SELECT id FROM profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440004'), 'Fresh Coriander', 'Fragrant coriander leaves. Essential herb for Indian cooking. Adds fresh flavor to any dish.', 90.00, 30, 'Hyderabad, Telangana', '2024-01-19', 'https://images.unsplash.com/photo-1583300852775-d4f02d0c9eb4?w=400', true),
  
  -- Arun Singh's produce
  ('650e8400-e29b-41d4-a716-446655440009', (SELECT id FROM profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440005'), 'Fresh Potatoes', 'High-quality potatoes perfect for all cooking needs. Long-lasting and versatile vegetable.', 25.00, 300, 'Jaipur, Rajasthan', '2024-01-08', 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400', true),
  ('650e8400-e29b-41d4-a716-446655440010', (SELECT id FROM profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440005'), 'Fresh Cabbage', 'Crisp green cabbage heads. Great for salads, stir-fries, and traditional Indian dishes.', 35.00, 120, 'Jaipur, Rajasthan', '2024-01-17', 'https://images.unsplash.com/photo-1594282486738-1d45ec1bf84c?w=400', true),
  
  -- Additional seasonal produce
  ('650e8400-e29b-41d4-a716-446655440011', (SELECT id FROM profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'), 'Fresh Okra', 'Tender green okra (ladyfinger). Perfect for Indian curry dishes. Fresh from the farm.', 55.00, 60, 'Pune, Maharashtra', '2024-01-21', 'https://images.unsplash.com/photo-1628616693979-b40c88d3cbe1?w=400', true),
  ('650e8400-e29b-41d4-a716-446655440012', (SELECT id FROM profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440002'), 'Fresh Ginger', 'Aromatic fresh ginger root. Essential for Indian cooking and natural remedies. Organically grown.', 150.00, 35, 'Nashik, Maharashtra', '2024-01-13', 'https://images.unsplash.com/photo-1583300852775-d4f02d0c9eb4?w=400', true);

-- Insert some fake ratings to make the produce look more authentic
INSERT INTO public.ratings (id, user_id, produce_id, rating, comment)
VALUES 
  ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 5, 'Excellent quality tomatoes! Very fresh and juicy.'),
  ('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', 4, 'Great organic spinach. Good value for money.'),
  ('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005', 5, 'Best onions in the market. Long lasting and good quality.'),
  ('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440007', 4, 'Fresh cauliflower, delivered on time. Happy with purchase.'),
  ('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440009', 5, 'Excellent potatoes for reasonable price. Will order again.');

-- Update profile locations for better demo data
UPDATE public.profiles 
SET location = CASE 
  WHEN user_id = '550e8400-e29b-41d4-a716-446655440001' THEN 'Pune, Maharashtra'
  WHEN user_id = '550e8400-e29b-41d4-a716-446655440002' THEN 'Nashik, Maharashtra'
  WHEN user_id = '550e8400-e29b-41d4-a716-446655440003' THEN 'Ahmedabad, Gujarat'
  WHEN user_id = '550e8400-e29b-41d4-a716-446655440004' THEN 'Hyderabad, Telangana'
  WHEN user_id = '550e8400-e29b-41d4-a716-446655440005' THEN 'Jaipur, Rajasthan'
END
WHERE user_id IN ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005');