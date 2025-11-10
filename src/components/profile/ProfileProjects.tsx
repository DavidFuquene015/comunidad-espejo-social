
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileProjectsProps {
  projects: any[];
  onProjectUpdate: () => void;
}

const ProfileProjects = ({ projects, onProjectUpdate }: ProfileProjectsProps) => {
  const { toast } = useToast();

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/profiles-api/projects/${projectId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar proyecto');
      }

      toast({
        title: "Proyecto eliminado",
        description: "El proyecto se eliminó correctamente.",
      });

      onProjectUpdate();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el proyecto.",
        variant: "destructive",
      });
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70 text-lg">No tienes proyectos aún.</p>
        <p className="text-white/50">¡Agrega tu primer proyecto para mostrar tu trabajo!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="bg-white/5 border-white/10 overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-blue-500/20 relative">
            {project.image_url ? (
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-white/50">Sin imagen</p>
              </div>
            )}
          </div>
          
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
            <p className="text-white/70 text-sm mb-4 line-clamp-3">
              {project.description || 'Sin descripción'}
            </p>
            
            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {project.technologies.map((tech: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-purple-500/20 text-purple-200 text-xs rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mb-4">
              {project.project_url && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-white border-white/20 hover:bg-white/10"
                  onClick={() => window.open(project.project_url, '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Ver
                </Button>
              )}
              {project.github_url && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-white border-white/20 hover:bg-white/10"
                  onClick={() => window.open(project.github_url, '_blank')}
                >
                  <Github className="w-3 h-3 mr-1" />
                  Código
                </Button>
              )}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-red-400 hover:bg-red-500/20"
                onClick={() => handleDeleteProject(project.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProfileProjects;
