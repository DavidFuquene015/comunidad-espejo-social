
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import InfinityLogo from '@/components/InfinityLogo';
import LoginForm from '@/components/LoginForm';
import Dashboard from './Dashboard';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Geometric background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 border border-white/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white/5 rounded-full animate-spin-slow"></div>
        
        {/* Geometric shapes */}
        <div className="absolute top-20 right-20 w-16 h-16 border border-white/20 rotate-45 animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 border border-white/20 rotate-12 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-white/10 rounded-full animate-ping"></div>
      </div>

      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-center max-w-6xl gap-16 relative z-10">
        {/* Logo Section - Left Side */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-fade-in">
            <InfinityLogo />
          </div>
        </div>

        {/* Login Form Section - Right Side */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
