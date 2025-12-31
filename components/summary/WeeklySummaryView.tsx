
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { HomeIcon, SparkleIcon, RefreshIcon } from '../icons/Icons';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';

const WeeklySummaryView: React.FC = () => {
  const { logs: userLogs } = useUser();
  const { navigate } = useApp();
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weeklyLogs = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return userLogs.filter(log => new Date(log.date) >= sevenDaysAgo);
  }, [userLogs]);

  const generateSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);

    if (weeklyLogs.length < 2) {
      setError("Log for at least 2 days this week to generate your summary.");
      setIsLoading(false);
      return;
    }

    try {
      if (!process.env.API_KEY) throw new Error("API key not configured.");
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const userDataString = JSON.stringify(weeklyLogs);

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are the Femiora Guide. Analyze the user's wellness data from the last 7 days and create a gentle, reflective summary in Markdown format.
        **HARD GUARDRAILS:**
        - **Do not diagnose or treat; keep it observational and reflective.**
        - **NEVER be prescriptive.** Frame everything as an observation for the user to interpret.

        **Instructions:**
        - Start with a warm, encouraging opening.
        - Summarize the week's key themes in moods, symptoms, and sleep patterns factually and gently.
        - Conclude with one open-ended, non-judgmental question to encourage the user's own reflection.
        
        **User Data:** ${userDataString}`,
      });

      setSummary(response.text);
    } catch (e) {
      console.error(e);
      setError("Couldn't generate summary. The AI might be busy. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [weeklyLogs]);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setError("This feature is currently unavailable due to a configuration issue.");
      setIsLoading(false);
      return;
    }
    generateSummary();
  }, [generateSummary]);

  return (
    <div className="min-h-screen bg-paper-white/80 dark:bg-dusk-bg/80 pb-8">
      <header className="bg-white/80 dark:bg-dusk-surface/80 backdrop-blur-sm border-b border-gray-100 dark:border-dusk-surface sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif text-gray-800 dark:text-dusk-text">Weekly Reflection</h1>
            <p className="text-sm text-gray-500 dark:text-dusk-text-muted">Your AI-powered summary for the last 7 days.</p>
          </div>
          <button onClick={() => navigate('home')} className="flex items-center gap-2 text-sm px-3 py-2 rounded-full border border-gray-200 dark:border-dusk-text-muted/20 bg-white dark:bg-dusk-surface hover:bg-gray-50 dark:hover:bg-dusk-bg transition-colors">
            <HomeIcon className="w-5 h-5 text-gray-600 dark:text-dusk-text-muted" />
          </button>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-dusk-surface p-6 md:p-8 rounded-2xl shadow-soft border border-gray-100 dark:border-transparent">
          {isLoading && (
            <div className="animate-pulse space-y-4">
              <div className="h-5 bg-gray-200 dark:bg-dusk-bg rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-dusk-bg rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-dusk-bg rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-dusk-bg rounded w-full mt-4"></div>
            </div>
          )}
          {error && (
            <div className="text-center text-red-700 dark:text-red-400 p-8 rounded-lg bg-red-50 dark:bg-red-500/10">
              <p className="mb-4">{error}</p>
              {error.includes("try again") && (
                <button onClick={generateSummary} className="flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-red-300 dark:border-red-400/50 bg-white dark:bg-transparent hover:bg-red-50/50 dark:hover:bg-red-500/20 transition-colors">
                  <RefreshIcon className="w-4 h-4" />
                  Try Again
                </button>
              )}
            </div>
          )}
          {summary && !isLoading && (
            <div className="prose prose-sm max-w-none prose-h2:font-serif prose-h2:text-gray-800 prose-p:text-gray-600 prose-strong:text-gray-700 dark:prose-p:text-dusk-text-muted dark:prose-strong:text-dusk-text">
              <div dangerouslySetInnerHTML={{ __html: summary.replace(/## (.*?)\n/g, '<h2>$1</h2>') }} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WeeklySummaryView;
