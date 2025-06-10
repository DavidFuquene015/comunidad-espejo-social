
-- Crear tabla para las solicitudes de amistad
CREATE TABLE public.friend_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

-- Crear tabla para las amistades confirmadas
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id) -- Asegurar orden consistente para evitar duplicados
);

-- Habilitar RLS en las tablas
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para friend_requests
CREATE POLICY "Users can view friend requests sent to them or by them"
  ON public.friend_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests"
  ON public.friend_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update friend requests sent to them"
  ON public.friend_requests FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Políticas RLS para friendships
CREATE POLICY "Users can view their own friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can create friendships"
  ON public.friendships FOR INSERT
  WITH CHECK (true);

-- Función para crear amistad cuando se acepta una solicitud
CREATE OR REPLACE FUNCTION public.handle_friend_request_accepted()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo proceder si el status cambió a 'accepted'
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Crear la amistad (asegurar orden consistente)
    INSERT INTO public.friendships (user1_id, user2_id)
    VALUES (
      LEAST(NEW.sender_id, NEW.receiver_id),
      GREATEST(NEW.sender_id, NEW.receiver_id)
    )
    ON CONFLICT (user1_id, user2_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear amistad automáticamente
CREATE TRIGGER friend_request_accepted_trigger
  AFTER UPDATE ON public.friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_friend_request_accepted();

-- Función para obtener usuarios sugeridos (excluye amigos y solicitudes existentes)
CREATE OR REPLACE FUNCTION public.get_suggested_users(user_id UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.bio,
    p.avatar_url
  FROM public.profiles p
  WHERE p.id != user_id
    AND p.id NOT IN (
      -- Excluir usuarios con solicitudes pendientes o aceptadas
      SELECT fr.receiver_id FROM public.friend_requests fr 
      WHERE fr.sender_id = user_id
      UNION
      SELECT fr.sender_id FROM public.friend_requests fr 
      WHERE fr.receiver_id = user_id
      UNION
      -- Excluir amigos existentes
      SELECT f.user1_id FROM public.friendships f WHERE f.user2_id = user_id
      UNION
      SELECT f.user2_id FROM public.friendships f WHERE f.user1_id = user_id
    )
  ORDER BY p.created_at DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
