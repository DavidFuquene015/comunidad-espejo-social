import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileStoriesProps {
  profile: any;
}

const ProfileStories = ({ profile }: ProfileStoriesProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleAddStory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/stories/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Aquí podrías guardar la historia en una tabla de historias
      // Por ahora solo mostramos el toast de éxito
      
      toast({
        title: "Historia agregada",
        description: "Tu historia se subió correctamente.",
      });
    } catch (error) {
      console.error('Error uploading story:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la historia.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-glass-card rounded-2xl p-6 border-white/20 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">Historias</h3>
      
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {/* Add Story Button */}
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

        {/* Current User's Stories */}
        <div className="flex-shrink-0">
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-gradient-primary">
              <AvatarImage 
                src={profile?.avatar_url} 
                alt={profile?.full_name || 'Usuario'} 
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <p className="text-xs text-white text-center mt-2 truncate max-w-[64px]">
            {profile?.full_name?.split(' ')[0] || 'Tú'}
          </p>
        </div>

        {/* Placeholder for other stories */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-shrink-0">
            <Avatar className="w-16 h-16 border-2 border-white/20">
              <AvatarFallback className="bg-gray-600 text-white">
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <p className="text-xs text-white/70 text-center mt-2">Amigo {i}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileStories;