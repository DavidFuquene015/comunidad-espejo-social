
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePrivateChats } from '@/hooks/usePrivateChats';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  User, 
  Users, 
  UserPlus,
  MessageCircle,
  BookOpen,
  LogOut,
  Menu,
  X,
  Bot
} from 'lucide-react';

const MainNavigation = () => {
  const { user, signOut } = useAuth();
  const { chats } = usePrivateChats();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navigationItems = [
    { path: '/dashboard', icon: Home, label: 'Inicio' },
    { path: '/profile', icon: User, label: 'Perfil' },
    { path: '/groups', icon: Users, label: 'Grupos' },
    { path: '/friends', icon: UserPlus, label: 'Amigos' },
    { 
      path: '/chats', 
      icon: MessageCircle, 
      label: 'Chats Privados'
    },
    { path: '/ai-agent', icon: Bot, label: 'Agente IA' },
    { path: '/library', icon: BookOpen, label: 'Biblioteca' },
  ];

  return (
    <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-8 h-8">
              <img
                src="/lovable-uploads/744db0f4-e151-46c4-b80b-90e4a4b16b60.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-white">FLORTE</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    onClick={() => navigate(item.path)}
                    className={`text-white hover:bg-white/10 hover:text-white px-3 py-2 text-sm font-medium transition-all ${
                      isActive ? 'bg-white/20 text-white' : 'text-white/80'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            <Avatar 
              className="w-8 h-8 border-2 border-white/20 cursor-pointer hover:border-white/40 transition-colors"
              onClick={() => navigate('/profile')}
            >
              <AvatarImage 
                src={profile?.avatar_url || user?.user_metadata?.avatar_url} 
                alt={user?.user_metadata?.full_name || 'Usuario'} 
              />
              <AvatarFallback className="bg-purple-500/20 text-white">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="text-white hover:bg-white/10 hover:text-white px-3 py-2 text-sm font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:bg-white/10 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <div key={item.path}>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`text-white hover:bg-white/10 hover:text-white justify-start w-full ${
                        isActive ? 'bg-white/20 text-white' : 'text-white/80'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </div>
                );
              })}
              
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-white hover:bg-white/10 hover:text-white justify-start"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default MainNavigation;
