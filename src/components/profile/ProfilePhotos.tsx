import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Image as ImageIcon, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProfilePhotosProps {
  profile: any;
}

const ProfilePhotos = ({ profile }: ProfilePhotosProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPhotos();
    }
  }, [user]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('profile-images')
        .list(`${user?.id}/photos/`, {
          limit: 12,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      const photoUrls = data?.map(file => {
        const { data: urlData } = supabase.storage
          .from('profile-images')
          .getPublicUrl(`${user?.id}/photos/${file.name}`);
        return urlData.publicUrl;
      }) || [];

      setPhotos(photoUrls);
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/photos/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      toast({
        title: "Foto agregada",
        description: "Tu foto se subió correctamente.",
      });

      // Refresh photos
      fetchPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la foto.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="bg-glass-card rounded-2xl p-6 border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Fotos</h3>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Foto
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAddPhoto}
            className="hidden"
          />
        </div>

        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/70">
            <ImageIcon className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium mb-2">No hay fotos aún</p>
            <p className="text-sm text-center">Comparte tus mejores momentos con tus compañeros del SENA</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl bg-black/90 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white sr-only">Foto ampliada</DialogTitle>
            <Button
              variant="ghost"
              onClick={() => setSelectedPhoto(null)}
              className="absolute right-4 top-4 text-white hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </Button>
          </DialogHeader>
          {selectedPhoto && (
            <div className="flex justify-center">
              <img
                src={selectedPhoto}
                alt="Foto ampliada"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfilePhotos;