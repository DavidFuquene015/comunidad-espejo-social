
-- Crear tabla para posts
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT,
  media_url TEXT,
  media_type TEXT, -- 'image', 'video', 'audio'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para reacciones
CREATE TABLE public.post_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, emoji)
);

-- Crear tabla para comentarios
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear bucket para archivos multimedia
INSERT INTO storage.buckets (id, name, public) 
VALUES ('posts-media', 'posts-media', true);

-- Habilitar RLS en las tablas
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Políticas para posts
CREATE POLICY "Users can view all posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Políticas para reacciones
CREATE POLICY "Users can view all reactions" ON public.post_reactions FOR SELECT USING (true);
CREATE POLICY "Users can create reactions" ON public.post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reactions" ON public.post_reactions FOR DELETE USING (auth.uid() = user_id);

-- Políticas para comentarios
CREATE POLICY "Users can view all comments" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.post_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.post_comments FOR DELETE USING (auth.uid() = user_id);

-- Políticas para storage
CREATE POLICY "Users can upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posts-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view media" ON storage.objects FOR SELECT USING (bucket_id = 'posts-media');
CREATE POLICY "Users can delete their own media" ON storage.objects FOR DELETE USING (bucket_id = 'posts-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Habilitar realtime para posts
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.post_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.post_comments REPLICA IDENTITY FULL;

-- Agregar tablas a la publicación de realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
