
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivateChats } from '@/hooks/usePrivateChats';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StartChatButtonProps {
  friendId: string;
  friendName: string;
}

const StartChatButton = ({ friendId, friendName }: StartChatButtonProps) => {
  const navigate = useNavigate();
  const { getOrCreateChat } = usePrivateChats();
  const { toast } = useToast();

  const handleStartChat = async () => {
    try {
      const chatId = await getOrCreateChat(friendId);
      if (chatId) {
        navigate(`/chat/${chatId}`);
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear el chat con este usuario.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al intentar iniciar el chat.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleStartChat}
      variant="outline"
      size="sm"
      className="flex items-center space-x-2"
    >
      <MessageCircle className="w-4 h-4" />
      <span>Enviar mensaje</span>
    </Button>
  );
};

export default StartChatButton;
