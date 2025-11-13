-- Agregar columnas para edición y eliminación de mensajes
ALTER TABLE public.private_messages
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_for_sender BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_for_receiver BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_for_everyone BOOLEAN DEFAULT false;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_private_messages_deleted_for_sender 
ON public.private_messages(deleted_for_sender);

CREATE INDEX IF NOT EXISTS idx_private_messages_deleted_for_receiver 
ON public.private_messages(deleted_for_receiver);

CREATE INDEX IF NOT EXISTS idx_private_messages_deleted_for_everyone 
ON public.private_messages(deleted_for_everyone);