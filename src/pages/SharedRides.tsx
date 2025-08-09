import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, MapPin, User, Car, Plus, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRides } from '@/hooks/useRides';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SharedRides = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { rideRequests, rideOffers, loading, createRideMatch, refetch } = useRides();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [activeTab, setActiveTab] = useState('requests');

  // Initialize map
  useEffect(() => {
    // Small delay to ensure the container is rendered
    const timer = setTimeout(() => {
      if (mapRef.current && !mapInstanceRef.current) {
        try {
          mapInstanceRef.current = L.map(mapRef.current, {
            center: [4.711, -74.0721], // Bogotá default
            zoom: 11,
            zoomControl: true,
            attributionControl: true
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(mapInstanceRef.current);

          console.log('Map initialized successfully');
        } catch (error) {
          console.error('Error initializing map:', error);
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add markers for requests and offers
    const allLocations: Array<{lat: number, lng: number, type: 'request' | 'offer', data: any}> = [];

    // Add request markers
    rideRequests.forEach(request => {
      allLocations.push({
        lat: request.origin_latitude,
        lng: request.origin_longitude,
        type: 'request',
        data: request
      });
      allLocations.push({
        lat: request.destination_latitude,
        lng: request.destination_longitude,
        type: 'request',
        data: request
      });
    });

    // Add offer markers
    rideOffers.forEach(offer => {
      allLocations.push({
        lat: offer.origin_latitude,
        lng: offer.origin_longitude,
        type: 'offer',
        data: offer
      });
      allLocations.push({
        lat: offer.destination_latitude,
        lng: offer.destination_longitude,
        type: 'offer',
        data: offer
      });
    });

    // Create markers
    allLocations.forEach(location => {
      const icon = L.icon({
        iconUrl: location.type === 'request' 
          ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png'
          : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const marker = L.marker([location.lat, location.lng], { icon })
        .bindPopup(
          `<div>
            <strong>${location.type === 'request' ? 'Solicitud' : 'Oferta'}</strong><br/>
            ${location.data.origin_address}<br/>
            <em>→ ${location.data.destination_address}</em>
          </div>`
        );

      mapInstanceRef.current?.addLayer(marker);
      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (allLocations.length > 0) {
      const group = new L.FeatureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [rideRequests, rideOffers]);

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

  const handleRequestRide = async (offerId: string) => {
    // For now, just show a toast since we need the request ID
    toast({
      title: "Funcionalidad en desarrollo",
      description: "Pronto podrás solicitar este viaje directamente.",
    });
  };

  const handleOfferRide = async (requestId: string) => {
    // For now, just show a toast since we need the offer ID
    toast({
      title: "Funcionalidad en desarrollo", 
      description: "Pronto podrás ofrecer un viaje para esta solicitud.",
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
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Inicio
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2">Viajes Compartidos</h1>
        <p className="text-muted-foreground">
          Encuentra o ofrece viajes compartidos para llegar a tu centro de formación SENA
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Mapa */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Mapa de Viajes
            </CardTitle>
            <CardDescription>
              Visualiza las rutas y ubicaciones de los viajes disponibles
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 relative">
            <div 
              ref={mapRef}
              className="w-full h-96 lg:h-[600px] rounded-b-lg"
              style={{ minHeight: '400px' }}
            />
            <div className="p-4 flex gap-4 text-sm text-muted-foreground border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Solicitudes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Ofertas</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de viajes */}
        <Card className="xl:col-span-1">
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
                  Solicitudes ({rideRequests.length})
                </TabsTrigger>
                <TabsTrigger value="offers" className="flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Ofertas ({rideOffers.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="requests" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Solicitudes de Viaje</h3>
                  <Button onClick={() => navigate('/create-ride-request')} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Solicitar Viaje
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Cargando solicitudes...</p>
                    </div>
                  ) : rideRequests.length === 0 ? (
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

                        {request.student_id !== user.id && (
                          <div className="mt-3 flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleOfferRide(request.id)}
                            >
                              Ofrecer Viaje
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="offers" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Ofertas de Viaje</h3>
                  <Button onClick={() => navigate('/create-ride-offer')} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Ofrecer Viaje
                  </Button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Cargando ofertas...</p>
                    </div>
                  ) : rideOffers.length === 0 ? (
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

                        {offer.driver_id !== user.id && (
                          <div className="mt-3 flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleRequestRide(offer.id)}
                            >
                              Solicitar Viaje
                            </Button>
                          </div>
                        )}
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