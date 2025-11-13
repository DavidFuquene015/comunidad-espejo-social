
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
      const { data, error } = await supabase.functions.invoke(`chats-api/messages/${chatId}`, {
        method: 'GET',
      });

      if (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
        return;
      }

      setMessages(data || []);
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
      const session = await supabase.auth.getSession();
      if (!session.data.session) return;

      const response = await fetch(
        `https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/chats-api/messages/read/${chatId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.data.session.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bG11b296cnRxaGRxcXBkc2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NTM3MTIsImV4cCI6MjA2NDAyOTcxMn0.-fm1beUbeN3WpH_FRVoF4J4jbOLsuqGijsf74lcRRkY',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('Error marking messages as read');
        return;
      }

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

      const { error } = await supabase.functions.invoke('chats-api/messages', {
        method: 'POST',
        body: {
          chat_id: chatId,
          content: content || null,
          media_url: mediaUrl,
          media_type: mediaType,
        },
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

  const editMessage = async (messageId: string, newContent: string) => {
    if (!user) return;

    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) return;

      const response = await fetch(
        `https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/chats-api/messages/${messageId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.data.session.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bG11b296cnRxaGRxcXBkc2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NTM3MTIsImV4cCI6MjA2NDAyOTcxMn0.-fm1beUbeN3WpH_FRVoF4J4jbOLsuqGijsf74lcRRkY',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: newContent }),
        }
      );

      if (!response.ok) {
        console.error('Error editing message');
        toast({
          title: "Error",
          description: "No se pudo editar el mensaje.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Mensaje editado",
        description: "El mensaje se editó correctamente.",
      });
    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: "Error",
        description: "No se pudo editar el mensaje.",
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (messageId: string, deleteFor: 'me' | 'everyone' = 'me') => {
    if (!user) return;

    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) return;

      const response = await fetch(
        `https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/chats-api/messages/${messageId}?deleteFor=${deleteFor}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.data.session.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bG11b296cnRxaGRxcXBkc2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NTM3MTIsImV4cCI6MjA2NDAyOTcxMn0.-fm1beUbeN3WpH_FRVoF4J4jbOLsuqGijsf74lcRRkY',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('Error deleting message');
        toast({
          title: "Error",
          description: "No se pudo eliminar el mensaje.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Mensaje eliminado",
        description: deleteFor === 'everyone' 
          ? "El mensaje se eliminó para todos."
          : "El mensaje se eliminó para ti.",
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el mensaje.",
        variant: "destructive",
      });
    }
  };

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
    editMessage,
    deleteMessage,
    markMessagesAsRead,
    refetch: fetchMessages,
  };
};
