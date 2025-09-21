-- Fix Profile RLS Policy - Remove overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create restrictive policies for profile access
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow viewing basic contact info only for users involved in active orders
CREATE POLICY "Users can view contact info for active orders" 
ON public.profiles 
FOR SELECT 
USING (
  id IN (
    SELECT DISTINCT farmer_id FROM public.orders 
    WHERE buyer_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND status IN ('pending', 'accepted')
  ) OR 
  id IN (
    SELECT DISTINCT buyer_id FROM public.orders 
    WHERE farmer_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND status IN ('pending', 'accepted')
  )
);

-- Fix database functions by adding proper search_path
CREATE OR REPLACE FUNCTION public.update_produce_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.produce 
    SET 
      average_rating = COALESCE((
        SELECT ROUND(AVG(rating)::numeric, 1) 
        FROM public.ratings 
        WHERE produce_id = NEW.produce_id
      ), 0),
      total_ratings = COALESCE((
        SELECT COUNT(*) 
        FROM public.ratings 
        WHERE produce_id = NEW.produce_id
      ), 0)
    WHERE id = NEW.produce_id;
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    UPDATE public.produce 
    SET 
      average_rating = COALESCE((
        SELECT ROUND(AVG(rating)::numeric, 1) 
        FROM public.ratings 
        WHERE produce_id = OLD.produce_id
      ), 0),
      total_ratings = COALESCE((
        SELECT COUNT(*) 
        FROM public.ratings 
        WHERE produce_id = OLD.produce_id
      ), 0)
    WHERE id = OLD.produce_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$;