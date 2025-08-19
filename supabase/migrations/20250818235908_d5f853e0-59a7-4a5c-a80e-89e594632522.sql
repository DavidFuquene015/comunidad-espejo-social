-- Add expiration functionality to ride requests and offers
ALTER TABLE ride_requests ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 minutes');
ALTER TABLE ride_offers ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 minutes');

-- Create stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Enable RLS on stories
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Create policies for stories
CREATE POLICY "Users can create their own stories" 
ON public.stories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view stories from friends" 
ON public.stories 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.friendships 
    WHERE (user1_id = auth.uid() AND user2_id = stories.user_id) 
    OR (user2_id = auth.uid() AND user1_id = stories.user_id)
  )
);

CREATE POLICY "Users can delete their own stories" 
ON public.stories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to clean up expired content
CREATE OR REPLACE FUNCTION public.cleanup_expired_content()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete expired ride requests
  DELETE FROM public.ride_requests WHERE expires_at < now();
  
  -- Delete expired ride offers
  DELETE FROM public.ride_offers WHERE expires_at < now();
  
  -- Delete expired stories
  DELETE FROM public.stories WHERE expires_at < now();
END;
$$;

-- Create trigger to update expires_at when ride requests are updated
CREATE OR REPLACE FUNCTION public.update_ride_expiration()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Reset expiration to 30 minutes from now when updated
  NEW.expires_at = now() + interval '30 minutes';
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_ride_request_expiration
  BEFORE UPDATE ON public.ride_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ride_expiration();

CREATE TRIGGER update_ride_offer_expiration
  BEFORE UPDATE ON public.ride_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ride_expiration();