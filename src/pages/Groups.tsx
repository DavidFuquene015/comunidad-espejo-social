
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import MainNavigation from '@/components/navigation/MainNavigation';
import { Users, Plus, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Groups = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-social-gradient">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Grupos</h1>
          <Button className="bg-purple-500 hover:bg-purple-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Crear Grupo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder for groups */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Desarrolladores</h3>
                <p className="text-white/70 text-sm">124 miembros</p>
              </div>
            </div>
            <p className="text-white/80 text-sm mb-4">
              Grupo para compartir conocimientos sobre desarrollo de software
            </p>
            <Button 
              variant="outline" 
              className="w-full text-white border-white/20 hover:bg-white/10"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Unirse al Grupo
            </Button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Diseñadores UX/UI</h3>
                <p className="text-white/70 text-sm">89 miembros</p>
              </div>
            </div>
            <p className="text-white/80 text-sm mb-4">
              Comunidad de diseñadores para compartir recursos y proyectos
            </p>
            <Button 
              variant="outline" 
              className="w-full text-white border-white/20 hover:bg-white/10"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Unirse al Grupo
            </Button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Emprendedores Tech</h3>
                <p className="text-white/70 text-sm">56 miembros</p>
              </div>
            </div>
            <p className="text-white/80 text-sm mb-4">
              Red de networking para emprendedores del sector tecnológico
            </p>
            <Button 
              variant="outline" 
              className="w-full text-white border-white/20 hover:bg-white/10"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Unirse al Grupo
            </Button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <Users className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">¿No encuentras tu grupo ideal?</h2>
            <p className="text-white/70 mb-6">
              Crea tu propio grupo y conecta con personas que comparten tus intereses
            </p>
            <Button className="bg-purple-500 hover:bg-purple-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Crear Nuevo Grupo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Groups;
