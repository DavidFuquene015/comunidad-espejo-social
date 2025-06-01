
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  description: string;
}

interface VoiceChannelProps {
  channel: Channel;
}

const VoiceChannel = ({ channel }: VoiceChannelProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const connect = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      });
      
      localStreamRef.current = stream;
      
      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });
      
      peerConnectionRef.current = peerConnection;
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
      
      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };
      
      setIsConnected(true);
      setConnectedUsers(prev => [...prev, user?.id || '']);
      
      toast({
        title: "Conectado",
        description: `Te has conectado al canal de voz ${channel.name}`,
      });
      
    } catch (error) {
      console.error('Error connecting to voice channel:', error);
      toast({
        title: "Error",
        description: "No se pudo conectar al canal de voz. Verifica tus permisos de micrófono.",
        variant: "destructive",
      });
    }
  };

  const disconnect = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    setIsConnected(false);
    setIsMuted(false);
    setIsDeafened(false);
    setConnectedUsers(prev => prev.filter(id => id !== user?.id));
    
    toast({
      title: "Desconectado",
      description: `Te has desconectado del canal de voz ${channel.name}`,
    });
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleDeafen = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !remoteAudioRef.current.muted;
      setIsDeafened(remoteAudioRef.current.muted);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <audio ref={localAudioRef} autoPlay muted />
      <audio ref={remoteAudioRef} autoPlay />
      
      <div className="text-center mb-8">
        <Volume2 className="w-16 h-16 text-white/50 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">🔊 {channel.name}</h2>
        <p className="text-white/70">
          {channel.description || 'Canal de comunicación por voz'}
        </p>
      </div>

      {!isConnected ? (
        <div className="text-center">
          <p className="text-white/80 mb-6">
            Conectarte al canal de voz te permitirá hablar con otros miembros en tiempo real.
          </p>
          <Button
            onClick={connect}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg"
          >
            <Mic className="w-5 h-5 mr-2" />
            Conectarse
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <p className="text-white/80 mb-4">
              Conectado al canal de voz
            </p>
            <div className="text-green-400 text-sm">
              🟢 Conectado • {connectedUsers.length} usuario(s)
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              onClick={toggleMute}
              variant={isMuted ? "destructive" : "secondary"}
              size="lg"
              className={isMuted ? "bg-red-500 hover:bg-red-600" : "bg-white/20 hover:bg-white/30"}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>

            <Button
              onClick={toggleDeafen}
              variant={isDeafened ? "destructive" : "secondary"}
              size="lg"
              className={isDeafened ? "bg-red-500 hover:bg-red-600" : "bg-white/20 hover:bg-white/30"}
            >
              {isDeafened ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>

            <Button
              onClick={disconnect}
              variant="destructive"
              size="lg"
              className="bg-red-500 hover:bg-red-600"
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>

          <div className="mt-6 text-white/60 text-sm">
            <p>Usa los controles para silenciar tu micrófono o audio</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceChannel;
