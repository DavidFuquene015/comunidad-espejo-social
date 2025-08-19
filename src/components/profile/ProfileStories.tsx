import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Play, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useStories } from '@/hooks/useStories';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProfileStoriesProps {
  profile: any;
}

const ProfileStories = ({ profile }: ProfileStoriesProps) => {
  const { user } = useAuth();
  const { stories, uploadStory, deleteStory } = useStories();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const userStories = stories.filter(story => story.user_id === profile?.id);
  const friendsStories = stories.filter(story => story.user_id !== profile?.id);

  const handleAddStory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    await uploadStory(file);
    setUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-glass-card rounded-2xl p-6 border-white/20 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">Historias</h3>
      
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {/* Add Story Button - Only for current user */}
        {user?.id === profile?.id && (
          <div className="flex-shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="relative w-16 h-16 rounded-full border-2 border-dashed border-white/30 hover:border-white/50 transition-colors flex items-center justify-center group"
            >
              <Plus className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
            </button>
            <p className="text-xs text-white/70 text-center mt-2">Agregar</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleAddStory}
              className="hidden"
            />
          </div>
        )}

        {/* User's Own Stories */}
        {userStories.length > 0 && (
          <div className="flex-shrink-0">
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative cursor-pointer">
                  <Avatar className="w-16 h-16 border-2 border-primary">
                    <AvatarImage 
                      src={profile?.avatar_url} 
                      alt={profile?.full_name || 'Usuario'} 
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {userStories[0]?.media_type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <div className="space-y-4">
                  {userStories.map((story) => (
                    <div key={story.id} className="relative">
                      {story.media_type === 'image' ? (
                        <img 
                          src={story.media_url} 
                          alt="Historia" 
                          className="w-full rounded-lg"
                        />
                      ) : (
                        <video 
                          src={story.media_url} 
                          controls 
                          className="w-full rounded-lg"
                        />
                      )}
                      {user?.id === story.user_id && (
                        <div className="absolute top-2 right-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteStory(story.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      {story.caption && (
                        <p className="text-sm text-muted-foreground mt-2">{story.caption}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(story.created_at), { addSuffix: true, locale: es })}
                      </p>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <p className="text-xs text-white text-center mt-2 truncate max-w-[64px]">
              {user?.id === profile?.id ? 'Tu historia' : profile?.full_name?.split(' ')[0]}
            </p>
          </div>
        )}

        {/* Friends' Stories */}
        {friendsStories.map((story) => (
          <div key={story.id} className="flex-shrink-0">
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative cursor-pointer">
                  <Avatar className="w-16 h-16 border-2 border-blue-500">
                    <AvatarImage 
                      src={story.profiles?.avatar_url} 
                      alt={story.profiles?.full_name || 'Usuario'} 
                    />
                    <AvatarFallback className="bg-blue-500/20 text-white">
                      {story.profiles?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {story.media_type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={story.profiles?.avatar_url} />
                      <AvatarFallback>{story.profiles?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{story.profiles?.full_name || 'Usuario'}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(story.created_at), { addSuffix: true, locale: es })}
                      </p>
                    </div>
                  </div>
                  {story.media_type === 'image' ? (
                    <img 
                      src={story.media_url} 
                      alt="Historia" 
                      className="w-full rounded-lg"
                    />
                  ) : (
                    <video 
                      src={story.media_url} 
                      controls 
                      className="w-full rounded-lg"
                    />
                  )}
                  {story.caption && (
                    <p className="text-sm">{story.caption}</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <p className="text-xs text-white/70 text-center mt-2 truncate max-w-[64px]">
              {story.profiles?.full_name?.split(' ')[0] || 'Usuario'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileStories;