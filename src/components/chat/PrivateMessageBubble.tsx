
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Download } from 'lucide-react';
import { PrivateMessage } from '@/hooks/usePrivateChats';

interface PrivateMessageBubbleProps {
  message: PrivateMessage;
  isOwn: boolean;
}

const PrivateMessageBubble = ({ message, isOwn }: PrivateMessageBubbleProps) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMedia = () => {
    if (!message.media_url) return null;

    switch (message.media_type) {
      case 'image':
        return (
          <img
            src={message.media_url}
            alt="Imagen"
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
            onClick={() => window.open(message.media_url!, '_blank')}
          />
        );
      case 'video':
        return (
          <video controls className="max-w-xs rounded-lg">
            <source src={message.media_url} type="video/mp4" />
            Tu navegador no soporta video.
          </video>
        );
      case 'audio':
        return (
          <audio controls className="max-w-xs">
            <source src={message.media_url} type="audio/mpeg" />
            Tu navegador no soporta audio.
          </audio>
        );
      default:
        return (
          <div className="flex items-center space-x-2 bg-muted rounded-lg p-2 max-w-xs">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(message.media_url!, '_blank')}
              className="h-8 w-8"
            >
              <Download className="w-4 h-4" />
            </Button>
            <span className="text-sm truncate">
              {message.content || 'Archivo adjunto'}
            </span>
          </div>
        );
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} space-x-3 mb-4`}>
      {!isOwn && (
        <Avatar className="w-8 h-8">
          <AvatarImage 
            src={message.sender?.avatar_url || ''} 
            alt={message.sender?.full_name || 'Usuario'} 
          />
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'ml-12' : 'mr-12'}`}>
        {!isOwn && (
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-foreground">
              {message.sender?.full_name || 'Usuario'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.created_at)}
            </span>
          </div>
        )}

        <div
          className={`rounded-lg p-3 ${
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          {message.media_url ? (
            <div className="space-y-2">
              {renderMedia()}
              {message.content && (
                <p className="text-sm">{message.content}</p>
              )}
            </div>
          ) : (
            <p className="text-sm">{message.content}</p>
          )}
        </div>

        {isOwn && (
          <div className="text-right mt-1">
            <span className="text-xs text-muted-foreground">
              {formatTime(message.created_at)}
            </span>
          </div>
        )}
      </div>

      {isOwn && (
        <Avatar className="w-8 h-8">
          <AvatarImage 
            src={message.sender?.avatar_url || ''} 
            alt="Tú" 
          />
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default PrivateMessageBubble;
