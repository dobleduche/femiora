
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import PremiumInsightCard from './PremiumInsightCard';
import { RefreshIcon } from '../icons/Icons';
import type { Reflection } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

const AIPoweredInsights: React.FC = () => {
  const { logs: userLogs, reflections, saveReflections } = useUser();
  const [insights, setInsights] = useState<Reflection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const manageInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setInsights([]);

    // 1. Check for recent, persisted insights
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentReflections = reflections.filter(r => new Date(r.dateGenerated) >= sevenDaysAgo);

    if (recentReflections.length > 0) {
      setInsights(recentReflections);
      setIsLoading(false);
      return;
    }

    // 2. If no recent insights, generate new ones
    const recentLogs = userLogs
      .filter(log => new Date(log.date) >= sevenDaysAgo)
      .filter(log => log.mood || log.sleep || log.note || (log.sensations && log.sensations.length > 0));

    if (recentLogs.length < 3) {
      setError("Keep logging your experiences for a few more days, and new insights will appear here.");
      setIsLoading(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const userDataString = JSON.stringify(recentLogs, null, 2);

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a wellness pattern analyst for Femiora. Your role is to be educational, pattern-based, and reflective.
        **CRITICAL: Do NOT diagnose or treat. Keep insights observational and gentle.**
        Analyze the following user data from the last 7 days and generate two concise, gentle insights about potential connections or patterns. Frame them as observations for the user to consider, not as definitive statements.
        At the end of your description for each insight, add a sentence like "Your feedback on these insights helps me learn what's most helpful for you."
        Data:\n${userDataString}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                trend: { type: Type.STRING, enum: ['improving', 'stable', 'declining'] },
              },
              required: ["title", "description", "confidence", "trend"],
            },
          },
        },
      });

      if (response.text) {
        const parsedInsights = JSON.parse(response.text);
        // 3. Save the newly generated insights
        await saveReflections(parsedInsights);
      } else {
        throw new Error("Received an empty response from the AI.");
      }
    } catch (e) {
      console.error(e);
      setError("We couldn't generate insights at this moment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userLogs, reflections, saveReflections]);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setError("This feature is currently unavailable due to a configuration issue.");
      setIsLoading(false);
      return;
    }
    manageInsights();
  }, [manageInsights]);

  // Effect to update local state when context changes (after saving)
  useEffect(() => {
    setInsights(reflections);
  }, [reflections]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-dusk-surface p-6 rounded-2xl border border-gray-100 dark:border-transparent shadow-soft animate-pulse">
            <div className="h-5 bg-gray-200 dark:bg-dusk-bg rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-dusk-bg rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-dusk-bg rounded w-5/6 mb-4"></div>
            <div className="flex justify-between items-center">
                <div className="h-5 bg-gray-200 dark:bg-dusk-bg rounded w-1/4"></div>
                <div className="h-5 bg-gray-200 dark:bg-dusk-bg rounded w-1/3"></div>
            </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isRetryable = error.includes("couldn't generate");
    return (
        <div className={`p-6 rounded-2xl flex flex-col items-center justify-center text-center ${isRetryable ? 'bg-red-50 dark:bg-red-500/10 border border-red-200 text-red-800 dark:text-red-300' : 'bg-gray-50 dark:bg-dusk-surface border border-gray-200 dark:border-dusk-surface text-gray-600 dark:text-dusk-text-muted'}`}>
            <p className="mb-4">{error}</p>
            {isRetryable && (
              <button 
                  onClick={manageInsights}
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-red-300 bg-white hover:bg-red-50 transition-colors"
              >
                  <RefreshIcon className="w-4 h-4" />
                  Try Again
              </button>
            )}
        </div>
    );
  }

  return (
    <div className="space-y-4">
      {insights.length > 0 ? insights.map((insight) => (
        <PremiumInsightCard
          key={insight.id}
          insight={insight}
        />
      )) : (
        <div className="bg-gray-50 dark:bg-dusk-surface border border-gray-200 dark:border-dusk-surface text-gray-600 dark:text-dusk-text-muted p-6 rounded-2xl text-center">
            <p>Your new insights will appear here once you've logged a few more entries.</p>
        </div>
      )}
    </div>
  );
};

export default AIPoweredInsights;
