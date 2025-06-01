
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Home, Users, User, LogOut, Bell, Search } from 'lucide-react';

const MainNavigation = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "Error",
          description: "No se pudo cerrar sesión. Inténtalo de nuevo.",
          variant: "destructive",
        });
      } else {
        // Forzar navegación al índice después del logout
        navigate('/', { replace: true });
        toast({
          title: "¡Hasta luego!",
          description: "Has cerrado sesión exitosamente.",
        });
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al cerrar sesión.",
        variant: "destructive",
      });
    }
  };

  const navigationItems = [
    {
      name: 'Inicio',
      icon: Home,
      path: '/dashboard',
      active: location.pathname === '/dashboard'
    },
    {
      name: 'Grupos',
      icon: Users,
      path: '/groups',
      active: location.pathname === '/groups'
    }
  ];

  return (
    <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <h1 
              className="text-2xl font-bold text-white cursor-pointer hover:text-purple-200 transition-colors"
              onClick={() => navigate('/dashboard')}
            >
              FLORTE
            </h1>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                variant={item.active ? "secondary" : "ghost"}
                className={`text-white hover:bg-white/20 transition-all duration-200 ${
                  item.active 
                    ? 'bg-white/20 text-white' 
                    : 'hover:bg-white/10'
                }`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </Button>
            ))}
          </div>

          {/* Right side - Search, Notifications, Profile */}
          <div className="flex items-center space-x-3">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-white/20">
                    <AvatarImage 
                      src={user?.user_metadata?.avatar_url} 
                      alt={user?.user_metadata?.full_name || 'Usuario'} 
                    />
                    <AvatarFallback className="bg-purple-500 text-white">
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56 bg-white/95 backdrop-blur-sm border border-white/20" 
                align="end" 
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-gray-900">
                      {user?.user_metadata?.full_name || 'Usuario'}
                    </p>
                    <p className="text-xs leading-none text-gray-600">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => navigate('/profile')}
                  className="cursor-pointer hover:bg-purple-50"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span className="text-gray-900">Mi Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="cursor-pointer hover:bg-red-50 text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-center space-x-1 pb-3">
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              variant={item.active ? "secondary" : "ghost"}
              size="sm"
              className={`text-white hover:bg-white/20 transition-all duration-200 ${
                item.active 
                  ? 'bg-white/20 text-white' 
                  : 'hover:bg-white/10'
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="w-4 h-4 mr-1" />
              {item.name}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default MainNavigation;
