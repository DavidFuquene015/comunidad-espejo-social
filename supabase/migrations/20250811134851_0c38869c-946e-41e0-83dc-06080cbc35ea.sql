-- Fix security issue: Restrict profile visibility to authenticated users only
-- Drop the overly permissive policy that allows public access to all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a new policy that only allows authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Keep the existing policy for users to view their own profile (redundant but explicit)
-- This ensures users can always see their own profile data
CREATE POLICY "Users can view their own profile detailed" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);