
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "¡Hasta luego!",
        description: "Has cerrado sesión exitosamente.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-social-gradient p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">¡Bienvenido a FLORTE!</h1>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="text-white border-white/20 hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {user?.user_metadata?.full_name || 'Usuario'}
              </h2>
              <p className="text-white/70">{user?.email}</p>
            </div>
          </div>

          <div className="text-white/80">
            <p className="text-lg mb-4">
              ¡Tu cuenta ha sido creada exitosamente! 
            </p>
            <p>
              Esta será tu página de inicio donde podrás conectar con el mundo infinito de posibilidades.
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="fixed top-10 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="fixed bottom-10 right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="fixed top-1/2 left-1/4 w-16 h-16 bg-pink-500/20 rounded-full blur-lg animate-bounce"></div>
      </div>
    </div>
  );
};

export default Dashboard;
