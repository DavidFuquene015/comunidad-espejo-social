
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Hash, Volume2, Plus, Settings } from 'lucide-react';
import CreateChannelModal from './CreateChannelModal';

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

interface GroupSidebarProps {
  group: Group;
  channels: Channel[];
  selectedChannel: Channel | null;
  onChannelSelect: (channel: Channel) => void;
  isUserAdmin: boolean;
  onChannelCreated: () => void;
}

const GroupSidebar = ({ 
  group, 
  channels, 
  selectedChannel, 
  onChannelSelect, 
  isUserAdmin,
  onChannelCreated 
}: GroupSidebarProps) => {
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);

  const textChannels = channels.filter(c => c.type === 'text');
  const voiceChannels = channels.filter(c => c.type === 'voice');

  return (
    <div className="w-60 bg-gray-900/50 backdrop-blur-sm border-r border-white/20 flex flex-col">
      {/* Group Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold truncate">{group.name}</h2>
          {isUserAdmin && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:bg-white/10"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
        <p className="text-white/60 text-sm mt-1 truncate">{group.description}</p>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Text Channels */}
        <div className="mb-4">
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            <span className="text-white/70 text-xs font-semibold uppercase">
              Canales de Texto
            </span>
            {isUserAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCreateChannelModalOpen(true)}
                className="w-4 h-4 text-white/70 hover:bg-white/10"
              >
                <Plus className="w-3 h-3" />
              </Button>
            )}
          </div>
          {textChannels.map((channel) => (
            <Button
              key={channel.id}
              variant="ghost"
              onClick={() => onChannelSelect(channel)}
              className={`w-full justify-start px-2 py-1 h-8 text-white/80 hover:bg-white/10 ${
                selectedChannel?.id === channel.id ? 'bg-white/20' : ''
              }`}
            >
              <Hash className="w-4 h-4 mr-2" />
              <span className="truncate">{channel.name}</span>
            </Button>
          ))}
        </div>

        {/* Voice Channels */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            <span className="text-white/70 text-xs font-semibold uppercase">
              Canales de Voz
            </span>
            {isUserAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCreateChannelModalOpen(true)}
                className="w-4 h-4 text-white/70 hover:bg-white/10"
              >
                <Plus className="w-3 h-3" />
              </Button>
            )}
          </div>
          {voiceChannels.map((channel) => (
            <Button
              key={channel.id}
              variant="ghost"
              onClick={() => onChannelSelect(channel)}
              className={`w-full justify-start px-2 py-1 h-8 text-white/80 hover:bg-white/10 ${
                selectedChannel?.id === channel.id ? 'bg-white/20' : ''
              }`}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              <span className="truncate">{channel.name}</span>
            </Button>
          ))}
        </div>
      </div>

      <CreateChannelModal
        isOpen={isCreateChannelModalOpen}
        onClose={() => setIsCreateChannelModalOpen(false)}
        groupId={group.id}
        onChannelCreated={() => {
          setIsCreateChannelModalOpen(false);
          onChannelCreated();
        }}
      />
    </div>
  );
};

export default GroupSidebar;
