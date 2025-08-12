-- Fix security vulnerability: Restrict ride data access to authenticated users only
-- This prevents stalkers from tracking student movements through publicly accessible ride data

-- Drop the overly permissive policies that allow public access
DROP POLICY IF EXISTS "Users can view all ride requests" ON public.ride_requests;
DROP POLICY IF EXISTS "Users can view all ride offers" ON public.ride_offers;

-- Create new secure policies that require authentication
CREATE POLICY "Authenticated users can view ride requests" 
ON public.ride_requests 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view ride offers" 
ON public.ride_offers 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Add comments to document the security fix
COMMENT ON POLICY "Authenticated users can view ride requests" ON public.ride_requests IS 
'Security fix: Prevents unauthorized access to student location data that could be used for stalking';

COMMENT ON POLICY "Authenticated users can view ride offers" ON public.ride_offers IS 
'Security fix: Prevents unauthorized access to driver location data that could be used for stalking';