
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Hash, Volume2 } from 'lucide-react';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onChannelCreated: () => void;
}

const CreateChannelModal = ({ isOpen, onClose, groupId, onChannelCreated }: CreateChannelModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'text' as 'text' | 'voice'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('channels')
        .insert({
          group_id: groupId,
          name: formData.name.toLowerCase().replace(/\s+/g, '-'),
          type: formData.type,
          description: formData.description,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "Canal creado exitosamente.",
      });

      setFormData({ name: '', description: '', type: 'text' });
      onChannelCreated();
    } catch (error) {
      console.error('Error creating channel:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el canal.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Crear Nuevo Canal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label className="text-gray-900">Tipo de Canal</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as 'text' | 'voice' })}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="text" />
                <Label htmlFor="text" className="flex items-center space-x-2 cursor-pointer">
                  <Hash className="w-4 h-4" />
                  <span>Texto</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="voice" id="voice" />
                <Label htmlFor="voice" className="flex items-center space-x-2 cursor-pointer">
                  <Volume2 className="w-4 h-4" />
                  <span>Voz</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-900">Nombre del Canal</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="ej: chat-general"
              required
              className="bg-white border-gray-300"
            />
            <p className="text-xs text-gray-500">
              El nombre se convertirá automáticamente a minúsculas y espacios a guiones
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-900">Descripción (Opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el propósito de este canal..."
              rows={3}
              className="bg-white border-gray-300"
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
            >
              {loading ? 'Creando...' : 'Crear Canal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChannelModal;
