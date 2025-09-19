-- Create a ratings table for products
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  produce_id UUID NOT NULL REFERENCES public.produce(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, produce_id)
);

-- Enable RLS on ratings table
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for ratings
CREATE POLICY "Anyone can view ratings" 
ON public.ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert ratings" 
ON public.ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add average rating calculation to produce
ALTER TABLE public.produce ADD COLUMN average_rating DECIMAL(2,1) DEFAULT 0.0;
ALTER TABLE public.produce ADD COLUMN total_ratings INTEGER DEFAULT 0;

-- Create function to update produce ratings
CREATE OR REPLACE FUNCTION public.update_produce_rating()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for rating updates
CREATE TRIGGER update_produce_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_produce_rating();

-- Add trigger for updated_at on ratings
CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();