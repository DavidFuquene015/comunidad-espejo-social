
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: () => void;
}

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }: CreateGroupModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string>('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackgroundImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setBackgroundPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setBackgroundImage(null);
    setBackgroundPreview('');
  };

  const uploadImage = async (groupId: string): Promise<string | null> => {
    if (!backgroundImage) return null;

    const fileExt = backgroundImage.name.split('.').pop();
    const fileName = `${user?.id}/${groupId}/background.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('group-backgrounds')
      .upload(fileName, backgroundImage);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('group-backgrounds')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Create group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: formData.name,
          description: formData.description,
          owner_id: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Upload background image if provided
      let backgroundUrl = null;
      if (backgroundImage) {
        backgroundUrl = await uploadImage(groupData.id);
        if (backgroundUrl) {
          await supabase
            .from('groups')
            .update({ background_image_url: backgroundUrl })
            .eq('id', groupData.id);
        }
      }

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      // Create default text channel
      const { error: channelError } = await supabase
        .from('channels')
        .insert({
          group_id: groupData.id,
          name: 'general',
          type: 'text',
          description: 'Canal general para conversaciones',
          created_by: user.id
        });

      if (channelError) throw channelError;

      toast({
        title: "¡Éxito!",
        description: "Grupo creado exitosamente.",
      });

      setFormData({ name: '', description: '' });
      setBackgroundImage(null);
      setBackgroundPreview('');
      onGroupCreated();
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el grupo.",
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
          <DialogTitle className="text-gray-900">Crear Nuevo Grupo</DialogTitle>
          <DialogDescription className="text-gray-600">
            Crea un grupo para conectar con personas que comparten tus intereses.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-900">Nombre del Grupo</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Desarrolladores Web"
              required
              className="bg-white border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-900">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe de qué trata tu grupo..."
              rows={3}
              className="bg-white border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-900">Imagen de Fondo (Opcional)</Label>
            {!backgroundPreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="background-upload"
                />
                <label
                  htmlFor="background-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-gray-600">Subir imagen de fondo</span>
                </label>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={backgroundPreview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  onClick={removeImage}
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 w-6 h-6"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
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
              {loading ? 'Creando...' : 'Crear Grupo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
