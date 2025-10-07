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
    const path = url.pathname.replace('/stories-api', '');
    const method = req.method;

    // GET /stories - Fetch all active stories
    if (method === 'GET' && path === '/stories') {
      const { data: stories, error } = await supabaseClient
        .from('stories')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const storiesWithProfiles = await Promise.all(
        (stories || []).map(async (story) => {
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', story.user_id)
            .single();
          
          return {
            ...story,
            profiles: profile || { full_name: 'Usuario', avatar_url: null }
          };
        })
      );

      return new Response(JSON.stringify(storiesWithProfiles), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /stories - Create new story
    if (method === 'POST' && path === '/stories') {
      const body = await req.json();
      const { media_url, media_type, caption } = body;

      const { data, error } = await supabaseClient
        .from('stories')
        .insert({
          user_id: user.id,
          media_url,
          media_type,
          caption: caption || null,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /stories/:id - Delete story
    if (method === 'DELETE' && path.startsWith('/stories/')) {
      const storyId = path.split('/')[2];

      const { error } = await supabaseClient
        .from('stories')
        .delete()
        .eq('id', storyId)
        .eq('user_id', user.id);

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
    console.error('Error in stories-api:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
