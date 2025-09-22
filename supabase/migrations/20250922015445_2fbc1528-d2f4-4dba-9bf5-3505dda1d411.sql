-- Fix the image positioning issue by updating the created_at timestamps
-- to ensure proper ordering (carrot should come before spinach)

UPDATE produce 
SET created_at = created_at - interval '1 minute'
WHERE name = 'Organic Carrots';

UPDATE produce 
SET created_at = created_at + interval '1 minute'  
WHERE name = 'Organic Spinach';