
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import InfinityLogo from '@/components/InfinityLogo';
import LoginForm from '@/components/LoginForm';
import Dashboard from './Dashboard';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-social-gradient flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return (
    <div 
      className="min-h-screen bg-social-gradient flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('/placeholder.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between max-w-6xl gap-12 relative z-10">
        {/* Logo Section */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          <div className="animate-float">
            <InfinityLogo />
          </div>
          <div className="text-center max-w-md animate-fade-in">
            <p className="text-white/70 text-lg leading-relaxed">
              Conecta con el mundo infinito de posibilidades. 
              Únete a nuestra comunidad y descubre experiencias únicas.
            </p>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Animated Decorative Elements */}
      <div className="fixed top-10 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="fixed bottom-10 right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="fixed top-1/2 left-1/4 w-16 h-16 bg-pink-500/20 rounded-full blur-lg animate-bounce"></div>
      <div className="fixed top-1/3 right-1/3 w-24 h-24 bg-cyan-500/15 rounded-full blur-lg animate-ping"></div>
    </div>
  );
};

export default Index;
