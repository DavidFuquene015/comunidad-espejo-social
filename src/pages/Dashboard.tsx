
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import MainNavigation from '@/components/navigation/MainNavigation';
import Feed from '@/components/feed/Feed';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-social-gradient transition-all duration-300">
      <MainNavigation />
      
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
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
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header de bienvenida */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              ¡Bienvenido a FLORTE!
            </h1>
            <p className="text-lg text-muted-foreground">
              Conecta, comparte y haz crecer tu red profesional
            </p>
          </div>

          {/* Feed principal */}
          <Feed />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
