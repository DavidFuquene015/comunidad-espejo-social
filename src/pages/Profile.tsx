
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Edit, Plus, Trophy, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MainNavigation from '@/components/navigation/MainNavigation';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfileProjects from '@/components/profile/ProfileProjects';
import ProfileFriends from '@/components/profile/ProfileFriends';
import ProfileStories from '@/components/profile/ProfileStories';
import ProfilePhotos from '@/components/profile/ProfilePhotos';
import EditProfileModal from '@/components/profile/EditProfileModal';
import AddProjectModal from '@/components/profile/AddProjectModal';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchProjects();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
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
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleProfileUpdate = () => {
    fetchProfile();
    setIsEditModalOpen(false);
  };

  const handleProjectAdded = () => {
    fetchProjects();
    setIsAddProjectModalOpen(false);
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

  return (
    <div className="min-h-screen bg-social-gradient">
      <MainNavigation />
      
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header Card */}
        <div className="bg-glass-card rounded-2xl overflow-hidden">
          <ProfileHeader profile={profile} user={user} />
          
          {/* Action Buttons */}
          <div className="px-6 pb-6 flex justify-end space-x-3">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Compartir Perfil
            </Button>
          </div>
        </div>

        {/* Stories Section */}
        <ProfileStories profile={profile} />

        {/* Profile Content */}
        <ProfileInfo profile={profile} />

        {/* Photos Section */}
        <ProfilePhotos profile={profile} />

        {/* Projects Section */}
        <div className="bg-glass-card rounded-2xl p-6 border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
              Mis Proyectos
            </h2>
            <Button
              onClick={() => setIsAddProjectModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proyecto
            </Button>
          </div>

          <ProfileProjects projects={projects} onProjectUpdate={fetchProjects} />
        </div>

        {/* Friends Section */}
        <div className="bg-glass-card rounded-2xl p-6 border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-400" />
            Red de Contactos
          </h2>
          <ProfileFriends />
        </div>

        {/* Modals */}
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
          onProfileUpdate={handleProfileUpdate}
        />

        <AddProjectModal
          isOpen={isAddProjectModalOpen}
          onClose={() => setIsAddProjectModalOpen(false)}
          onProjectAdded={handleProjectAdded}
        />
      </div>
    </div>
  );
};

export default Profile;
