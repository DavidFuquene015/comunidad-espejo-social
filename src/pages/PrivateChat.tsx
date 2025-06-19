
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import MainNavigation from '@/components/navigation/MainNavigation';
import PrivateChatWindow from '@/components/chat/PrivateChatWindow';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

const PrivateChat = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) {
    return (
      <div className="min-h-screen bg-social-gradient flex items-center justify-center">
        <div className="text-white">Debes iniciar sesión para acceder al chat</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-social-gradient">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-border/50 h-[600px] flex flex-col">
            <PrivateChatWindow />
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={toggleTheme}
          variant="outline"
          size="icon"
          className="bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default PrivateChat;
