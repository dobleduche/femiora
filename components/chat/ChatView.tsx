
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { HomeIcon, SparkleIcon, ArrowRightIcon } from '../icons/Icons';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const ChatView: React.FC = () => {
  const { logs: userLogs } = useUser();
  const { navigate } = useApp();
  const [chat, setChat] = useState<Chat | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = () => {
        if (!process.env.API_KEY) {
            setError("This feature is currently unavailable due to a configuration issue.");
            return;
        }
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const recentLogs = userLogs.slice(-14); // Use last 14 days of logs for context
            const contextMessage = `You are Ora, Femiora's pattern companion. Your purpose is to help users connect dots across cycle timing, mood, sleep, stress, environment, digestion/skin/energy, and daily inputs—without predicting, diagnosing, or treating.
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
            
            const chatSession = ai.chats.create({
                model: 'gemini-3-flash-preview',
                config: { systemInstruction: contextMessage },
            });
            setChat(chatSession);
        } catch (e) {
            console.error(e);
            setError("Could not start the AI guide. Please try again later.");
        }
    };
    initChat();
  }, [userLogs]);

  useEffect(() => {
    // Scroll to bottom when history changes
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || !chat || isLoading) return;

    const text = userInput;
    setUserInput('');
    setIsLoading(true);
    
    setHistory(prev => [...prev, { role: 'user', text }]);
    
    try {
      const stream = await chat.sendMessageStream({ message: text });
      let modelResponse = '';
      setHistory(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of stream) {
        modelResponse += chunk.text ?? '';
        setHistory(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1].text = modelResponse;
            return newHistory;
        });
      }
    } catch (e) {
      console.error(e);
      setError("The AI guide couldn't respond. Please try again.");
      setHistory(prev => prev.slice(0,-1)); // remove empty model message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-white/80 flex flex-col pb-24 md:pb-0">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif text-gray-800">AI Insight Companion</h1>
            <p className="text-sm text-gray-500">Your reflective guide for patterns and shifts.</p>
          </div>
          <button 
            onClick={() => navigate('home')}
            className="md:hidden flex items-center gap-2 text-sm px-3 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <HomeIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>
      
      <main ref={chatContainerRef} className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-4 overflow-y-auto">
        {history.length === 0 && !isLoading && !error && (
            <div className="text-center text-gray-600 p-8 bg-white rounded-2xl shadow-soft border border-gray-100">
                <SparkleIcon className="w-12 h-12 text-calm-sage mx-auto mb-4"/>
                <h2 className="text-xl font-serif text-gray-800">Hello, I'm your Femiora companion.</h2>
                <p className="mt-2">Feel free to ask about patterns you're noticing or anything on your mind. For example, you could ask, \"Is there a link between my tension and sleep?\"</p>
            </div>
        )}
        {history.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg p-3 rounded-2xl ${msg.role === 'user' ? 'bg-calm-sage text-white' : 'bg-white shadow-soft'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
         {isLoading && (
            <div className="flex justify-start">
                <div className="max-w-lg p-3 rounded-2xl bg-white shadow-soft flex items-center space-x-2">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-0"></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-150"></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-300"></span>
                </div>
            </div>
        )}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </main>

      <footer className="sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-100 pb-24 md:pb-0">
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-soft p-1">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about your patterns..."
                    className="flex-1 w-full bg-transparent px-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none"
                    disabled={isLoading || !chat || !!error}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !userInput.trim() || !chat || !!error}
                    className="p-2 rounded-full bg-calm-sage text-white disabled:bg-gray-300 transition-colors"
                >
                    <ArrowRightIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatView;
