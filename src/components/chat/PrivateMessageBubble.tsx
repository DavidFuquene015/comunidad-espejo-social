
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Download, Check, CheckCheck, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { PrivateMessage } from '@/hooks/usePrivateChats';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

interface PrivateMessageBubbleProps {
  message: PrivateMessage;
  isOwn: boolean;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string, deleteFor: 'me' | 'everyone') => void;
}

const PrivateMessageBubble = ({ message, isOwn, onEdit, onDelete }: PrivateMessageBubbleProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || '');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteType, setDeleteType] = useState<'me' | 'everyone'>('me');

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderReadStatus = () => {
    if (!isOwn) return null;

    if (message.read_at) {
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    } else {
      return <Check className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleDelete = (type: 'me' | 'everyone') => {
    setDeleteType(type);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDelete(message.id, deleteType);
    setShowDeleteDialog(false);
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

  // Don't show deleted messages
  if ((message as any).deleted_for_everyone) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} space-x-3 mb-4`}>
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'ml-12' : 'mr-12'}`}>
          <div className="rounded-lg p-3 bg-muted/50 border border-border">
            <p className="text-sm italic text-muted-foreground">Este mensaje fue eliminado</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} space-x-3 mb-4 group`}>
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

          <div className="flex items-start space-x-2">
            <div
              className={`rounded-lg p-3 ${
                isOwn
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleEdit();
                      } else if (e.key === 'Escape') {
                        setIsEditing(false);
                        setEditContent(message.content || '');
                      }
                    }}
                    className="bg-background text-foreground"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleEdit}>Guardar</Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(message.content || '');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
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
                  {(message as any).edited_at && (
                    <p className="text-xs opacity-70 mt-1">editado</p>
                  )}
                </>
              )}
            </div>

            {!isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isOwn ? "end" : "start"}>
                  {isOwn && !message.media_url && (
                    <>
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar mensaje
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => handleDelete('me')}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar para mí
                  </DropdownMenuItem>
                  {isOwn && (
                    <DropdownMenuItem 
                      onClick={() => handleDelete('everyone')}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar para todos
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isOwn && (
            <div className="flex items-center justify-end space-x-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {formatTime(message.created_at)}
              </span>
              {renderReadStatus()}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar mensaje?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === 'everyone' 
                ? 'Este mensaje será eliminado para todos en el chat. Esta acción no se puede deshacer.'
                : 'Este mensaje será eliminado solo para ti. Los demás participantes aún podrán verlo.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PrivateMessageBubble;
