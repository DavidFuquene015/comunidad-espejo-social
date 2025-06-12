
import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Image, Video, Music, X } from 'lucide-react';

interface CreatePostProps {
  onCreatePost: (content: string, mediaFile?: File) => Promise<void>;
}

const CreatePost = ({ onCreatePost }: CreatePostProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setMediaPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setMediaPreview(file.name);
      }
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !mediaFile) return;
    
    setLoading(true);
    try {
      await onCreatePost(content, mediaFile || undefined);
      setContent('');
      setMediaFile(null);
      setMediaPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setLoading(false);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderMediaPreview = () => {
    if (!mediaFile || !mediaPreview) return null;

    if (mediaFile.type.startsWith('image/')) {
      return (
        <div className="relative">
          <img 
            src={mediaPreview} 
            alt="Preview" 
            className="max-h-64 rounded-lg object-cover w-full"
          />
          <Button
            onClick={removeMedia}
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
        <div className="flex items-center space-x-2">
          {mediaFile.type.startsWith('video/') && <Video className="w-5 h-5" />}
          {mediaFile.type.startsWith('audio/') && <Music className="w-5 h-5" />}
          <span className="text-sm truncate">{mediaFile.name}</span>
        </div>
        <Button onClick={removeMedia} size="icon" variant="ghost">
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex space-x-4">
        <Avatar className="w-12 h-12">
          <AvatarImage 
            src={user?.user_metadata?.avatar_url} 
            alt={user?.user_metadata?.full_name || 'Usuario'} 
          />
          <AvatarFallback className="bg-primary/10">
            <User className="w-6 h-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="¿Qué estás pensando?"
            className="min-h-[100px] border-0 resize-none focus:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground"
          />
          
          {renderMediaPreview()}
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Image className="w-4 h-4 mr-2" />
                Multimedia
              </Button>
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={(!content.trim() && !mediaFile) || loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
