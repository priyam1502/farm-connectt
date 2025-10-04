import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected websocket", { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.onopen = async () => {
    console.log("[Server] WebSocket connection opened");
    
    try {
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured');
      }

      // Connect to OpenAI Realtime API
      const openaiWs = new WebSocket(
        'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01',
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'OpenAI-Beta': 'realtime=v1'
          }
        }
      );

      let sessionCreated = false;

      openaiWs.onopen = () => {
        console.log("[OpenAI] Connected to OpenAI Realtime API");
      };

      openaiWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("[OpenAI] Event type:", data.type);

        // Send session.update after session.created
        if (data.type === 'session.created' && !sessionCreated) {
          sessionCreated = true;
          console.log("[OpenAI] Session created, sending configuration");
          
          const sessionConfig = {
            type: 'session.update',
            session: {
              modalities: ['text', 'audio'],
              instructions: 'You are a helpful farming assistant for Farm-Connect, a marketplace connecting Indian farmers with buyers. Help farmers with:\n- Crop pricing and market information\n- Best selling times for their produce\n- Connecting with buyers\n- Agricultural best practices\n\nYou can speak in Hindi, English, and understand regional Indian languages. Be supportive, simple, and practical in your advice.',
              voice: 'alloy',
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              input_audio_transcription: {
                model: 'whisper-1'
              },
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 1000
              },
              temperature: 0.8,
              max_response_output_tokens: 4096
            }
          };
          
          openaiWs.send(JSON.stringify(sessionConfig));
        }

        // Forward all messages to client
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(event.data);
        }
      };

      openaiWs.onerror = (error) => {
        console.error("[OpenAI] WebSocket error:", error);
        socket.close();
      };

      openaiWs.onclose = () => {
        console.log("[OpenAI] Connection closed");
        socket.close();
      };

      // Forward client messages to OpenAI
      socket.onmessage = (event) => {
        if (openaiWs.readyState === WebSocket.OPEN) {
          openaiWs.send(event.data);
        }
      };

      socket.onclose = () => {
        console.log("[Server] Client disconnected");
        openaiWs.close();
      };

    } catch (error) {
      console.error("[Server] Error:", error);
      socket.close();
    }
  };

  return response;
});
