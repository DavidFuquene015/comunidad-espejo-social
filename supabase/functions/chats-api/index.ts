import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    const path = url.pathname.replace('/chats-api', '');
    const method = req.method;

    // GET /chats - Fetch user's private chats
    if (method === 'GET' && path === '/chats') {
      const { data: chatData, error } = await supabaseClient
        .from('private_chats')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const chatsWithUsers = await Promise.all(
        (chatData || []).map(async (chat) => {
          const otherUserId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id;
          
          const { data: otherUserProfile } = await supabaseClient
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', otherUserId)
            .single();

          const { data: lastMessage } = await supabaseClient
            .from('private_messages')
            .select('*, read_at')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          let lastMessageWithSender = undefined;
          
          if (lastMessage) {
            const { data: senderProfile } = await supabaseClient
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', lastMessage.sender_id)
              .single();

            lastMessageWithSender = {
              ...lastMessage,
              sender: senderProfile || { full_name: null, avatar_url: null }
            };
          }

          const { count: unreadCount } = await supabaseClient
            .from('private_messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chat.id)
            .neq('sender_id', user.id)
            .is('read_at', null);

          return {
            ...chat,
            other_user: otherUserProfile || null,
            last_message: lastMessageWithSender,
            unread_count: unreadCount || 0
          };
        })
      );

      return new Response(JSON.stringify(chatsWithUsers), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /chats - Create or get chat
    if (method === 'POST' && path === '/chats') {
      const body = await req.json();
      const { friend_id } = body;

      const { data: existingChat } = await supabaseClient
        .from('private_chats')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${friend_id}),and(user1_id.eq.${friend_id},user2_id.eq.${user.id})`)
        .maybeSingle();

      if (existingChat) {
        return new Response(JSON.stringify({ chat_id: existingChat.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const user1_id = user.id < friend_id ? user.id : friend_id;
      const user2_id = user.id < friend_id ? friend_id : user.id;

      const { data: newChat, error } = await supabaseClient
        .from('private_chats')
        .insert({ user1_id, user2_id })
        .select('id')
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ chat_id: newChat.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /messages/:chat_id - Fetch chat messages
    if (method === 'GET' && path.startsWith('/messages/')) {
      const chatId = path.split('/')[2];

      // Get chat to determine user role
      const { data: chat } = await supabaseClient
        .from('private_chats')
        .select('user1_id, user2_id')
        .eq('id', chatId)
        .single();

      if (!chat) {
        return new Response(JSON.stringify({ error: 'Chat not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const isSender = (msg: any) => msg.sender_id === user.id;

      const { data: messagesData, error } = await supabaseClient
        .from('private_messages')
        .select('*, read_at, edited_at, deleted_for_sender, deleted_for_receiver, deleted_for_everyone')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Filter messages based on deletion status
      const filteredMessages = (messagesData || []).filter((msg: any) => {
        if (msg.deleted_for_everyone) return true;
        if (isSender(msg) && msg.deleted_for_sender) return false;
        if (!isSender(msg) && msg.deleted_for_receiver) return false;
        return true;
      });

      const messagesWithProfiles = await Promise.all(
        filteredMessages.map(async (message: any) => {
          const { data: senderProfile } = await supabaseClient
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', message.sender_id)
            .single();

          return {
            ...message,
            sender: senderProfile || { full_name: null, avatar_url: null }
          };
        })
      );

      return new Response(JSON.stringify(messagesWithProfiles), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /messages - Send message
    if (method === 'POST' && path === '/messages') {
      const body = await req.json();
      const { chat_id, content, media_url, media_type } = body;

      const { error } = await supabaseClient
        .from('private_messages')
        .insert({
          chat_id,
          sender_id: user.id,
          content: content || null,
          media_url: media_url || null,
          media_type: media_type || null,
        });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /messages/read/:chat_id - Mark messages as read
    if (method === 'PUT' && path.startsWith('/messages/read/')) {
      const chatId = path.split('/')[3];

      const { error } = await supabaseClient
        .from('private_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('chat_id', chatId)
        .neq('sender_id', user.id)
        .is('read_at', null);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /messages/:message_id - Edit message
    if (method === 'PUT' && path.startsWith('/messages/') && !path.includes('/read/')) {
      const messageId = path.split('/')[2];
      const body = await req.json();
      const { content } = body;

      // Verify message ownership
      const { data: message } = await supabaseClient
        .from('private_messages')
        .select('sender_id')
        .eq('id', messageId)
        .single();

      if (!message || message.sender_id !== user.id) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabaseClient
        .from('private_messages')
        .update({ 
          content,
          edited_at: new Date().toISOString() 
        })
        .eq('id', messageId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /messages/:message_id?deleteFor=me|everyone - Delete message
    if (method === 'DELETE' && path.startsWith('/messages/')) {
      const messageId = path.split('/')[2];
      const deleteFor = url.searchParams.get('deleteFor') || 'me';

      // Get message and chat info
      const { data: message } = await supabaseClient
        .from('private_messages')
        .select('sender_id, chat_id')
        .eq('id', messageId)
        .single();

      if (!message) {
        return new Response(JSON.stringify({ error: 'Message not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get chat to determine if user is sender or receiver
      const { data: chat } = await supabaseClient
        .from('private_chats')
        .select('user1_id, user2_id')
        .eq('id', message.chat_id)
        .single();

      if (!chat) {
        return new Response(JSON.stringify({ error: 'Chat not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const isSender = message.sender_id === user.id;
      const isParticipant = chat.user1_id === user.id || chat.user2_id === user.id;

      if (!isParticipant) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (deleteFor === 'everyone') {
        // Only sender can delete for everyone
        if (!isSender) {
          return new Response(JSON.stringify({ error: 'Only sender can delete for everyone' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error } = await supabaseClient
          .from('private_messages')
          .update({ 
            deleted_for_everyone: true,
            content: 'Este mensaje fue eliminado'
          })
          .eq('id', messageId);

        if (error) throw error;
      } else {
        // Delete for me
        const updateField = isSender ? 'deleted_for_sender' : 'deleted_for_receiver';
        
        const { error } = await supabaseClient
          .from('private_messages')
          .update({ [updateField]: true })
          .eq('id', messageId);

        if (error) throw error;
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chats-api:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
