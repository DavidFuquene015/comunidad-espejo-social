
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PrivateMessage } from './usePrivateChats';

export const usePrivateMessages = (chatId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    if (!chatId) return;

    try {
      const { data: messagesData, error } = await supabase
        .from('private_messages')
        .select('*, read_at')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
        return;
      }

      if (!messagesData) {
        setMessages([]);
        return;
      }

      const messagesWithProfiles = await Promise.all(
        messagesData.map(async (message) => {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', message.sender_id)
            .single();

          return {
            ...message,
            sender: senderProfile || { full_name: null, avatar_url: null }
          };
        })
      );

      setMessages(messagesWithProfiles);

      // Marcar mensajes como leídos automáticamente cuando se cargan
      if (user) {
        await markMessagesAsRead();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user || !chatId) return;

    try {
      await supabase
        .from('private_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('chat_id', chatId)
        .neq('sender_id', user.id)
        .is('read_at', null);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async (content: string, mediaFile?: File) => {
    if (!user || !chatId) return;

    try {
      let mediaUrl = null;
      let mediaType = null;

      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${user.id}/${chatId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('private-chat-media')
          .upload(fileName, mediaFile);

        if (uploadError) {
          console.log('Storage upload error:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('private-chat-media')
            .getPublicUrl(fileName);

          mediaUrl = publicUrl;
          
          if (mediaFile.type.startsWith('image/')) mediaType = 'image';
          else if (mediaFile.type.startsWith('video/')) mediaType = 'video';
          else if (mediaFile.type.startsWith('audio/')) mediaType = 'audio';
          else mediaType = 'file';
        }
      }

      const { error } = await supabase
        .from('private_messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content: content || null,
          media_url: mediaUrl,
          media_type: mediaType,
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "No se pudo enviar el mensaje.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "¡Mensaje enviado!",
        description: "Tu mensaje se ha enviado exitosamente.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (chatId) {
      fetchMessages();

      const channel = supabase
        .channel(`private-messages:${chatId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'private_messages',
            filter: `chat_id=eq.${chatId}`
          },
          async (payload: any) => {
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', payload.new.sender_id)
              .single();

            const newMessage: PrivateMessage = {
              ...payload.new,
              sender: senderProfile || { full_name: null, avatar_url: null }
            };

            setMessages(prev => [...prev, newMessage]);
            
            // Marcar como leído si no es nuestro mensaje
            if (user && payload.new.sender_id !== user.id) {
              await markMessagesAsRead();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [chatId, user]);

  return {
    messages,
    loading,
    sendMessage,
    markMessagesAsRead,
    refetch: fetchMessages,
  };
};
