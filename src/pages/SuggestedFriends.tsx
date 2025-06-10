
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import MainNavigation from '@/components/navigation/MainNavigation';
import { Users, UserPlus, X, Check, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface SuggestedUser {
  id: string;
  full_name: string;
  bio: string;
  avatar_url: string;
}

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender_profile: {
    full_name: string;
    avatar_url: string;
    bio: string;
  };
}

const SuggestedFriends = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'requests'>('suggestions');

  useEffect(() => {
    if (user) {
      fetchSuggestedUsers();
      fetchFriendRequests();
    }
  }, [user]);

  const fetchSuggestedUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_suggested_users', {
        user_id: user?.id
      });

      if (error) throw error;
      setSuggestedUsers(data || []);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las sugerencias de amigos.",
        variant: "destructive",
      });
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          sender_profile:profiles!friend_requests_sender_id_fkey(
            full_name,
            avatar_url,
            bio
          )
        `)
        .eq('receiver_id', user?.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFriendRequests(data || []);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user?.id,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "¡Solicitud enviada!",
        description: "Tu solicitud de amistad ha sido enviada.",
      });

      // Actualizar la lista de sugerencias
      fetchSuggestedUsers();
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud de amistad.",
        variant: "destructive",
      });
    }
  };

  const handleFriendRequest = async (requestId: string, action: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ 
          status: action,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: action === 'accepted' ? "¡Solicitud aceptada!" : "Solicitud rechazada",
        description: action === 'accepted' 
          ? "Has ganado un nuevo amigo." 
          : "La solicitud ha sido rechazada.",
      });

      // Actualizar las listas
      fetchFriendRequests();
      fetchSuggestedUsers();
    } catch (error) {
      console.error('Error handling friend request:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud.",
        variant: "destructive",
      });
    }
  };

  const skipSuggestion = (userId: string) => {
    setSuggestedUsers(prev => prev.filter(user => user.id !== userId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-social-gradient">
        <MainNavigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-white text-xl">Cargando sugerencias...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-social-gradient">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Conectar con personas</h1>
            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'suggestions' ? 'default' : 'outline'}
                onClick={() => setActiveTab('suggestions')}
                className={activeTab === 'suggestions' 
                  ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                  : 'text-white border-white/20 hover:bg-white/10'
                }
              >
                <Users className="w-4 h-4 mr-2" />
                Sugerencias
              </Button>
              <Button
                variant={activeTab === 'requests' ? 'default' : 'outline'}
                onClick={() => setActiveTab('requests')}
                className={activeTab === 'requests' 
                  ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                  : 'text-white border-white/20 hover:bg-white/10'
                }
              >
                <Bell className="w-4 h-4 mr-2" />
                Solicitudes
                {friendRequests.length > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white">
                    {friendRequests.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {activeTab === 'suggestions' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                Personas que podrían interesarte
              </h2>
              
              {suggestedUsers.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
                  <Users className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    No hay más sugerencias disponibles
                  </h3>
                  <p className="text-white/70">
                    ¡Ya has conectado con muchas personas! Vuelve más tarde para ver nuevas sugerencias.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suggestedUsers.map((suggestedUser) => (
                    <div key={suggestedUser.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <div className="text-center mb-4">
                        <Avatar className="w-20 h-20 mx-auto mb-4 border-2 border-white/20">
                          <AvatarImage src={suggestedUser.avatar_url} alt={suggestedUser.full_name} />
                          <AvatarFallback className="bg-purple-500/20 text-white text-lg">
                            <Users className="w-8 h-8" />
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {suggestedUser.full_name || 'Usuario sin nombre'}
                        </h3>
                        <p className="text-white/70 text-sm line-clamp-3">
                          {suggestedUser.bio || 'Sin descripción disponible'}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => sendFriendRequest(suggestedUser.id)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Enviar Solicitud
                        </Button>
                        <Button
                          onClick={() => skipSuggestion(suggestedUser.id)}
                          variant="outline"
                          className="text-white border-white/20 hover:bg-white/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                Solicitudes de amistad
              </h2>
              
              {friendRequests.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
                  <Bell className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    No tienes solicitudes pendientes
                  </h3>
                  <p className="text-white/70">
                    Las nuevas solicitudes de amistad aparecerán aquí.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {friendRequests.map((request) => (
                    <div key={request.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-16 h-16 border-2 border-white/20">
                          <AvatarImage src={request.sender_profile.avatar_url} alt={request.sender_profile.full_name} />
                          <AvatarFallback className="bg-purple-500/20 text-white">
                            <Users className="w-6 h-6" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">
                            {request.sender_profile.full_name || 'Usuario sin nombre'}
                          </h3>
                          <p className="text-white/70 text-sm mb-2">
                            {request.sender_profile.bio || 'Sin descripción disponible'}
                          </p>
                          <p className="text-white/60 text-xs">
                            Solicitud enviada el {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleFriendRequest(request.id, 'accepted')}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Aceptar
                          </Button>
                          <Button
                            onClick={() => handleFriendRequest(request.id, 'rejected')}
                            size="sm"
                            variant="outline"
                            className="text-white border-white/20 hover:bg-red-500/20"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuggestedFriends;
