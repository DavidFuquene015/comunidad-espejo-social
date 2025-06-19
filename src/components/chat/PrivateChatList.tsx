
import React from 'react';
import { usePrivateChats } from '@/hooks/usePrivateChats';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivateChatList = () => {
  const { chats, loading } = usePrivateChats();
  const navigate = useNavigate();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Cargando chats...</div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No tienes chats privados aún</p>
        <p className="text-sm text-muted-foreground mt-2">
          Ve a tu perfil y inicia un chat con tus amigos
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {chats.map((chat) => (
          <Button
            key={chat.id}
            variant="ghost"
            className="w-full justify-start h-auto p-3 hover:bg-accent"
            onClick={() => navigate(`/chat/${chat.id}`)}
          >
            <div className="flex items-center space-x-3 w-full">
              <Avatar className="w-10 h-10">
                <AvatarImage 
                  src={chat.other_user?.avatar_url || ''} 
                  alt={chat.other_user?.full_name || 'Usuario'} 
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    {chat.other_user?.full_name || 'Usuario'}
                  </span>
                  {chat.last_message && (
                    <span className="text-xs text-muted-foreground">
                      {formatTime(chat.last_message.created_at)}
                    </span>
                  )}
                </div>
                {chat.last_message && (
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.last_message.content || 
                     (chat.last_message.media_type ? 
                      `📎 ${chat.last_message.media_type}` : 
                      'Mensaje multimedia')}
                  </p>
                )}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};

export default PrivateChatList;
