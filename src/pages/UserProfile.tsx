
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MainNavigation from '@/components/navigation/MainNavigation';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfileProjects from '@/components/profile/ProfileProjects';
import ProfileFriends from '@/components/profile/ProfileFriends';

const UserProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [friendRequestStatus, setFriendRequestStatus] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchProjects();
      checkFriendshipStatus();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const checkFriendshipStatus = async () => {
    if (!user || !userId) return;

    try {
      // Verificar si ya son amigos
      const { data: friendship } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${user.id})`)
        .single();

      if (friendship) {
        setIsFriend(true);
        return;
      }

      // Verificar el estado de solicitud de amistad
      const { data: friendRequest } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .single();

      if (friendRequest) {
        setFriendRequestStatus(friendRequest.status);
      }
    } catch (error) {
      console.error('Error checking friendship status:', error);
    }
  };

  const sendFriendRequest = async () => {
    if (!user || !userId) return;

    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: userId,
          status: 'pending'
        });

      if (error) throw error;

      setFriendRequestStatus('pending');
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de amistad ha sido enviada.",
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud de amistad.",
        variant: "destructive",
      });
    }
  };

  const removeFriend = async () => {
    if (!user || !userId) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${user.id})`);

      if (error) throw error;

      setIsFriend(false);
      toast({
        title: "Amistad eliminada",
        description: "Ya no son amigos.",
      });
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la amistad.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-social-gradient">
        <MainNavigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-white text-xl">Cargando perfil...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-social-gradient">
        <MainNavigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-white text-xl">Perfil no encontrado</div>
        </div>
      </div>
    );
  }

  const renderFriendButton = () => {
    if (!user || userId === user.id) return null;

    if (isFriend) {
      return (
        <Button
          onClick={removeFriend}
          variant="outline"
          className="bg-red-500/20 border-red-400 text-red-300 hover:bg-red-500/30"
        >
          <UserMinus className="w-4 h-4 mr-2" />
          Eliminar Amigo
        </Button>
      );
    }

    if (friendRequestStatus === 'pending') {
      return (
        <Button
          disabled
          variant="outline"
          className="bg-yellow-500/20 border-yellow-400 text-yellow-300"
        >
          Solicitud Pendiente
        </Button>
      );
    }

    return (
      <Button
        onClick={sendFriendRequest}
        className="bg-purple-500 hover:bg-purple-600 text-white"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Agregar Amigo
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-social-gradient">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Back Button */}
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="bg-transparent border-white/20 text-purple-600 hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="flex justify-between items-start mb-6">
            <ProfileHeader profile={profile} user={{ email: profile.id }} />
            {renderFriendButton()}
          </div>

          <ProfileInfo profile={profile} />
        </div>

        {/* Friends Section */}
        <ProfileFriends userId={userId} />

        {/* Projects Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Proyectos</h2>
          <ProfileProjects projects={projects} onProjectUpdate={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
