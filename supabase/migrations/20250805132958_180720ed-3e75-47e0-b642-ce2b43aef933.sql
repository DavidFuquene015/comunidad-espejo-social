-- Crear tabla para solicitudes de viaje
CREATE TABLE public.ride_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  origin_latitude DOUBLE PRECISION NOT NULL,
  origin_longitude DOUBLE PRECISION NOT NULL,
  origin_address TEXT NOT NULL,
  destination_latitude DOUBLE PRECISION NOT NULL,
  destination_longitude DOUBLE PRECISION NOT NULL,
  destination_address TEXT NOT NULL,
  departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  max_passengers INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'matched', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para ofertas de viaje (conductores)
CREATE TABLE public.ride_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL,
  origin_latitude DOUBLE PRECISION NOT NULL,
  origin_longitude DOUBLE PRECISION NOT NULL,
  origin_address TEXT NOT NULL,
  destination_latitude DOUBLE PRECISION NOT NULL,
  destination_longitude DOUBLE PRECISION NOT NULL,
  destination_address TEXT NOT NULL,
  departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
  available_seats INTEGER NOT NULL DEFAULT 1,
  vehicle_description TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'full', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para matches entre solicitudes y ofertas
CREATE TABLE public.ride_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.ride_requests(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES public.ride_offers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(request_id, offer_id)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_matches ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ride_requests
CREATE POLICY "Users can view all ride requests" 
ON public.ride_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own ride requests" 
ON public.ride_requests 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own ride requests" 
ON public.ride_requests 
FOR UPDATE 
USING (auth.uid() = student_id);

CREATE POLICY "Users can delete their own ride requests" 
ON public.ride_requests 
FOR DELETE 
USING (auth.uid() = student_id);

-- Políticas RLS para ride_offers
CREATE POLICY "Users can view all ride offers" 
ON public.ride_offers 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own ride offers" 
ON public.ride_offers 
FOR INSERT 
WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Users can update their own ride offers" 
ON public.ride_offers 
FOR UPDATE 
USING (auth.uid() = driver_id);

CREATE POLICY "Users can delete their own ride offers" 
ON public.ride_offers 
FOR DELETE 
USING (auth.uid() = driver_id);

-- Políticas RLS para ride_matches
CREATE POLICY "Users can view matches related to their requests or offers" 
ON public.ride_matches 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.ride_requests 
    WHERE ride_requests.id = ride_matches.request_id 
    AND ride_requests.student_id = auth.uid()
  ) 
  OR 
  EXISTS (
    SELECT 1 FROM public.ride_offers 
    WHERE ride_offers.id = ride_matches.offer_id 
    AND ride_offers.driver_id = auth.uid()
  )
);

CREATE POLICY "Students can create matches for their requests" 
ON public.ride_matches 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ride_requests 
    WHERE ride_requests.id = ride_matches.request_id 
    AND ride_requests.student_id = auth.uid()
  )
);

CREATE POLICY "Drivers can update matches for their offers" 
ON public.ride_matches 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.ride_offers 
    WHERE ride_offers.id = ride_matches.offer_id 
    AND ride_offers.driver_id = auth.uid()
  )
);

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar timestamps
CREATE TRIGGER update_ride_requests_updated_at
BEFORE UPDATE ON public.ride_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ride_offers_updated_at
BEFORE UPDATE ON public.ride_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ride_matches_updated_at
BEFORE UPDATE ON public.ride_matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();