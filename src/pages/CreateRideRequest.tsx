import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MapPin, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CreateRideRequest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    originAddress: '',
    destinationAddress: '',
    departureTime: '',
    maxPassengers: 1,
    description: ''
  });

  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Colombia')}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      }
      throw new Error('No se encontró la dirección');
    } catch (error) {
      console.error('Error geocodificando:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Geocodificar direcciones
      const [originCoords, destCoords] = await Promise.all([
        geocodeAddress(formData.originAddress),
        geocodeAddress(formData.destinationAddress)
      ]);

      // Crear solicitud en la base de datos
      const { error } = await supabase
        .from('ride_requests')
        .insert({
          student_id: user.id,
          origin_address: formData.originAddress,
          destination_address: formData.destinationAddress,
          origin_latitude: originCoords.latitude,
          origin_longitude: originCoords.longitude,
          destination_latitude: destCoords.latitude,
          destination_longitude: destCoords.longitude,
          departure_time: formData.departureTime,
          max_passengers: formData.maxPassengers,
          description: formData.description || null
        });

      if (error) throw error;

      toast({
        title: "Solicitud creada",
        description: "Tu solicitud de viaje ha sido publicada exitosamente.",
      });

      navigate('/shared-rides');
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la solicitud de viaje.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Acceso Requerido</h2>
            <p className="text-muted-foreground">
              Debes iniciar sesión para crear una solicitud de viaje.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/shared-rides')}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Viajes Compartidos
        </Button>
        <h1 className="text-3xl font-bold mb-2">Solicitar Viaje</h1>
        <p className="text-muted-foreground">
          Completa los detalles de tu solicitud de viaje para que otros conductores puedan ayudarte.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Nueva Solicitud de Viaje
          </CardTitle>
          <CardDescription>
            Proporciona la información necesaria para tu solicitud
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="originAddress" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  Dirección de Origen
                </Label>
                <Input
                  id="originAddress"
                  value={formData.originAddress}
                  onChange={(e) => setFormData({ ...formData, originAddress: e.target.value })}
                  placeholder="Ej: Calle 123 #45-67, Bogotá"
                  required
                />
              </div>

              <div>
                <Label htmlFor="destinationAddress" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  Dirección de Destino
                </Label>
                <Input
                  id="destinationAddress"
                  value={formData.destinationAddress}
                  onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
                  placeholder="Ej: Centro de Formación SENA, Bogotá"
                  required
                />
              </div>

              <div>
                <Label htmlFor="departureTime" className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Fecha y Hora de Salida
                </Label>
                <Input
                  id="departureTime"
                  type="datetime-local"
                  value={formData.departureTime}
                  onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="maxPassengers">
                  Número Máximo de Pasajeros
                </Label>
                <Input
                  id="maxPassengers"
                  type="number"
                  min="1"
                  max="6"
                  value={formData.maxPassengers}
                  onChange={(e) => setFormData({ ...formData, maxPassengers: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">
                  Descripción Adicional (Opcional)
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Información adicional sobre tu solicitud..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/shared-rides')}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creando...' : 'Crear Solicitud'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateRideRequest;