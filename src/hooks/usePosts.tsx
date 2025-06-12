
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
  };
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
  };
}

export const usePosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const postsWithReactionsAndComments = await Promise.all(
        (data || []).map(async (post) => {
          const [reactions, comments] = await Promise.all([
            supabase
              .from('post_reactions')
              .select('*')
              .eq('post_id', post.id),
            supabase
              .from('post_comments')
              .select(`
                *,
                profiles:user_id (
                  full_name,
                  avatar_url
                )
              `)
              .eq('post_id', post.id)
              .order('created_at', { ascending: true })
          ]);

          return {
            ...post,
            reactions: reactions.data || [],
            comments: comments.data || [],
            _count: {
              reactions: reactions.data?.length || 0,
              comments: comments.data?.length || 0,
            },
          };
        })
      );

      setPosts(postsWithReactionsAndComments);
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

      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content || null,
          media_url: mediaUrl,
          media_type: mediaType,
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

      if (existingReaction) {
        const { error } = await supabase
          .from('post_reactions')
          .delete()
          .eq('id', existingReaction.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            emoji,
          });
        
        if (error) throw error;
      }

      fetchPosts();
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
        });

      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
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
    refetch: fetchPosts,
  };
};
