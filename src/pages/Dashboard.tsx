
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import MainNavigation from '@/components/navigation/MainNavigation';
import { User, Plus, Heart, MessageCircle, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Dashboard = () => {
  const { user } = useAuth();
  const [postContent, setPostContent] = useState('');

  const handlePublishPost = () => {
    if (postContent.trim()) {
      // TODO: Implement actual post creation functionality
      console.log('Publishing post:', postContent);
      setPostContent('');
    }
  };

  return (
    <div className="min-h-screen bg-social-gradient">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Crear nuevo post */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12 border-2 border-white/20">
                <AvatarImage 
                  src={user?.user_metadata?.avatar_url} 
                  alt={user?.user_metadata?.full_name || 'Usuario'} 
                />
                <AvatarFallback className="bg-purple-500/20 text-white">
                  <User className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="¿Qué estás pensando?"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <Plus className="w-4 h-4 mr-1" />
                  Imagen
                </Button>
              </div>
              <Button 
                onClick={handlePublishPost}
                disabled={!postContent.trim()}
                className="bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50"
              >
                Publicar
              </Button>
            </div>
          </div>

          {/* Mensaje de bienvenida para nuevos usuarios */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">¡Bienvenido a FLORTE!</h2>
            <p className="text-white/80 mb-6">
              Conecta con profesionales, comparte tus proyectos y haz crecer tu red profesional
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                className="text-white border-white/20 hover:bg-white/10"
                onClick={() => window.location.href = '/profile'}
              >
                Completar Perfil
              </Button>
              <Button 
                className="bg-purple-500 hover:bg-purple-600 text-white"
                onClick={() => window.location.href = '/groups'}
              >
                Explorar Grupos
              </Button>
            </div>
          </div>

          {/* Área para posts futuros */}
          <div className="mt-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
              <Heart className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                ¡Sé el primero en compartir!
              </h3>
              <p className="text-white/70">
                Comparte tu primer post y comienza a conectar con otros profesionales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
