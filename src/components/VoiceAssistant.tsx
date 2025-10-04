import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AudioRecorder, encodeAudioForAPI, playAudioData, clearAudioQueue } from '@/utils/RealtimeAudio';

export const VoiceAssistant = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [transcript, setTranscript] = useState('');

  const startConversation = async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Initialize audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });

      // Connect to WebSocket
      const ws = new WebSocket('wss://bfulrloxjoyaiuygmdgx.supabase.co/functions/v1/realtime-voice');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[Client] Connected to voice assistant');
        setIsConnected(true);
        toast({
          title: 'Voice Assistant Active',
          description: 'Start speaking to get farming advice!',
        });

        // Start recording
        recorderRef.current = new AudioRecorder((audioData) => {
          if (ws.readyState === WebSocket.OPEN) {
            const encoded = encodeAudioForAPI(audioData);
            ws.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: encoded
            }));
          }
        });
        recorderRef.current.start();
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('[Client] Event:', data.type);

        switch (data.type) {
          case 'response.audio.delta':
            setIsSpeaking(true);
            const binaryString = atob(data.delta);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            if (audioContextRef.current) {
              await playAudioData(audioContextRef.current, bytes);
            }
            break;

          case 'response.audio.done':
            setIsSpeaking(false);
            break;

          case 'input_audio_buffer.speech_started':
            setIsListening(true);
            break;

          case 'input_audio_buffer.speech_stopped':
            setIsListening(false);
            break;

          case 'conversation.item.input_audio_transcription.completed':
            if (data.transcript) {
              setTranscript(prev => prev + '\n🎤 You: ' + data.transcript);
            }
            break;

          case 'response.audio_transcript.delta':
            if (data.delta) {
              setTranscript(prev => {
                if (!prev.endsWith('🤖 Assistant: ')) {
                  return prev + '\n🤖 Assistant: ' + data.delta;
                }
                return prev + data.delta;
              });
            }
            break;

          case 'error':
            console.error('[Client] Error:', data.error);
            toast({
              title: 'Error',
              description: data.error.message,
              variant: 'destructive',
            });
            break;
        }
      };

      ws.onerror = (error) => {
        console.error('[Client] WebSocket error:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to voice assistant',
          variant: 'destructive',
        });
      };

      ws.onclose = () => {
        console.log('[Client] Disconnected');
        setIsConnected(false);
        setIsSpeaking(false);
        setIsListening(false);
      };

    } catch (error) {
      console.error('[Client] Error starting conversation:', error);
      toast({
        title: 'Microphone Access Required',
        description: 'Please allow microphone access to use voice assistant',
        variant: 'destructive',
      });
    }
  };

  const endConversation = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    clearAudioQueue();
    setIsConnected(false);
    setIsSpeaking(false);
    setIsListening(false);
    setTranscript('');
  };

  useEffect(() => {
    return () => {
      endConversation();
    };
  }, []);

  return (
    <div className="fixed bottom-24 right-8 z-50 flex flex-col items-end gap-4">
      {transcript && isConnected && (
        <div className="bg-background border border-border rounded-lg p-4 max-w-md max-h-64 overflow-y-auto shadow-lg">
          <div className="text-sm whitespace-pre-wrap">{transcript}</div>
        </div>
      )}
      
      <div className="flex flex-col items-center gap-2">
        {!isConnected ? (
          <Button
            onClick={startConversation}
            size="lg"
            className="rounded-full h-16 w-16 shadow-xl"
          >
            <Mic className="h-6 w-6" />
          </Button>
        ) : (
          <>
            <div className="flex items-center gap-2">
              {isSpeaking && (
                <div className="flex items-center gap-1 text-sm text-primary animate-pulse">
                  <Volume2 className="h-4 w-4" />
                  Speaking...
                </div>
              )}
              {isListening && !isSpeaking && (
                <div className="flex items-center gap-1 text-sm text-green-600 animate-pulse">
                  <Mic className="h-4 w-4" />
                  Listening...
                </div>
              )}
            </div>
            <Button
              onClick={endConversation}
              size="lg"
              variant="destructive"
              className="rounded-full h-16 w-16 shadow-xl"
            >
              <MicOff className="h-6 w-6" />
            </Button>
          </>
        )}
        <p className="text-xs text-muted-foreground">
          {isConnected ? 'Tap to end' : 'Voice Assistant'}
        </p>
      </div>
    </div>
  );
};
