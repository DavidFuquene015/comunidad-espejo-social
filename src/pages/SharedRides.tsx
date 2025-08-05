import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, MapPin, User, Car, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RideRequest {
  id: string;
  student_id: string;
  origin_address: string;
  destination_address: string;
  departure_time: string;
  description?: string;
  max_passengers: number;
  status: string;
  created_at: string;
  student?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface RideOffer {
  id: string;
  driver_id: string;
  origin_address: string;
  destination_address: string;
  departure_time: string;
  available_seats: number;
  vehicle_description?: string;
  description?: string;
  status: string;
  created_at: string;
  driver?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const SharedRides = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [activeTab, setActiveTab] = useState('requests');
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [rideOffers, setRideOffers] = useState<RideOffer[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([4.711, -74.0721], 11); // Bogotá default

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateRequest = () => {
    toast({
      title: "Próximamente",
      description: "La funcionalidad para crear solicitudes estará disponible pronto.",
    });
  };

  const handleCreateOffer = () => {
    toast({
      title: "Próximamente", 
      description: "La funcionalidad para crear ofertas estará disponible pronto.",
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Acceso Requerido</h2>
            <p className="text-muted-foreground">
              Debes iniciar sesión para acceder a los viajes compartidos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Viajes Compartidos</h1>
        <p className="text-muted-foreground">
          Encuentra o ofrece viajes compartidos para llegar a tu centro de formación SENA
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mapa */}
        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Mapa de Viajes
            </CardTitle>
            <CardDescription>
              Visualiza las rutas y ubicaciones de los viajes disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              ref={mapRef}
              className="w-full h-96 lg:h-[500px] rounded-lg border"
            />
          </CardContent>
        </Card>

        {/* Lista de viajes */}
        <Card>
          <CardHeader>
            <CardTitle>Viajes Disponibles</CardTitle>
            <CardDescription>
              Solicitudes de estudiantes y ofertas de conductores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="requests" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Solicitudes
                </TabsTrigger>
                <TabsTrigger value="offers" className="flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Ofertas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="requests" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Solicitudes de Viaje</h3>
                  <Button onClick={handleCreateRequest} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Solicitar Viaje
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {rideRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No hay solicitudes de viaje disponibles</p>
                    </div>
                  ) : (
                    rideRequests.map((request) => (
                      <Card key={request.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium">
                              {request.student?.full_name || 'Estudiante'}
                            </span>
                          </div>
                          <Badge variant="outline">
                            {request.max_passengers} pasajero{request.max_passengers > 1 ? 's' : ''}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="truncate">{request.origin_address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-600" />
                            <span className="truncate">{request.destination_address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span>{formatDate(request.departure_time)}</span>
                          </div>
                        </div>

                        {request.description && (
                          <>
                            <Separator className="my-3" />
                            <p className="text-sm text-muted-foreground">
                              {request.description}
                            </p>
                          </>
                        )}

                        <div className="mt-3 flex gap-2">
                          <Button size="sm" className="flex-1">
                            Ofrecer Viaje
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="offers" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Ofertas de Viaje</h3>
                  <Button onClick={handleCreateOffer} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Ofrecer Viaje
                  </Button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {rideOffers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No hay ofertas de viaje disponibles</p>
                    </div>
                  ) : (
                    rideOffers.map((offer) => (
                      <Card key={offer.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Car className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium">
                              {offer.driver?.full_name || 'Conductor'}
                            </span>
                          </div>
                          <Badge variant="outline">
                            {offer.available_seats} asiento{offer.available_seats > 1 ? 's' : ''}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="truncate">{offer.origin_address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-600" />
                            <span className="truncate">{offer.destination_address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span>{formatDate(offer.departure_time)}</span>
                          </div>
                        </div>

                        {offer.vehicle_description && (
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {offer.vehicle_description}
                            </Badge>
                          </div>
                        )}

                        {offer.description && (
                          <>
                            <Separator className="my-3" />
                            <p className="text-sm text-muted-foreground">
                              {offer.description}
                            </p>
                          </>
                        )}

                        <div className="mt-3 flex gap-2">
                          <Button size="sm" className="flex-1">
                            Solicitar Viaje
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SharedRides;