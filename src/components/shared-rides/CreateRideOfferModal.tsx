import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Car } from 'lucide-react';

interface CreateRideOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateRideOfferModal = ({ open, onOpenChange, onSuccess }: CreateRideOfferModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    origin_address: '',
    destination_address: '',
    departure_time: '',
    available_seats: 1,
    vehicle_description: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Geocodificar las direcciones usando Nominatim
      const originCoords = await geocodeAddress(formData.origin_address);
      const destinationCoords = await geocodeAddress(formData.destination_address);

      if (!originCoords || !destinationCoords) {
        toast({
          title: "Error",
          description: "No se pudieron encontrar las coordenadas de las direcciones proporcionadas.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('ride_offers')
        .insert({
          driver_id: user.id,
          origin_address: formData.origin_address,
          destination_address: formData.destination_address,
          origin_latitude: originCoords.lat,
          origin_longitude: originCoords.lon,
          destination_latitude: destinationCoords.lat,
          destination_longitude: destinationCoords.lon,
          departure_time: formData.departure_time,
          available_seats: formData.available_seats,
          vehicle_description: formData.vehicle_description,
          description: formData.description
        });

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo crear la oferta de viaje.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "¡Éxito!",
        description: "Tu oferta de viaje ha sido creada exitosamente.",
      });

      setFormData({
        origin_address: '',
        destination_address: '',
        departure_time: '',
        available_seats: 1,
        vehicle_description: '',
        description: ''
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating ride offer:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=co`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const getCurrentLocation = (field: 'origin' | 'destination') => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "La geolocalización no está disponible en tu navegador.",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data && data.display_name) {
            setFormData(prev => ({
              ...prev,
              [`${field}_address`]: data.display_name
            }));
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          toast({
            title: "Error",
            description: "No se pudo obtener la dirección de tu ubicación.",
            variant: "destructive",
          });
        }
      },
      (error) => {
        toast({
          title: "Error",
          description: "No se pudo obtener tu ubicación actual.",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Ofrecer Viaje
          </DialogTitle>
          <DialogDescription>
            Comparte tu vehículo y ayuda a otros estudiantes a llegar a su centro de formación.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="origin">Dirección de Origen</Label>
            <div className="flex gap-2">
              <Input
                id="origin"
                placeholder="Ej: Carrera 10 #28-49, Bogotá"
                value={formData.origin_address}
                onChange={(e) => setFormData(prev => ({ ...prev, origin_address: e.target.value }))}
                required
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => getCurrentLocation('origin')}
                className="shrink-0"
              >
                <MapPin className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Dirección de Destino</Label>
            <div className="flex gap-2">
              <Input
                id="destination"
                placeholder="Ej: Centro de Formación SENA"
                value={formData.destination_address}
                onChange={(e) => setFormData(prev => ({ ...prev, destination_address: e.target.value }))}
                required
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => getCurrentLocation('destination')}
                className="shrink-0"
              >
                <MapPin className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="departure_time">Hora de Salida</Label>
            <Input
              id="departure_time"
              type="datetime-local"
              value={formData.departure_time}
              onChange={(e) => setFormData(prev => ({ ...prev, departure_time: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="available_seats">Asientos Disponibles</Label>
            <Select 
              value={formData.available_seats.toString()} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, available_seats: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 asiento</SelectItem>
                <SelectItem value="2">2 asientos</SelectItem>
                <SelectItem value="3">3 asientos</SelectItem>
                <SelectItem value="4">4 asientos</SelectItem>
                <SelectItem value="5">5 asientos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle_description">Descripción del Vehículo</Label>
            <Input
              id="vehicle_description"
              placeholder="Ej: Chevrolet Spark Rojo, Placa ABC-123"
              value={formData.vehicle_description}
              onChange={(e) => setFormData(prev => ({ ...prev, vehicle_description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción Adicional (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Agrega cualquier información adicional sobre tu oferta..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creando...' : 'Crear Oferta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRideOfferModal;