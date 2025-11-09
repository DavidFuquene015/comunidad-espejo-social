import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Upload, Image as ImageIcon, Bot, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ImageAnalysisPanel = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen es muy grande. El tamaño máximo es 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysis('');
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage || isAnalyzing) return;

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('gemini-image-analysis', {
        body: {
          image: selectedImage,
          prompt: prompt || "Analiza esta imagen y describe lo que ves en detalle."
        }
      });

      if (error) throw error;

      setAnalysis(data.response);
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Error",
        description: "No se pudo analizar la imagen. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setAnalysis('');
    setPrompt('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-sm rounded-lg border border-border/50">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 bg-primary">
            <AvatarFallback>
              <ImageIcon className="w-6 h-6 text-primary-foreground" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">Análisis de Imagen</h3>
            <p className="text-xs text-muted-foreground">Gemini 2.5 Flash Vision</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Imagen</label>
            {!selectedImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Haz clic para subir una imagen
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG (máx. 5MB)
                </p>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden border border-border/50">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="w-full h-auto max-h-64 object-contain bg-muted"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={clearImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Prompt */}
          {selectedImage && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Pregunta (opcional)
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="¿Qué quieres saber sobre esta imagen?"
                  rows={3}
                  disabled={isAnalyzing}
                />
              </div>

              <Button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4 mr-2" />
                    Analizar Imagen
                  </>
                )}
              </Button>
            </>
          )}

          {/* Analysis Result */}
          {analysis && (
            <div className="rounded-lg p-4 bg-muted border border-border/50">
              <div className="flex items-start space-x-3 mb-2">
                <Avatar className="w-8 h-8 bg-primary">
                  <AvatarFallback>
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium text-foreground">Análisis de FLORTE</p>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{analysis}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ImageAnalysisPanel;
