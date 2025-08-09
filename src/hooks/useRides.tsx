import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface RideRequest {
  id: string;
  student_id: string;
  origin_latitude: number;
  origin_longitude: number;
  origin_address: string;
  destination_latitude: number;
  destination_longitude: number;
  destination_address: string;
  departure_time: string;
  description?: string;
  max_passengers: number;
  status: string;
  created_at: string;
  updated_at: string;
  student?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface RideOffer {
  id: string;
  driver_id: string;
  origin_latitude: number;
  origin_longitude: number;
  origin_address: string;
  destination_latitude: number;
  destination_longitude: number;
  destination_address: string;
  departure_time: string;
  available_seats: number;
  vehicle_description?: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  driver?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface RideMatch {
  id: string;
  request_id: string;
  offer_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useRides = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [rideOffers, setRideOffers] = useState<RideOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRideRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('ride_requests')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ride requests:', error);
        return;
      }

      // Fetch student profiles separately
      const requestsWithProfiles = await Promise.all(
        (data || []).map(async (request) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', request.student_id)
            .single();
          
          return {
            ...request,
            student: profile || { full_name: 'Usuario', avatar_url: null }
          };
        })
      );

      setRideRequests(requestsWithProfiles);
    } catch (error) {
      console.error('Error fetching ride requests:', error);
    }
  };

  const fetchRideOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('ride_offers')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ride offers:', error);
        return;
      }

      // Fetch driver profiles separately
      const offersWithProfiles = await Promise.all(
        (data || []).map(async (offer) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', offer.driver_id)
            .single();
          
          return {
            ...offer,
            driver: profile || { full_name: 'Conductor', avatar_url: null }
          };
        })
      );

      setRideOffers(offersWithProfiles);
    } catch (error) {
      console.error('Error fetching ride offers:', error);
    }
  };

  const createRideMatch = async (requestId: string, offerId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('ride_matches')
        .insert({
          request_id: requestId,
          offer_id: offerId,
          status: 'pending'
        });

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo crear la solicitud de match.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "¡Éxito!",
        description: "Tu solicitud ha sido enviada al conductor.",
      });

      return true;
    } catch (error) {
      console.error('Error creating ride match:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchRideRequests(), fetchRideOffers()]);
      setLoading(false);
    };

    fetchData();

    // Set up real-time subscriptions
    const requestsChannel = supabase
      .channel('ride-requests-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'ride_requests' 
      }, () => {
        fetchRideRequests();
      })
      .subscribe();

    const offersChannel = supabase
      .channel('ride-offers-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'ride_offers' 
      }, () => {
        fetchRideOffers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(offersChannel);
    };
  }, []);

  return {
    rideRequests,
    rideOffers,
    loading,
    createRideMatch,
    refetch: () => {
      fetchRideRequests();
      fetchRideOffers();
    }
  };
};