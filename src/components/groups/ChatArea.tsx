
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Image, Paperclip } from 'lucide-react';
import MessageList from './MessageList';

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  description: string;
}

interface Message {
  id: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

interface ChatAreaProps {
  channel: Channel;
}

const ChatArea = ({ channel }: ChatAreaProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (channel) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [channel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('channel_id', channel.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel(`messages:${channel.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channel.id}`
        },
        async (payload) => {
          // Fetch the complete message with profile data
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              profiles:user_id (
                full_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages(prev => [...prev, data]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          channel_id: channel.id,
          user_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setSending(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${channel.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('group-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('group-media')
        .getPublicUrl(fileName);

      // Determine media type
      let mediaType = 'image';
      if (file.type.startsWith('audio/')) mediaType = 'audio';
      else if (file.type.startsWith('video/')) mediaType = 'video';

      // Send message with media
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          channel_id: channel.id,
          user_id: user.id,
          content: file.name,
          media_url: data.publicUrl,
          media_type: mediaType
        });

      if (messageError) throw messageError;

      toast({
        title: "¡Éxito!",
        description: "Archivo enviado exitosamente.",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "No se pudo subir el archivo.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white/70">Cargando mensajes...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Channel Header */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/20 p-4">
        <h3 className="text-white font-semibold"># {channel.name}</h3>
        {channel.description && (
          <p className="text-white/70 text-sm">{channel.description}</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <MessageList messages={messages} currentUserId={user?.id} />
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-white/20 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,audio/*,video/*"
            className="hidden"
          />
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="text-white/70 hover:bg-white/10"
            disabled={sending}
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Enviar mensaje a #${channel.name}`}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50"
            disabled={sending}
          />
          
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
