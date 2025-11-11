
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Base URL for calling Supabase Edge Functions with custom HTTP methods
const FUNCTIONS_BASE = 'https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1';

export interface Post {
  id: string;
  user_id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  reactions: PostReaction[];
  comments: PostComment[];
  _count?: {
    reactions: number;
    comments: number;
  };
}

export interface PostReaction {
  id: string;
  emoji: string;
  user_id: string;
}

export interface PostComment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const usePosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${FUNCTIONS_BASE}/posts-api/posts`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Error al cargar posts');
      }

      const data = await res.json();
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los posts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content: string, mediaFile?: File) => {
    if (!user) return;

    try {
      let mediaUrl = null;
      let mediaType = null;

      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('posts-media')
          .upload(fileName, mediaFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('posts-media')
          .getPublicUrl(fileName);

        mediaUrl = publicUrl;
        
        if (mediaFile.type.startsWith('image/')) mediaType = 'image';
        else if (mediaFile.type.startsWith('video/')) mediaType = 'video';
        else if (mediaFile.type.startsWith('audio/')) mediaType = 'audio';
      }

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${FUNCTIONS_BASE}/posts-api/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content || null,
          media_url: mediaUrl,
          media_type: mediaType,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Error al crear post');
      }

      toast({
        title: "¡Post publicado!",
        description: "Tu post se ha publicado exitosamente.",
      });

      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "No se pudo publicar el post.",
        variant: "destructive",
      });
    }
  };

  const toggleReaction = async (postId: string, emoji: string) => {
    if (!user) return;

    try {
      const existingReaction = posts
        .find(p => p.id === postId)?.reactions
        .find(r => r.user_id === user.id && r.emoji === emoji);

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${FUNCTIONS_BASE}/posts-api/reactions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: postId, emoji }),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Error al actualizar reacción');
      }

      fetchPosts();
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!user) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${FUNCTIONS_BASE}/posts-api/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: postId, content }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Error al agregar comentario');
      }
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${FUNCTIONS_BASE}/posts-api/posts`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.access_token ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: postId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Error al eliminar post');
      }
      
      toast({
        title: "Post eliminado",
        description: "El post se ha eliminado exitosamente.",
      });

      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el post.",
        variant: "destructive",
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${FUNCTIONS_BASE}/posts-api/comments`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.access_token ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment_id: commentId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Error al eliminar comentario');
      }
      fetchPosts();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el comentario.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel('posts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchPosts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_reactions' }, fetchPosts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, fetchPosts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    posts,
    loading,
    createPost,
    toggleReaction,
    addComment,
    deletePost,
    deleteComment,
    refetch: fetchPosts,
  };
};
