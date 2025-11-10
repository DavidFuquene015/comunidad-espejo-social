
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
      const { data, error } = await supabase.functions.invoke('posts-api/posts', {
        method: 'GET',
      });

      if (error) throw error;

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

      const { error } = await supabase.functions.invoke('posts-api/posts', {
        method: 'POST',
        body: {
          content: content || null,
          media_url: mediaUrl,
          media_type: mediaType,
        },
      });

      if (error) throw error;

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

      const { error } = await supabase.functions.invoke('posts-api/reactions', {
        method: 'POST',
        body: {
          post_id: postId,
          emoji,
          remove: !!existingReaction,
        },
      });
      
      if (error) throw error;

      fetchPosts();
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('posts-api/comments', {
        method: 'POST',
        body: {
          post_id: postId,
          content,
        },
      });

      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('posts-api/posts', {
        method: 'DELETE',
        body: { post_id: postId },
      });

      if (error) throw error;
      
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
      const { error } = await supabase.functions.invoke('posts-api/comments', {
        method: 'DELETE',
        body: { comment_id: commentId },
      });

      if (error) throw error;
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
