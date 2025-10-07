import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const path = url.pathname.replace('/rides-api', '');
    const method = req.method;

    // GET /requests - Fetch ride requests
    if (method === 'GET' && path === '/requests') {
      const { data, error } = await supabaseClient
        .from('ride_requests')
        .select('*')
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const requestsWithProfiles = await Promise.all(
        (data || []).map(async (request) => {
          const { data: profile } = await supabaseClient
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

      return new Response(JSON.stringify(requestsWithProfiles), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /offers - Fetch ride offers
    if (method === 'GET' && path === '/offers') {
      const { data, error } = await supabaseClient
        .from('ride_offers')
        .select('*')
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const offersWithProfiles = await Promise.all(
        (data || []).map(async (offer) => {
          const { data: profile } = await supabaseClient
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

      return new Response(JSON.stringify(offersWithProfiles), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /matches - Create ride match
    if (method === 'POST' && path === '/matches') {
      const body = await req.json();
      const { request_id, offer_id } = body;

      const { error } = await supabaseClient
        .from('ride_matches')
        .insert({
          request_id,
          offer_id,
          status: 'pending'
        });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in rides-api:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
