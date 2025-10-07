import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  created_at: string;
  expires_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  } | null;
}

export const useStories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStories = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stories-api/stories', {
        method: 'GET',
      });

      if (error) {
        console.error('Error fetching stories:', error);
        return;
      }

      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadStory = async (file: File, caption?: string) => {
    if (!user || !file) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `stories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        toast({
          title: "Error",
          description: "No se pudo subir el archivo.",
          variant: "destructive",
        });
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      const mediaType = file.type.startsWith('video') ? 'video' : 'image';

      const { data, error } = await supabase.functions.invoke('stories-api/stories', {
        method: 'POST',
        body: {
          media_url: publicUrl,
          media_type: mediaType,
          caption: caption || null,
        },
      });

      if (error) {
        console.error('Error creating story:', error);
        toast({
          title: "Error",
          description: "No se pudo crear la historia.",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "¡Historia creada!",
        description: "Tu historia se ha publicado correctamente.",
      });

      fetchStories();
      return data;
    } catch (error) {
      console.error('Error uploading story:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al subir la historia.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteStory = async (storyId: string) => {
    try {
      const { error } = await supabase.functions.invoke(`stories-api/stories/${storyId}`, {
        method: 'DELETE',
      });

      if (error) {
        console.error('Error deleting story:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar la historia.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Historia eliminada",
        description: "La historia se ha eliminado correctamente.",
      });

      fetchStories();
    } catch (error) {
      console.error('Error deleting story:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar la historia.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchStories();
    }
  }, [user]);

  return {
    stories,
    loading,
    fetchStories,
    uploadStory,
    deleteStory,
  };
};