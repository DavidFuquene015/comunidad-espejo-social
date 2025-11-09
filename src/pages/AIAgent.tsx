import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import MainNavigation from '@/components/navigation/MainNavigation';
import ChatPanel from '@/components/ai/ChatPanel';
import ImageAnalysisPanel from '@/components/ai/ImageAnalysisPanel';
import LivePanel from '@/components/ai/LivePanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sun, Moon, Loader2, MessageSquare, Image, Mic } from 'lucide-react';

const AIAgent = () => {
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
    <div className="min-h-screen bg-social-gradient">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Agente IA FLORTE
            </h1>
            <p className="text-white/80">
              Asistente inteligente potenciado por Gemini 2.5
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="chat" className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Chat de Texto</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center space-x-2">
                <Image className="w-4 h-4" />
                <span>Análisis de Imagen</span>
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center space-x-2">
                <Mic className="w-4 h-4" />
                <span>Conversación por Voz</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="h-[600px]">
              <ChatPanel />
            </TabsContent>

            <TabsContent value="image" className="h-[600px]">
              <ImageAnalysisPanel />
            </TabsContent>

            <TabsContent value="voice" className="h-[600px]">
              <LivePanel />
            </TabsContent>
          </Tabs>
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

export default AIAgent;
