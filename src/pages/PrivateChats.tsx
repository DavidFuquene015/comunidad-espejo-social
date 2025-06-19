
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import MainNavigation from '@/components/navigation/MainNavigation';
import PrivateChatList from '@/components/chat/PrivateChatList';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

const PrivateChats = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) {
    return (
      <div className="min-h-screen bg-social-gradient flex items-center justify-center">
        <div className="text-white">Debes iniciar sesión para ver tus chats</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-social-gradient">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-border/50 h-[600px]">
            <div className="p-6 border-b border-border">
              <h1 className="text-2xl font-bold text-foreground">Chats Privados</h1>
              <p className="text-muted-foreground mt-2">
                Conversa con tus amigos de forma privada
              </p>
            </div>
            
            <PrivateChatList />
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

export default PrivateChats;
