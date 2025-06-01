
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import MainNavigation from '@/components/navigation/MainNavigation';
import { User, Plus, Heart, MessageCircle, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Dashboard = () => {
  const { user } = useAuth();

  // Posts de ejemplo para el feed
  const feedPosts = [
    {
      id: 1,
      author: {
        name: "Ana García",
        avatar: null,
        occupation: "Desarrolladora Frontend"
      },
      content: "¡Acabo de terminar mi nuevo proyecto en React! 🚀 Es increíble lo mucho que he aprendido en este proceso.",
      image: null,
      likes: 24,
      comments: 8,
      timestamp: "hace 2 horas"
    },
    {
      id: 2,
      author: {
        name: "Carlos López",
        avatar: null,
        occupation: "Diseñador UX/UI"
      },
      content: "Compartiendo algunos tips de diseño que me han ayudado mucho últimamente. ¿Cuáles son sus herramientas favoritas?",
      image: null,
      likes: 18,
      comments: 12,
      timestamp: "hace 4 horas"
    }
  ];

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
                <input
                  type="text"
                  placeholder="¿Qué estás pensando?"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                Publicar
              </Button>
            </div>
          </div>

          {/* Feed de posts */}
          <div className="space-y-6">
            {feedPosts.map((post) => (
              <div key={post.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                {/* Header del post */}
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="w-10 h-10 border-2 border-white/20">
                    <AvatarFallback className="bg-purple-500/20 text-white text-sm">
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{post.author.name}</h3>
                    <p className="text-white/70 text-sm">{post.author.occupation}</p>
                  </div>
                  <span className="text-white/60 text-sm">{post.timestamp}</span>
                </div>

                {/* Contenido del post */}
                <p className="text-white/90 mb-4">{post.content}</p>

                {/* Acciones del post */}
                <div className="flex items-center space-x-6 pt-4 border-t border-white/10">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                    <Heart className="w-4 h-4 mr-2" />
                    {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {post.comments}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                    <Share className="w-4 h-4 mr-2" />
                    Compartir
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Mensaje de bienvenida para nuevos usuarios */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mt-8 text-center">
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
