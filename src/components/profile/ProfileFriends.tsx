
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Friend {
  id: string;
  full_name: string;
  avatar_url: string;
  bio: string;
}

interface ProfileFriendsProps {
  userId?: string;
}

const ProfileFriends = ({ userId }: ProfileFriendsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = userId || user?.id;
  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    if (currentUserId) {
      fetchFriends();
    }
  }, [currentUserId]);

  const fetchFriends = async () => {
    try {
      // Obtener las amistades del usuario
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`);

      if (friendshipsError) throw friendshipsError;

      if (!friendships || friendships.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      // Obtener los IDs de los amigos
      const friendIds = friendships.map(friendship => 
        friendship.user1_id === currentUserId ? friendship.user2_id : friendship.user1_id
      );

      // Obtener los perfiles de los amigos
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio')
        .in('id', friendIds);

      if (profilesError) throw profilesError;

      setFriends(profiles || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los amigos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (friendId: string) => {
    navigate(`/profile/${friendId}`);
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <div className="flex items-center space-x-2 mb-6">
          <Users className="w-6 h-6 text-white" />
          <h2 className="text-2xl font-bold text-white">
            {isOwnProfile ? 'Mis Amigos' : 'Amigos'}
          </h2>
        </div>
        <div className="text-white text-center py-8">Cargando amigos...</div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
      <div className="flex items-center space-x-2 mb-6">
        <Users className="w-6 h-6 text-white" />
        <h2 className="text-2xl font-bold text-white">
          {isOwnProfile ? 'Mis Amigos' : 'Amigos'}
        </h2>
        <span className="text-white/60 text-lg">({friends.length})</span>
      </div>

      {friends.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {isOwnProfile ? 'Aún no tienes amigos' : 'Este usuario no tiene amigos públicos'}
          </h3>
          <p className="text-white/60 mb-6">
            {isOwnProfile 
              ? 'Conecta con otras personas y comienza a hacer amigos.'
              : 'Los amigos aparecerán aquí cuando estén disponibles.'
            }
          </p>
          {isOwnProfile && (
            <Button
              onClick={() => navigate('/friends')}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <User className="w-4 h-4 mr-2" />
              Buscar Amigos
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="w-12 h-12 border-2 border-white/20">
                  <AvatarImage 
                    src={friend.avatar_url} 
                    alt={friend.full_name || 'Usuario'} 
                  />
                  <AvatarFallback className="bg-purple-500/20 text-white">
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">
                    {friend.full_name || 'Usuario'}
                  </h3>
                  {friend.bio && (
                    <p className="text-white/60 text-sm truncate">{friend.bio}</p>
                  )}
                </div>
              </div>
              <Button
                onClick={() => handleViewProfile(friend.id)}
                variant="outline"
                size="sm"
                className="w-full bg-transparent border-purple-400 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200"
              >
                Ver Perfil
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileFriends;
