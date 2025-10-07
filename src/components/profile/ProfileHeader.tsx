
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, GraduationCap, MapPin, Calendar, Verified } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileHeaderProps {
  profile: any;
  user: any;
}

const ProfileHeader = ({ profile, user }: ProfileHeaderProps) => {
  const [friendsCount, setFriendsCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchFriendsCount();
      fetchProjectsCount();
    }
  }, [user]);

  const fetchFriendsCount = async () => {
    try {
      const { data, error } = await supabase.functions.invoke(`profiles-api/friends-count/${user?.id}`, {
        method: 'GET',
      });

      if (error) throw error;
      setFriendsCount(data?.count || 0);
    } catch (error) {
      console.error('Error fetching friends count:', error);
    }
  };

  const fetchProjectsCount = async () => {
    try {
      const { data, error } = await supabase.functions.invoke(`profiles-api/projects-count/${user?.id}`, {
        method: 'GET',
      });

      if (error) throw error;
      setProjectsCount(data?.count || 0);
    } catch (error) {
      console.error('Error fetching projects count:', error);
    }
  };

  return (
    <div className="relative">
      {/* Cover Photo Area */}
      <div className="h-48 bg-profile-header rounded-t-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
      
      {/* Profile Content */}
      <div className="relative px-6 pb-6 -mt-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white p-1 shadow-2xl">
                <Avatar className="w-full h-full">
                  <AvatarImage 
                    src={profile?.avatar_url} 
                    alt={profile?.full_name || 'Usuario'} 
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                    <User className="w-16 h-16" />
                  </AvatarFallback>
                </Avatar>
              </div>
              {/* Status Indicator */}
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <h1 className="text-3xl font-bold text-white">
                  {profile?.full_name || 'Usuario'}
                </h1>
                <Verified className="w-6 h-6 text-blue-400" />
              </div>
              
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {profile?.occupation && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    {profile.occupation}
                  </Badge>
                )}
                {profile?.location && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <MapPin className="w-3 h-3 mr-1" />
                    {profile.location}
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Calendar className="w-3 h-3 mr-1" />
                  Aprendiz SENA
                </Badge>
              </div>
              
              <p className="text-white/80 text-sm">{user?.email}</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex space-x-6 mt-4 md:mt-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{projectsCount}</div>
              <div className="text-xs text-white/70">Proyectos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{friendsCount}</div>
              <div className="text-xs text-white/70">Amigos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">12</div>
              <div className="text-xs text-white/70">Cursos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
