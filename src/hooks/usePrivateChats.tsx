
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface PrivateChat {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
  other_user: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  last_message?: PrivateMessage;
}

export interface PrivateMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  sender: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const usePrivateChats = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chats, setChats] = useState<PrivateChat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    if (!user) return;

    try {
      // Usar consulta SQL directa para evitar problemas de tipos
      const { data: chatData, error: chatError } = await supabase
        .rpc('execute_sql', {
          query: `
            SELECT * FROM private_chats 
            WHERE user1_id = $1 OR user2_id = $1 
            ORDER BY updated_at DESC
          `,
          params: [user.id]
        });

      if (chatError) {
        console.error('Error fetching chats:', chatError);
        // Fallback: usar from() pero casting el tipo
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('private_chats' as any)
          .select('*')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order('updated_at', { ascending: false });
        
        if (fallbackError) throw fallbackError;
        
        const chatsWithUsers = await Promise.all(
          (fallbackData || []).map(async (chat: any) => {
            const otherUserId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id;
            
            const { data: otherUserProfile } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .eq('id', otherUserId)
              .single();

            // Obtener último mensaje
            const { data: lastMessage } = await supabase
              .from('private_messages' as any)
              .select('*')
              .eq('chat_id', chat.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            return {
              ...chat,
              other_user: otherUserProfile || null,
              last_message: lastMessage || undefined
            };
          })
        );

        setChats(chatsWithUsers);
        return;
      }

      // Si la función RPC funciona, procesar los datos
      const chatsWithUsers = await Promise.all(
        (chatData || []).map(async (chat: any) => {
          const otherUserId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id;
          
          const { data: otherUserProfile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', otherUserId)
            .single();

          return {
            ...chat,
            other_user: otherUserProfile || null
          };
        })
      );

      setChats(chatsWithUsers);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOrCreateChat = async (friendId: string): Promise<string | null> => {
    try {
      // Usar la función que ya creamos en SQL
      const { data, error } = await supabase
        .rpc('get_or_create_private_chat', {
          other_user_id: friendId
        });

      if (error) throw error;
      return data as string;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el chat.",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchChats();

      // Escuchar cambios en tiempo real
      const channel = supabase
        .channel('private-chats-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'private_chats' }, fetchChats)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'private_messages' }, fetchChats)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    chats,
    loading,
    getOrCreateChat,
    refetch: fetchChats,
  };
};
