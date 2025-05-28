
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulación de login (aquí conectarás con tu backend más tarde)
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "¡Bienvenido!",
        description: "Inicio de sesión exitoso. Redirigiendo...",
      });
      
      // Aquí redirigirás a la página de inicio
      console.log('Login exitoso para:', email);
    }, 1500);
  };

  return (
    <div className="w-full max-w-md space-y-8 backdrop-blur-sm bg-white/5 p-8 rounded-2xl border border-white/10 shadow-2xl">
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80 text-sm font-medium">
              Usuario o Email
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
              <Input
                id="email"
                type="email"
                placeholder="Tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400 focus:ring-purple-400/50 h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80 text-sm font-medium">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
              <Input
                id="password"
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400 focus:ring-purple-400/50 h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-white/70 text-sm">Recordar sesión</span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-button-gradient hover:scale-105 transform transition-all duration-200 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>INICIANDO...</span>
            </div>
          ) : (
            'INICIAR SESIÓN'
          )}
        </Button>

        <div className="text-center">
          <p className="text-white/60 text-sm">
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              className="text-purple-300 hover:text-purple-200 font-medium transition-colors duration-200"
              onClick={() => {
                toast({
                  title: "Registro",
                  description: "La función de registro estará disponible pronto.",
                });
              }}
            >
              Regístrate
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
