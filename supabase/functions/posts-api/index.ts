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
    const path = url.pathname.replace('/posts-api', '');
    const method = req.method;

    // GET /posts - Fetch all posts with details
    if (method === 'GET' && path === '/posts') {
      const { data: postsData, error: postsError } = await supabaseClient
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const postsWithDetails = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: profileData } = await supabaseClient
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', post.user_id)
            .single();

          const { data: reactionsData } = await supabaseClient
            .from('post_reactions')
            .select('*')
            .eq('post_id', post.id);

          const { data: commentsData } = await supabaseClient
            .from('post_comments')
            .select('*')
            .eq('post_id', post.id)
            .order('created_at', { ascending: true });

          const commentsWithProfiles = await Promise.all(
            (commentsData || []).map(async (comment) => {
              const { data: commentProfile } = await supabaseClient
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', comment.user_id)
                .single();

              return {
                ...comment,
                profiles: commentProfile || { full_name: null, avatar_url: null }
              };
            })
          );

          return {
            ...post,
            profiles: profileData || { full_name: null, avatar_url: null },
            reactions: reactionsData || [],
            comments: commentsWithProfiles,
            _count: {
              reactions: reactionsData?.length || 0,
              comments: commentsWithProfiles?.length || 0,
            },
          };
        })
      );

      return new Response(JSON.stringify(postsWithDetails), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /posts - Create new post
    if (method === 'POST' && path === '/posts') {
      const body = await req.json();
      const { content, media_url, media_type } = body;

      const { error } = await supabaseClient
        .from('posts')
        .insert({
          user_id: user.id,
          content: content || null,
          media_url: media_url || null,
          media_type: media_type || null,
        });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /reactions - Toggle reaction
    if (method === 'POST' && path === '/reactions') {
      const body = await req.json();
      const { post_id, emoji } = body;

      // Check if reaction already exists
      const { data: existingReaction } = await supabaseClient
        .from('post_reactions')
        .select('id')
        .eq('post_id', post_id)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .maybeSingle();

      if (existingReaction) {
        // Reaction exists, remove it
        const { error } = await supabaseClient
          .from('post_reactions')
          .delete()
          .eq('post_id', post_id)
          .eq('user_id', user.id)
          .eq('emoji', emoji);

        if (error) throw error;
      } else {
        // Reaction doesn't exist, add it
        const { error } = await supabaseClient
          .from('post_reactions')
          .insert({
            post_id,
            user_id: user.id,
            emoji,
          });

        if (error) throw error;
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /comments - Add comment
    if (method === 'POST' && path === '/comments') {
      const body = await req.json();
      const { post_id, content } = body;

      const { error } = await supabaseClient
        .from('post_comments')
        .insert({
          post_id,
          user_id: user.id,
          content,
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
    console.error('Error in posts-api:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
