
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivateChats } from '@/hooks/usePrivateChats';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface StartChatButtonProps {
  friendId: string;
  friendName: string;
}

const StartChatButton = ({ friendId, friendName }: StartChatButtonProps) => {
  const navigate = useNavigate();
  const { getOrCreateChat } = usePrivateChats();

  const handleStartChat = async () => {
    const chatId = await getOrCreateChat(friendId);
    if (chatId) {
      navigate(`/chat/${chatId}`);
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
