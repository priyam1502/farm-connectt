-- Fix foreign key constraint for ratings table to properly link to profiles
ALTER TABLE public.ratings 
DROP CONSTRAINT IF EXISTS ratings_user_id_fkey;

-- Add proper foreign key to link user_id in ratings to auth.users
ALTER TABLE public.ratings 
ADD CONSTRAINT ratings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;