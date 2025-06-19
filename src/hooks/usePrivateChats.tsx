
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
      // Obtener chats privados del usuario
      const { data: chatData, error } = await supabase
        .from('private_chats')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching chats:', error);
        setChats([]);
        return;
      }

      if (!chatData || chatData.length === 0) {
        setChats([]);
        return;
      }

      const chatsWithUsers = await Promise.all(
        chatData.map(async (chat) => {
          const otherUserId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id;
          
          const { data: otherUserProfile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', otherUserId)
            .single();

          // Obtener último mensaje
          const { data: lastMessage } = await supabase
            .from('private_messages')
            .select('*')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...chat,
            other_user: otherUserProfile || null,
            last_message: lastMessage || undefined
          };
        })
      );

      setChats(chatsWithUsers);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  const getOrCreateChat = async (friendId: string): Promise<string | null> => {
    try {
      if (!user) return null;

      // Primero intentar encontrar un chat existente
      const { data: existingChatData, error: searchError } = await supabase
        .from('private_chats')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${friendId}),and(user1_id.eq.${friendId},user2_id.eq.${user.id})`)
        .maybeSingle();

      if (searchError) {
        console.log('Error searching for existing chat:', searchError);
      }

      if (existingChatData?.id) {
        return existingChatData.id;
      }

      // Si no existe, crear uno nuevo
      const user1_id = user.id < friendId ? user.id : friendId;
      const user2_id = user.id < friendId ? friendId : user.id;

      const { data: newChatData, error: createError } = await supabase
        .from('private_chats')
        .insert({
          user1_id,
          user2_id
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating chat:', createError);
        toast({
          title: "Error",
          description: "No se pudo crear el chat.",
          variant: "destructive",
        });
        return null;
      }
      
      return newChatData?.id || null;
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
