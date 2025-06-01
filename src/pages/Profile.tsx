
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Edit, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MainNavigation from '@/components/navigation/MainNavigation';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfileProjects from '@/components/profile/ProfileProjects';
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
      
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8">
          <div className="flex justify-between items-start mb-6">
            <ProfileHeader profile={profile} user={user} />
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10 bg-transparent"
            >
              <Edit className="w-4 h-4 mr-2" />
              <span className="text-white">Editar Perfil</span>
            </Button>
          </div>

          <ProfileInfo profile={profile} />
        </div>

        {/* Projects Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Mis Proyectos</h2>
            <Button
              onClick={() => setIsAddProjectModalOpen(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="text-white">Agregar Proyecto</span>
            </Button>
          </div>

          <ProfileProjects projects={projects} onProjectUpdate={fetchProjects} />
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
