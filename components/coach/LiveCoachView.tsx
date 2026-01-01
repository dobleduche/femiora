
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { HomeIcon, MicIcon } from '../icons/Icons';
import { encode, decode, decodeAudioData } from '../../utils/audio';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error' | 'closed';
type TranscriptItem = { role: 'user' | 'model'; text: string };

const LiveCoachView: React.FC = () => {
  const { logs: userLogs } = useUser();
  const { navigate } = useApp();
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<Promise<LiveSession> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (!process.env.API_KEY) {
        setError("This feature is currently unavailable due to a configuration issue.");
        setConnectionState('error');
    }
  }, []);

  const processAudio = useCallback((audioProcessingEvent: AudioProcessingEvent) => {
    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
    const l = inputData.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = inputData[i] * 32768;
    }
    const pcmBlob: Blob = {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
    sessionRef.current?.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
    });
  }, []);

  const stopConversation = useCallback(() => {
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    if (sourceRef.current && processorRef.current) {
        sourceRef.current.disconnect(processorRef.current);
        processorRef.current.disconnect(inputAudioContextRef.current!.destination);
    }
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    sessionRef.current?.then(session => session.close());
    setConnectionState('closed');
  }, []);

  const startConversation = useCallback(async () => {
    setConnectionState('connecting');
    setError(null);
    setTranscript([]);

    try {
        if (!process.env.API_KEY) throw new Error("API Key not found.");
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        const recentLogs = userLogs.slice(-14);
        const systemInstruction = `You are Ora, Femiora's pattern companion. Your purpose is to help users connect dots across cycle timing, mood, sleep, stress, environment, digestion/skin/energy, and daily inputs—without predicting, diagnosing, or treating.
Femiora’s stance: “Some apps predict. Femiora tracks what’s real—because life moves the calendar.”

Voice and tone:
- Feminine, grounded, calm, compassionate
- Honest without harshness
- Short paragraphs, clean language, no lectures
- Light poetic touch (“We follow the pattern, not the panic.”)
- Never shames, never judges, never assumes

Every response follows the 3-step contract in order:
1) Mirror: validate emotion + dignity (“That sounds heavy. You’re not imagining it.”)
2) Map: reflect possible patterns using user logs + timing + context (neutral, observational)
3) Move: one small next step inside Femiora (log, tag, journal, review insight)

Allowed topics:
- Cycle tracking education (plain language)
- Perimenopause/menopause as a life season framed as: “many people report…”
- Mood/energy/sleep patterns and variability
- Stress/environment impact on timing and symptoms
- Food/hydration/movement as neutral variables to track, never as morality
- App guidance: logs, tags, reminders, insights, summaries, exports

Hard guardrails (never do these):
- Diagnose or confirm conditions
- Treat/prescribe/recommend meds, supplements, or protocols
- Weight-loss coaching or body-size talk
- Promise outcomes
- Claim personal lived experience

Required safe redirect if user pushes:
“I can’t diagnose or treat. I can help you track patterns and build a clear summary for a licensed clinician.”

Honest but compassionate rules:
- No judgment words
- No assumptions about body, habits, or motivation
- Replace “should” with options
- Truth = observations + patterns, not moral commentary
- Keep agency with the user

Lab Literacy Mode (only if user posts labs or asks):
- Lead disclaimer must be first: “Quick note: I’m not a medical provider and I can’t diagnose or clinically interpret labs. I can explain what this test generally means using reputable public references, and help you track patterns in Femiora so you can discuss it clearly with a licensed clinician.”
- Define the marker, explain variability, note hormone tests often aren’t needed and can fluctuate
- Suggest tracking around the lab date; offer clinician question prompts (non-treatment)
- No confirmation, no clinical interpretation, no urgent triage beyond “seek urgent care”
- If the screenshot is incomplete, ask only: “Can you share the test name, your value, the unit, and the reference range shown on the report?”
- Include reputable sources and end with a short Sources list

Emergency escalation:
If user mentions red flags (chest pain, fainting, heavy bleeding soaking pads hourly, suicidal thoughts, one-sided weakness, severe allergic reaction), be brief, supportive, urge urgent professional help/emergency services, and stop.

Here is a summary of the user's recent logs to get you started: ${JSON.stringify(recentLogs)}`;

        let currentInput = '';
        let currentOutput = '';

        sessionRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                systemInstruction,
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            },
            callbacks: {
                onopen: async () => {
                    setConnectionState('connected');
                    mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                    sourceRef.current = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current);
                    processorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    processorRef.current.onaudioprocess = processAudio;
                    sourceRef.current.connect(processorRef.current);
                    processorRef.current.connect(inputAudioContextRef.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        currentInput += message.serverContent.inputTranscription.text;
                    }
                    if (message.serverContent?.outputTranscription) {
                        currentOutput += message.serverContent.outputTranscription.text;
                    }
                    if (message.serverContent?.turnComplete) {
                        if (currentInput.trim()) setTranscript(prev => [...prev, { role: 'user', text: currentInput.trim() }]);
                        if (currentOutput.trim()) setTranscript(prev => [...prev, { role: 'model', text: currentOutput.trim() }]);
                        currentInput = '';
                        currentOutput = '';
                    }

                    const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (audioData && outputAudioContextRef.current) {
                        const outCtx = outputAudioContextRef.current;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
                        const audioBuffer = await decodeAudioData(decode(audioData), outCtx, 24000, 1);
                        const source = outCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outCtx.destination);
                        source.addEventListener('ended', () => sourcesRef.current.delete(source));
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        sourcesRef.current.add(source);
                    }
                },
                onerror: (e) => { console.error(e); setConnectionState('error'); setError("A connection error occurred."); stopConversation(); },
                onclose: () => { setConnectionState('closed'); },
            },
        });
    } catch (error) {
        console.error("Failed to start conversation:", error);
        setConnectionState('error');
    }
  }, [userLogs, processAudio, stopConversation]);

  useEffect(() => {
    return () => stopConversation();
  }, [stopConversation]);

  const buttonText = {
    idle: 'Start Live Session',
    connecting: 'Connecting...',
    connected: 'End Session',
    error: 'Retry Session',
    closed: 'Start New Session'
  }[connectionState];

  return (
    <div className="min-h-screen bg-paper-white/80 dark:bg-dusk-bg/80 flex flex-col">
        <header className="bg-white/80 dark:bg-dusk-surface/80 backdrop-blur-sm border-b border-gray-100 dark:border-dusk-surface sticky top-0 z-20">
            <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-serif text-gray-800 dark:text-dusk-text">Live AI Coach</h1>
                    <p className="text-sm text-gray-500 dark:text-dusk-text-muted">Speak with your personal wellness guide.</p>
                </div>
                <button onClick={() => navigate('home')} className="flex items-center gap-2 text-sm px-3 py-2 rounded-full border border-gray-200 dark:border-dusk-text-muted/20 bg-white dark:bg-dusk-surface hover:bg-gray-50 dark:hover:bg-dusk-bg transition-colors">
                    <HomeIcon className="w-5 h-5 text-gray-600 dark:text-dusk-text-muted" />
                </button>
            </div>
        </header>
        <main className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full p-4">
            <div className="flex-1 space-y-4 overflow-y-auto p-4 bg-white dark:bg-dusk-surface rounded-2xl shadow-soft border border-gray-100 dark:border-transparent">
                {transcript.map((item, index) => (
                    <div key={index} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-lg p-3 rounded-2xl ${item.role === 'user' ? 'bg-calm-sage text-white' : 'bg-gray-100 dark:bg-dusk-bg text-gray-800 dark:text-dusk-text'}`}>
                            <p className="text-sm whitespace-pre-wrap">{item.text}</p>
                        </div>
                    </div>
                ))}
                 {transcript.length === 0 && connectionState !== 'connected' && (
                    <div className="text-center text-gray-500 dark:text-dusk-text-muted h-full flex flex-col justify-center items-center">
                        {error ? (
                            <p className="text-red-500">{error}</p>
                        ) : (
                            <p>Tap the microphone to start a conversation with your AI guide.</p>
                        )}
                    </div>
                 )}
            </div>
            <div className="pt-8 text-center">
                <button
                    onClick={connectionState === 'connected' ? stopConversation : startConversation}
                    className={`relative w-20 h-20 rounded-full text-white transition-all duration-300 flex items-center justify-center shadow-lg ${connectionState === 'connected' ? 'bg-red-500 hover:bg-red-600' : 'bg-calm-sage hover:bg-calm-sage/90'} disabled:bg-gray-400`}
                    disabled={connectionState === 'connecting' || (connectionState === 'error' && !!error && !error.includes("connection error"))}
                >
                    <MicIcon className="w-8 h-8"/>
                    {connectionState === 'connected' && <div className="absolute inset-0 rounded-full border-4 border-white/50 animate-pulse"></div>}
                </button>
                <p className="text-sm text-gray-600 dark:text-dusk-text-muted mt-4">{buttonText}</p>
            </div>
        </main>
    </div>
  );
};

export default LiveCoachView;
