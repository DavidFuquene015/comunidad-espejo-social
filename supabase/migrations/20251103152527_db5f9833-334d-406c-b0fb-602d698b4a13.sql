-- 1. Crear el enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Crear tabla de roles de usuario
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- 3. Habilitar RLS en user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can update roles"
  ON public.user_roles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- 5. Crear función security definer para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 6. Función para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- 7. Trigger para asignar rol 'user' por defecto a nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- 8. POLÍTICAS DE ADMIN PARA TODAS LAS TABLAS

-- BOOKS - Admin puede hacer todo
CREATE POLICY "Admins can do anything on books"
  ON public.books
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- RIDE_REQUESTS - Admin puede hacer todo
CREATE POLICY "Admins can do anything on ride_requests"
  ON public.ride_requests
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- RIDE_OFFERS - Admin puede hacer todo
CREATE POLICY "Admins can do anything on ride_offers"
  ON public.ride_offers
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- FRIEND_REQUESTS - Admin puede hacer todo
CREATE POLICY "Admins can view all friend_requests"
  ON public.friend_requests
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete friend_requests"
  ON public.friend_requests
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- GROUPS - Admin puede hacer todo
CREATE POLICY "Admins can do anything on groups"
  ON public.groups
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- POST_COMMENTS - Admin puede hacer todo
CREATE POLICY "Admins can do anything on post_comments"
  ON public.post_comments
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- MESSAGES - Admin puede hacer todo
CREATE POLICY "Admins can do anything on messages"
  ON public.messages
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- PRIVATE_CHATS - Admin puede hacer todo
CREATE POLICY "Admins can view all private_chats"
  ON public.private_chats
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update private_chats"
  ON public.private_chats
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete private_chats"
  ON public.private_chats
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- PRIVATE_MESSAGES - Admin puede hacer todo
CREATE POLICY "Admins can view all private_messages"
  ON public.private_messages
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update private_messages"
  ON public.private_messages
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete private_messages"
  ON public.private_messages
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- STORIES - Admin puede hacer todo
CREATE POLICY "Admins can do anything on stories"
  ON public.stories
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- GROUP_MEMBERS - Admin puede hacer todo
CREATE POLICY "Admins can do anything on group_members"
  ON public.group_members
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- RIDE_MATCHES - Admin puede hacer todo
CREATE POLICY "Admins can view all ride_matches"
  ON public.ride_matches
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete ride_matches"
  ON public.ride_matches
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- POSTS - Admin puede hacer todo
CREATE POLICY "Admins can do anything on posts"
  ON public.posts
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- CHANNELS - Admin puede hacer todo
CREATE POLICY "Admins can do anything on channels"
  ON public.channels
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- FRIENDSHIPS - Admin puede hacer todo
CREATE POLICY "Admins can view all friendships"
  ON public.friendships
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update friendships"
  ON public.friendships
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete friendships"
  ON public.friendships
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- PROFILES - Admin puede hacer todo
CREATE POLICY "Admins can do anything on profiles"
  ON public.profiles
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- POST_REACTIONS - Admin puede hacer todo
CREATE POLICY "Admins can do anything on post_reactions"
  ON public.post_reactions
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- PROJECTS - Admin puede hacer todo
CREATE POLICY "Admins can do anything on projects"
  ON public.projects
  FOR ALL
  USING (public.is_admin(auth.uid()));