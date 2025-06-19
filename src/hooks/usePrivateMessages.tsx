
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
        .from('private_messages' as any)
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.log('Error fetching messages, might need to create tables:', error);
        setMessages([]);
        return;
      }

      if (!messagesData) {
        setMessages([]);
        return;
      }

      const messagesWithProfiles = await Promise.all(
        messagesData.map(async (message: any) => {
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
        .from('private_messages' as any)
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content: content || null,
          media_url: mediaUrl,
          media_type: mediaType,
        });

      if (error) {
        console.log('Error sending message:', error);
        toast({
          title: "Error",
          description: "No se pudo enviar el mensaje. Las tablas necesitan ser creadas.",
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
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [chatId]);

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages,
  };
};
