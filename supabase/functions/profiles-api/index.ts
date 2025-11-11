import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
    const path = url.pathname.replace('/profiles-api', '');
    const method = req.method;

    // GET /friends/:user_id - Fetch user's friends
    if (method === 'GET' && path.startsWith('/friends/')) {
      const userId = path.split('/')[2];

      const { data: friendshipsData, error } = await supabaseClient
        .from('friendships')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

      if (error) throw error;

      const friendIds = (friendshipsData || []).map(friendship => 
        friendship.user1_id === userId ? friendship.user2_id : friendship.user1_id
      );

      if (friendIds.length === 0) {
        return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: friendsData, error: friendsError } = await supabaseClient
        .from('profiles')
        .select('id, full_name, avatar_url, bio')
        .in('id', friendIds);

      if (friendsError) throw friendsError;

      return new Response(JSON.stringify(friendsData || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /friends-count/:user_id - Count user's friends
    if (method === 'GET' && path.startsWith('/friends-count/')) {
      const userId = path.split('/')[2];

      const { count, error } = await supabaseClient
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

      if (error) throw error;

      return new Response(JSON.stringify({ count: count || 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /projects-count/:user_id - Count user's projects
    if (method === 'GET' && path.startsWith('/projects-count/')) {
      const userId = path.split('/')[2];

      const { count, error } = await supabaseClient
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      return new Response(JSON.stringify({ count: count || 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /projects/:project_id - Delete project
    if (method === 'DELETE' && path.startsWith('/projects/')) {
      const projectId = path.split('/')[2];

      const { error } = await supabaseClient
        .from('projects')
        .delete()
        .eq('id', projectId)
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
    console.error('Error in profiles-api:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
