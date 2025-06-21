
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePrivateChats } from '@/hooks/usePrivateChats';
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
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const MainNavigation = () => {
  const { user, signOut } = useAuth();
  const { chats } = usePrivateChats();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Calcular total de mensajes no leídos
  const totalUnreadMessages = chats.reduce((total, chat) => {
    return total + (chat.unread_count || 0);
  }, 0);

  const navigationItems = [
    { path: '/dashboard', icon: Home, label: 'Inicio' },
    { path: '/profile', icon: User, label: 'Perfil' },
    { path: '/groups', icon: Users, label: 'Grupos' },
    { path: '/friends', icon: UserPlus, label: 'Amigos' },
    { 
      path: '/chats', 
      icon: MessageCircle, 
      label: 'Chats Privados',
      badge: totalUnreadMessages > 0 ? totalUnreadMessages : null
    },
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
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <div key={item.path} className="relative">
                  <Button
                    variant="ghost"
                    onClick={() => navigate(item.path)}
                    className={`text-white hover:bg-white/10 hover:text-white ${
                      isActive ? 'bg-white/20 text-white' : 'text-white/80'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold min-w-[20px] rounded-full"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </div>
              );
            })}

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Avatar 
                className="w-8 h-8 border-2 border-white/20 cursor-pointer"
                onClick={() => navigate('/profile')}
              >
                <AvatarImage 
                  src={user?.user_metadata?.avatar_url} 
                  alt={user?.user_metadata?.full_name || 'Usuario'} 
                />
                <AvatarFallback className="bg-purple-500/20 text-white">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
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
                  <div key={item.path} className="relative">
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
                    {item.badge && (
                      <Badge 
                        variant="destructive" 
                        className="absolute top-2 right-4 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold min-w-[20px] rounded-full"
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </Badge>
                    )}
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
