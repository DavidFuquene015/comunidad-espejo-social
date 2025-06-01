
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface ProfileHeaderProps {
  profile: any;
  user: any;
}

const ProfileHeader = ({ profile, user }: ProfileHeaderProps) => {
  return (
    <div className="flex items-center space-x-6">
      <div className="relative">
        <Avatar className="w-24 h-24 border-4 border-white/20">
          <AvatarImage 
            src={profile?.avatar_url} 
            alt={profile?.full_name || 'Usuario'} 
          />
          <AvatarFallback className="bg-purple-500/20 text-white text-2xl">
            <User className="w-12 h-12" />
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          {profile?.full_name || 'Usuario'}
        </h2>
        <p className="text-white/70 text-lg mb-1">{profile?.occupation || 'Sin ocupación especificada'}</p>
        <p className="text-white/60">{profile?.location || 'Ubicación no especificada'}</p>
        <p className="text-white/60 text-sm mt-2">{user?.email}</p>
      </div>
    </div>
  );
};

export default ProfileHeader;
