
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
}

const MessageList = ({ messages, currentUserId }: MessageListProps) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMedia = (message: Message) => {
    if (!message.media_url) return null;

    switch (message.media_type) {
      case 'image':
        return (
          <img
            src={message.media_url}
            alt={message.content}
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
            onClick={() => window.open(message.media_url!, '_blank')}
          />
        );
      case 'audio':
        return (
          <audio controls className="max-w-xs">
            <source src={message.media_url} type="audio/mpeg" />
            Tu navegador no soporta audio.
          </audio>
        );
      case 'video':
        return (
          <video controls className="max-w-xs rounded-lg">
            <source src={message.media_url} type="video/mp4" />
            Tu navegador no soporta video.
          </video>
        );
      default:
        return (
          <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-2 max-w-xs">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(message.media_url!, '_blank')}
              className="text-white/70 hover:bg-white/10"
            >
              <Download className="w-4 h-4" />
            </Button>
            <span className="text-white/80 text-sm truncate">{message.content}</span>
          </div>
        );
    }
  };

  return (
    <>
      {messages.map((message) => {
        const isOwn = message.user_id === currentUserId;
        
        return (
          <div
            key={message.id}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} space-x-3`}
          >
            {!isOwn && (
              <Avatar className="w-8 h-8">
                <AvatarImage 
                  src={message.profiles?.avatar_url} 
                  alt={message.profiles?.full_name || 'Usuario'} 
                />
                <AvatarFallback className="bg-purple-500 text-white">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            )}

            <div className={`max-w-xs lg:max-w-md ${isOwn ? 'ml-12' : 'mr-12'}`}>
              {!isOwn && (
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-white/90 text-sm font-medium">
                    {message.profiles?.full_name || 'Usuario'}
                  </span>
                  <span className="text-white/50 text-xs">
                    {formatTime(message.created_at)}
                  </span>
                </div>
              )}

              <div
                className={`rounded-lg p-3 ${
                  isOwn
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-white'
                }`}
              >
                {message.media_url ? (
                  <div className="space-y-2">
                    {renderMedia(message)}
                    {message.content && !message.media_url.includes(message.content) && (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
              </div>

              {isOwn && (
                <div className="text-right mt-1">
                  <span className="text-white/50 text-xs">
                    {formatTime(message.created_at)}
                  </span>
                </div>
              )}
            </div>

            {isOwn && (
              <Avatar className="w-8 h-8">
                <AvatarImage 
                  src={message.profiles?.avatar_url} 
                  alt={message.profiles?.full_name || 'Tú'} 
                />
                <AvatarFallback className="bg-purple-500 text-white">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        );
      })}
    </>
  );
};

export default MessageList;
