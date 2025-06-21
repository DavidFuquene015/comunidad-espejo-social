
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
      // Solo marcar mensajes que no son míos y que no han sido leídos
      const { error } = await supabase
        .from('private_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('chat_id', chatId)
        .neq('sender_id', user.id)
        .is('read_at', null);

      if (error) {
        console.error('Error marking messages as read:', error);
        return;
      }

      // Actualizar el estado local inmediatamente
      setMessages(prev => 
        prev.map(msg => 
          msg.sender_id !== user.id && !msg.read_at
            ? { ...msg, read_at: new Date().toISOString() }
            : msg
        )
      );
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

  // Efecto principal para suscribirse a cambios en tiempo real
  useEffect(() => {
    if (chatId && user) {
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
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'private_messages',
            filter: `chat_id=eq.${chatId}`
          },
          (payload: any) => {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === payload.new.id 
                  ? { ...msg, read_at: payload.new.read_at }
                  : msg
              )
            );
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [chatId, user]);

  // Efecto separado para marcar mensajes como leídos cuando se carga el chat
  useEffect(() => {
    if (chatId && user && messages.length > 0) {
      // Marcar como leído después de un pequeño delay para asegurar que los mensajes se han cargado
      const timer = setTimeout(() => {
        markMessagesAsRead();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [chatId, user, messages.length]);

  return {
    messages,
    loading,
    sendMessage,
    markMessagesAsRead,
    refetch: fetchMessages,
  };
};
