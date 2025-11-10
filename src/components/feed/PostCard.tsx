
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Heart, MessageCircle, Share, Play, Pause, Trash2, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Post } from '@/hooks/usePosts';

interface PostCardProps {
  post: Post;
  onToggleReaction: (postId: string, emoji: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onDeletePost: (postId: string) => void;
  onDeleteComment: (commentId: string) => void;
  currentUserId?: string;
}

const PostCard = ({ post, onToggleReaction, onAddComment, onDeletePost, onDeleteComment, currentUserId }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const handleAddComment = () => {
    if (commentText.trim()) {
      onAddComment(post.id, commentText);
      setCommentText('');
    }
  };

  const handleReaction = (emoji: string) => {
    onToggleReaction(post.id, emoji);
  };

  const userHasReacted = (emoji: string) => {
    return post.reactions.some(r => r.user_id === currentUserId && r.emoji === emoji);
  };

  const getReactionCount = (emoji: string) => {
    return post.reactions.filter(r => r.emoji === emoji).length;
  };

  const renderMedia = () => {
    if (!post.media_url) return null;

    switch (post.media_type) {
      case 'image':
        return (
          <img 
            src={post.media_url} 
            alt="Post media" 
            className="w-full max-h-96 object-cover rounded-lg"
          />
        );
      case 'video':
        return (
          <video 
            src={post.media_url} 
            controls 
            className="w-full max-h-96 rounded-lg"
          />
        );
      case 'audio':
        return (
          <div className="flex items-center space-x-3 p-4 bg-accent/50 rounded-lg">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              size="icon"
              variant="ghost"
              className="text-primary"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <audio 
              src={post.media_url} 
              controls 
              className="flex-1"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage 
                src={post.profiles?.avatar_url || ''} 
                alt={post.profiles?.full_name || 'Usuario'} 
              />
              <AvatarFallback className="bg-primary/10">
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">
                {post.profiles?.full_name || 'Usuario'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { 
                  addSuffix: true, 
                  locale: es 
                })}
              </p>
            </div>
          </div>
          
          {/* Delete Post Button */}
          {currentUserId === post.user_id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => onDeletePost(post.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-6 pb-4">
          <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
        </div>
      )}

      {/* Media */}
      {renderMedia() && (
        <div className="px-6 pb-4">
          {renderMedia()}
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-3 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Reactions */}
            <div className="flex items-center space-x-2">
              {['❤️', '👍', '😂', '😮', '😢', '😡'].map((emoji) => {
                const count = getReactionCount(emoji);
                const hasReacted = userHasReacted(emoji);
                
                return (
                  <Button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    variant="ghost"
                    size="sm"
                    className={`text-sm ${hasReacted ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
                  >
                    {emoji} {count > 0 && count}
                  </Button>
                );
              })}
            </div>
            
            {/* Comments */}
            <Button
              onClick={() => setShowComments(!showComments)}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {post._count?.comments || 0}
            </Button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-6 pb-6 border-t border-border pt-4">
          {/* Add Comment */}
          <div className="flex space-x-3 mb-4">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/10">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex space-x-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button onClick={handleAddComment} size="sm">
                Enviar
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3 group">
                <Avatar className="w-8 h-8">
                  <AvatarImage 
                    src={comment.profiles?.avatar_url || ''} 
                    alt={comment.profiles?.full_name || 'Usuario'} 
                  />
                  <AvatarFallback className="bg-primary/10">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-accent/50 rounded-lg p-3 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-foreground">
                          {comment.profiles?.full_name || 'Usuario'}
                        </h4>
                        <p className="text-sm text-foreground mt-1">{comment.content}</p>
                      </div>
                      {currentUserId === comment.user_id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => onDeleteComment(comment.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-3">
                    {formatDistanceToNow(new Date(comment.created_at), { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
