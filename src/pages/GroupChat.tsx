
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MainNavigation from '@/components/navigation/MainNavigation';
import GroupSidebar from '@/components/groups/GroupSidebar';
import ChatArea from '@/components/groups/ChatArea';
import VoiceChannel from '@/components/groups/VoiceChannel';
import GroupMembers from '@/components/groups/GroupMembers';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Group {
  id: string;
  name: string;
  description: string;
  background_image_url: string;
  owner_id: string;
}

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  description: string;
}

const GroupChat = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUserMember, setIsUserMember] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    if (groupId && user) {
      fetchGroupData();
    }
  }, [groupId, user]);

  const fetchGroupData = async () => {
    try {
      // Check if user is member
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user?.id)
        .single();

      if (memberError && memberError.code !== 'PGRST116') {
        throw memberError;
      }

      if (!memberData) {
        toast({
          title: "Acceso Denegado",
          description: "No eres miembro de este grupo.",
          variant: "destructive",
        });
        navigate('/groups');
        return;
      }

      setIsUserMember(true);
      setIsUserAdmin(memberData.role === 'admin');

      // Fetch group info
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;
      setGroup(groupData);

      // Fetch channels
      const { data: channelsData, error: channelsError } = await supabase
        .from('channels')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (channelsError) throw channelsError;
      
      // Cast the type to ensure TypeScript compatibility
      const typedChannels: Channel[] = (channelsData || []).map(channel => ({
        ...channel,
        type: channel.type as 'text' | 'voice'
      }));
      
      setChannels(typedChannels);
      
      // Select first text channel by default
      const firstTextChannel = typedChannels.find(c => c.type === 'text');
      if (firstTextChannel) {
        setSelectedChannel(firstTextChannel);
      }

    } catch (error) {
      console.error('Error fetching group data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del grupo.",
        variant: "destructive",
      });
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  const handleChannelCreated = () => {
    fetchGroupData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-social-gradient">
        <MainNavigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-white text-xl">Cargando grupo...</div>
        </div>
      </div>
    );
  }

  if (!group || !isUserMember) {
    return (
      <div className="min-h-screen bg-social-gradient">
        <MainNavigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-white text-xl">Grupo no encontrado</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-social-gradient">
      <MainNavigation />
      
      <div className="flex fixed inset-0 top-16">
        {/* Fixed Sidebar */}
        <div className="fixed left-0 top-16 bottom-0 z-30">
          <GroupSidebar
            group={group}
            channels={channels}
            selectedChannel={selectedChannel}
            onChannelSelect={setSelectedChannel}
            isUserAdmin={isUserAdmin}
            onChannelCreated={handleChannelCreated}
          />
        </div>

        {/* Main Content with left offset for sidebar */}
        <div className="flex-1 flex flex-col ml-60 bg-social-gradient">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/groups')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">{group.name}</h1>
                {selectedChannel && (
                  <p className="text-white/70 text-sm">
                    # {selectedChannel.name} {selectedChannel.type === 'voice' && '🔊'}
                  </p>
                )}
              </div>
            </div>
            
            {/* Members Button */}
            <GroupMembers groupId={group.id} isUserAdmin={isUserAdmin} />
          </div>

          {/* Channel Content */}
          <div className="flex-1 overflow-hidden bg-social-gradient">
            {selectedChannel?.type === 'text' && (
              <ChatArea channel={selectedChannel} />
            )}
            {selectedChannel?.type === 'voice' && (
              <VoiceChannel channel={selectedChannel} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
