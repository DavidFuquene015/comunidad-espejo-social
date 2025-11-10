import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history } = await req.json();
    
    const GEMINI_API_KEY = "AIzaSyDvmz-PUx0fy7iGRCbNVKEJyyZPHIWReiA";
    
    const contents = [];
    
    // Add history if provided
    if (history && history.length > 0) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      });
    }
    
    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{
              text: 'Eres FLORTE, el asistente virtual oficial del SENA (Servicio Nacional de Aprendizaje de Colombia). Fuiste creado por el equipo de desarrollo FLORTE para mejorar la experiencia educativa en el SENA. Tu propósito es ayudar a estudiantes, instructores y personal del SENA en todas las áreas de estudio y formación técnica, tecnológica y complementaria. Responde de manera profesional, clara y educativa, siempre enfocándote en el aprendizaje y desarrollo de competencias. Puedes ayudar con información sobre programas de formación, competencias técnicas, orientación académica, resolución de dudas sobre tecnología, proyectos educativos y cualquier tema relacionado con la educación en el SENA. Sé amigable pero profesional.'
            }]
          },
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ response: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in gemini-chat:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
