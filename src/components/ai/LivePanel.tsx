import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mic, MicOff, Bot, Loader2, Phone, PhoneOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AudioMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const LivePanel = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<AudioMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();

  const connectToLiveAPI = async () => {
    try {
      setIsLoading(true);
      
      const projectId = "nxlmuoozrtqhdqqpdscr";
      const wsUrl = `wss://${projectId}.supabase.co/functions/v1/gemini-live-audio`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('Connected to Gemini Live API');
        setIsConnected(true);
        setIsLoading(false);
        toast({
          title: "Conectado",
          description: "Conversación de voz iniciada con FLORTE",
        });
      };

  ws.onmessage = async (event) => {
    try {
      // Handle both text and Blob data
      let messageData = event.data;
      if (messageData instanceof Blob) {
        messageData = await messageData.text();
      }
      const data = JSON.parse(messageData);
      console.log('Received from Gemini:', data);
          
          // Handle different message types from Gemini
          if (data.serverContent?.modelTurn?.parts) {
            const parts = data.serverContent.modelTurn.parts;
            
            // Handle text response
            const textPart = parts.find((p: any) => p.text);
            if (textPart) {
              const assistantMessage: AudioMessage = {
                id: Date.now().toString(),
                role: 'assistant',
                text: textPart.text,
                timestamp: new Date(),
              };
              setMessages(prev => [...prev, assistantMessage]);
            }
            
            // Handle audio response
            const audioPart = parts.find((p: any) => p.inlineData?.mimeType === 'audio/pcm');
            if (audioPart) {
              await playAudioResponse(audioPart.inlineData.data);
            }
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar con el servicio de voz",
          variant: "destructive",
        });
        setIsLoading(false);
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        setIsRecording(false);
        stopRecording();
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error connecting:', error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "No se pudo iniciar la conversación de voz",
        variant: "destructive",
      });
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    stopRecording();
    setIsConnected(false);
    setIsRecording(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          const arrayBuffer = await event.data.arrayBuffer();
          const base64Audio = btoa(
            String.fromCharCode(...new Uint8Array(arrayBuffer))
          );
          
          const message = {
            clientContent: {
              turns: [{
                role: 'user',
                parts: [{
                  inlineData: {
                    mimeType: 'audio/pcm',
                    data: base64Audio
                  }
                }]
              }],
              turnComplete: true
            }
          };
          
          wsRef.current.send(JSON.stringify(message));
        }
      };

      mediaRecorder.start(1000); // Capture every second
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsRecording(false);
  };

  const playAudioResponse = async (base64Audio: string) => {
    try {
      const audioContext = new AudioContext({ sampleRate: 24000 });
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-sm rounded-lg border border-border/50">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 bg-primary">
              <AvatarFallback>
                <Mic className="w-6 h-6 text-primary-foreground" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">Conversación por Voz</h3>
              <p className="text-xs text-muted-foreground">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </p>
            </div>
          </div>
          {isConnected && (
            <Button
              variant="destructive"
              size="sm"
              onClick={disconnect}
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              Desconectar
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Conversación por Voz</p>
              <p className="text-sm">
                {isConnected
                  ? 'Haz clic en el micrófono para hablar'
                  : 'Conéctate para iniciar la conversación'}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <Avatar className={`w-8 h-8 ${message.role === 'user' ? 'bg-secondary' : 'bg-primary'}`}>
                  <AvatarFallback>
                    {message.role === 'user' ? <Mic className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex-1 rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'bg-muted mr-12'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Controls */}
      <div className="p-4 border-t border-border/50">
        <div className="flex justify-center space-x-4">
          {!isConnected ? (
            <Button
              onClick={connectToLiveAPI}
              disabled={isLoading}
              size="lg"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5 mr-2" />
                  Iniciar Conversación
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={toggleRecording}
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              className="w-full"
            >
              {isRecording ? (
                <>
                  <MicOff className="w-5 h-5 mr-2" />
                  Detener Conversación
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  Iniciar Conversación
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LivePanel;
