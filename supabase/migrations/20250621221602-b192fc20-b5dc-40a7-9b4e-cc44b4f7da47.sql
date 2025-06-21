
-- Add read_at column to private_messages table
ALTER TABLE public.private_messages 
ADD COLUMN read_at timestamp with time zone DEFAULT NULL;
