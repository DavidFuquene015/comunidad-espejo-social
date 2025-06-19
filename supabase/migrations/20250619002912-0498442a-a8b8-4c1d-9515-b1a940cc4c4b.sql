
-- Crear tabla para chats privados
CREATE TABLE public.private_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Crear tabla para mensajes privados
CREATE TABLE public.private_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.private_chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear bucket de almacenamiento para medios de chat privado
INSERT INTO storage.buckets (id, name, public) VALUES ('private-chat-media', 'private-chat-media', true);

-- Habilitar RLS en ambas tablas
ALTER TABLE public.private_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para private_chats
CREATE POLICY "Users can view their own chats" 
  ON public.private_chats 
  FOR SELECT 
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create chats" 
  ON public.private_chats 
  FOR INSERT 
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Políticas RLS para private_messages
CREATE POLICY "Users can view messages in their chats" 
  ON public.private_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.private_chats 
      WHERE id = chat_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their chats" 
  ON public.private_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.private_chats 
      WHERE id = chat_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Políticas de storage para el bucket de medios
CREATE POLICY "Users can upload their own media" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'private-chat-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view media in their chats" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'private-chat-media');

-- Habilitar realtime para las tablas
ALTER TABLE public.private_chats REPLICA IDENTITY FULL;
ALTER TABLE public.private_messages REPLICA IDENTITY FULL;

-- Agregar las tablas a la publicación de realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.private_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.private_messages;

-- Función para actualizar updated_at en private_chats cuando se envía un mensaje
CREATE OR REPLACE FUNCTION update_chat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.private_chats 
  SET updated_at = now() 
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp del chat
CREATE TRIGGER update_chat_timestamp_trigger
  AFTER INSERT ON public.private_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_timestamp();
