
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import MainNavigation from '@/components/navigation/MainNavigation';
import { Users, Plus, MessageCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import CreateGroupModal from '@/components/groups/CreateGroupModal';

interface Group {
  id: string;
  name: string;
  description: string;
  background_image_url: string;
  member_count: number;
  is_member: boolean;
  is_owner: boolean;
}

const Groups = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  const fetchGroups = async () => {
    try {
      // First, get all groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*');

      if (groupsError) throw groupsError;

      // For each group, get member count and check user membership
      const processedGroups = await Promise.all(
        (groupsData || []).map(async (group) => {
          // Get member count
          const { count: memberCount, error: countError } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          if (countError) {
            console.error('Error counting members:', countError);
          }

          // Check if current user is a member
          const { data: membershipData, error: membershipError } = await supabase
            .from('group_members')
            .select('role')
            .eq('group_id', group.id)
            .eq('user_id', user?.id)
            .single();

          if (membershipError && membershipError.code !== 'PGRST116') {
            console.error('Error checking membership:', membershipError);
          }

          return {
            id: group.id,
            name: group.name,
            description: group.description || '',
            background_image_url: group.background_image_url || '',
            member_count: memberCount || 0,
            is_member: !!membershipData,
            is_owner: group.owner_id === user?.id
          };
        })
      );

      setGroups(processedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los grupos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user?.id,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "Te has unido al grupo exitosamente.",
      });

      fetchGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: "No se pudo unir al grupo.",
        variant: "destructive",
      });
    }
  };

  const handleEnterGroup = (groupId: string) => {
    navigate(`/groups/${groupId}`);
  };

  const handleGroupCreated = () => {
    setIsCreateModalOpen(false);
    fetchGroups();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-social-gradient">
        <MainNavigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-white text-xl">Cargando grupos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-social-gradient">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Grupos</h1>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Grupo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 relative overflow-hidden">
              {group.background_image_url && (
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  style={{ backgroundImage: `url(${group.background_image_url})` }}
                />
              )}
              
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                    <p className="text-white/70 text-sm">{group.member_count} miembros</p>
                  </div>
                  {group.is_owner && (
                    <Settings className="w-5 h-5 text-white/70" />
                  )}
                </div>
                
                <p className="text-white/80 text-sm mb-4 line-clamp-2">
                  {group.description || 'Sin descripción'}
                </p>
                
                {group.is_member ? (
                  <Button 
                    onClick={() => handleEnterGroup(group.id)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Entrar al Grupo
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleJoinGroup(group.id)}
                    variant="outline" 
                    className="w-full text-white border-white/20 hover:bg-white/10"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Unirse al Grupo
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="mt-12 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <Users className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No hay grupos disponibles</h2>
              <p className="text-white/70 mb-6">
                Sé el primero en crear un grupo y conectar con personas que comparten tus intereses
              </p>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Grupo
              </Button>
            </div>
          </div>
        )}

        <CreateGroupModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onGroupCreated={handleGroupCreated}
        />
      </div>
    </div>
  );
};

export default Groups;
