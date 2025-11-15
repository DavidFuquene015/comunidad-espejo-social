
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
  unread_count?: number;
}

export interface PrivateMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  read_at: string | null;
  edited_at: string | null;
  deleted_for_sender: boolean | null;
  deleted_for_receiver: boolean | null;
  deleted_for_everyone: boolean | null;
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
      const { data, error } = await supabase.functions.invoke('chats-api/chats', {
        method: 'GET',
      });

      if (error) {
        console.error('Error fetching chats:', error);
        setChats([]);
        return;
      }

      setChats(data || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  const markChatAsRead = async (chatId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke(`chats-api/messages/read/${chatId}`, {
        method: 'PUT',
      });

      if (error) {
        console.error('Error marking messages as read:', error);
        return;
      }

      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId 
            ? { ...chat, unread_count: 0 }
            : chat
        )
      );
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  };

  const getOrCreateChat = async (friendId: string): Promise<string | null> => {
    try {
      if (!user) return null;

      const { data, error } = await supabase.functions.invoke('chats-api/chats', {
        method: 'POST',
        body: { friend_id: friendId },
      });

      if (error) {
        console.error('Error creating chat:', error);
        toast({
          title: "Error",
          description: "No se pudo crear el chat.",
          variant: "destructive",
        });
        return null;
      }
      
      return data?.chat_id || null;
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

      // Escuchar cambios en tiempo real en ambas tablas
      const channel = supabase
        .channel('private-chats-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'private_chats' 
        }, () => {
          console.log('Private chats table changed, refetching...');
          fetchChats();
        })
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'private_messages' 
        }, () => {
          console.log('Private messages table changed, refetching...');
          fetchChats();
        })
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
    markChatAsRead,
    refetch: fetchChats,
  };
};
