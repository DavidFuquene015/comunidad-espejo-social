import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  const GEMINI_API_KEY = "AIzaSyDvmz-PUx0fy7iGRCbNVKEJyyZPHIWReiA";
  const WS_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;
  
  let geminiSocket: WebSocket | null = null;

  socket.onopen = () => {
    console.log("Client connected to relay");
    
    // Connect to Gemini Live API
    geminiSocket = new WebSocket(WS_URL);
    
    geminiSocket.onopen = () => {
      console.log("Connected to Gemini Live API");
      
      // Send setup message
      const setupMessage = {
        setup: {
          model: "models/gemini-2.5-flash-native-audio-preview-09-2025",
          generation_config: {
            response_modalities: ["AUDIO"],
            speech_config: {
              voice_config: {
                prebuilt_voice_config: {
                  voice_name: "Aoede"
                }
              }
            }
          },
          system_instruction: {
            parts: [{
              text: "Eres FLORTE, un asistente inteligente de una red social estudiantil del SENA. Ayudas a los estudiantes con sus consultas de forma amable y profesional."
            }]
          }
        }
      };
      
      geminiSocket?.send(JSON.stringify(setupMessage));
    };
    
    geminiSocket.onmessage = (event) => {
      // Forward Gemini responses to client
      socket.send(event.data);
    };
    
    geminiSocket.onerror = (error) => {
      console.error("Gemini WebSocket error:", error);
      socket.send(JSON.stringify({ error: "Error connecting to Gemini" }));
    };
    
    geminiSocket.onclose = () => {
      console.log("Gemini WebSocket closed");
      socket.close();
    };
  };

  socket.onmessage = (event) => {
    // Forward client messages to Gemini
    if (geminiSocket && geminiSocket.readyState === WebSocket.OPEN) {
      geminiSocket.send(event.data);
    }
  };

  socket.onclose = () => {
    console.log("Client disconnected");
    geminiSocket?.close();
  };

  socket.onerror = (error) => {
    console.error("Client WebSocket error:", error);
    geminiSocket?.close();
  };

  return response;
});
