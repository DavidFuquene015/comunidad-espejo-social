
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import MainNavigation from '@/components/navigation/MainNavigation';
import Feed from '@/components/feed/Feed';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-social-gradient flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-social-gradient transition-all duration-300">
      <MainNavigation />
      
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

export default Dashboard;
