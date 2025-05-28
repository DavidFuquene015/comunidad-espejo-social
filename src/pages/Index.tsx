
import React from 'react';
import InfinityLogo from '@/components/InfinityLogo';
import LoginForm from '@/components/LoginForm';

const Index = () => {
  return (
    <div className="min-h-screen bg-social-gradient flex items-center justify-center p-4">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between max-w-6xl gap-12">
        {/* Logo Section */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          <InfinityLogo />
          <div className="text-center max-w-md">
            <p className="text-white/70 text-lg leading-relaxed">
              Conecta con el mundo infinito de posibilidades. 
              Únete a nuestra comunidad y descubre experiencias únicas.
            </p>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-right mb-8">
              <h2 className="text-white text-xl font-light">
                Registro
              </h2>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-10 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl"></div>
      <div className="fixed bottom-10 right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-xl"></div>
      <div className="fixed top-1/2 left-1/4 w-16 h-16 bg-pink-500/20 rounded-full blur-lg"></div>
    </div>
  );
};

export default Index;
