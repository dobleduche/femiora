import React, { useEffect, useRef, useState } from 'react';
import { HomeIcon, SparkleIcon, ArrowRightIcon } from '../icons/Icons';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';
import { buildOraSystemPrompt } from '../../utils/oraPrompt';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

type OraChatRequest = {
  message: string;
  history: ChatMessage[];
  recentLogs: unknown[];
};

const ChatView: React.FC = () => {
  const { logs: userLogs } = useUser();
  const { navigate } = useApp();

  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const streamFromServer = async (payload: OraChatRequest) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const res = await fetch('/api/ora/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ac.signal,
    });

    if (!res.ok) {
      let msg = 'The AI guide could not respond. Please try again.';
      try {
        const data = await res.json();
        if (typeof data?.error === 'string') msg = data.error;
      } catch {
        // ignore
      }
      throw new Error(msg);
    }

    if (!res.body) {
      throw new Error('Streaming not supported in this environment.');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');

    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        setHistory(prev => {
          const next = [...prev];
          next[next.length - 1] = { role: 'model', text: next[next.length - 1].text + chunk };
          return next;
        });
      }
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    setError(null);
    const text = userInput.trim();
    setUserInput('');
    setIsLoading(true);

    // Keep the last 14 days for context
    const recentLogs = userLogs.slice(-14);

    // Snapshot history BEFORE we add the placeholder model message
    const historySnapshot = [...history];

    // Add the user message + placeholder model message for streaming
    setHistory(prev => [...prev, { role: 'user', text }, { role: 'model', text: '' }]);

    const payload: OraChatRequest = {
      message: text,
      history: historySnapshot, // send existing history only; server will append new message
      recentLogs,
    };

    try {
      await streamFromServer(payload);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "The AI guide couldn't respond. Please try again.";
      setError(msg);

      // Remove the placeholder model message if it failed
      setHistory(prev => {
        const next = [...prev];
        // If last message is model placeholder, remove it
        if (next.length > 0 && next[next.length - 1].role === 'model' && next[next.length - 1].text === '') {
          next.pop();
        }
        return next;
      });
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

      <main
        ref={chatContainerRef}
        className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-4 overflow-y-auto"
      >
        {history.length === 0 && !isLoading && !error && (
          <div className="text-center text-gray-600 p-8 bg-white rounded-2xl shadow-soft border border-gray-100">
            <SparkleIcon className="w-12 h-12 text-calm-sage mx-auto mb-4" />
            <h2 className="text-xl font-serif text-gray-800">Hello, I’m Ora.</h2>
            <p className="mt-2">
              Ask about patterns you’re noticing—sleep, mood shifts, stress, timing changes. Example: “Is there a link
              between my tension and sleep?”
            </p>
          </div>
        )}

        {history.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-lg p-3 rounded-2xl ${
                msg.role === 'user' ? 'bg-calm-sage text-white' : 'bg-white shadow-soft'
              }`}
            >
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
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about your patterns..."
              className="flex-1 w-full bg-transparent px-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none"
              disabled={isLoading || !!error}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !userInput.trim() || !!error}
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
