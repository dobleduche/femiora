
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { LightbulbIcon, RefreshIcon } from '../icons/Icons';
import { useUser } from '../../contexts/UserContext';
import usePersistentState from '../../hooks/usePersistentState';

interface Insight {
    title: string;
    insight: string;
}

interface CachedInsight {
  data: Insight;
  timestamp: number;
}

const DeepInsightCard: React.FC = () => {
  const { logs: userLogs } = useUser();
  const [insight, setInsight] = useState<Insight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cachedInsight, setCachedInsight] = usePersistentState<CachedInsight | null>('femiora-deep-insight', null);

  const generateInsight = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    if (cachedInsight && !forceRefresh && (Date.now() - cachedInsight.timestamp < oneWeek)) {
        setInsight(cachedInsight.data);
        setIsLoading(false);
        return;
    }

    if (userLogs.length < 15) {
      setError("More data is needed for a deep insight. Keep logging to unlock this feature.");
      setIsLoading(false);
      return;
    }

    try {
      if (!process.env.API_KEY) throw new Error("API key is not configured.");
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const userDataString = JSON.stringify(userLogs);

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a wellness data analyst for Femiora. Your goal is to find one unique, non-obvious, and potentially meaningful correlation or pattern from the user's entire history. This is a special "Deep Insight".
        **CRITICAL: Do NOT give medical advice. Frame it as a gentle observation.**
        Analyze the full dataset provided.
        Respond in the specified JSON format.
        The title should be short and intriguing (e.g., "A Surprising Link", "Your Weekend Pattern").
        The insight should be a concise paragraph (2-3 sentences) starting with an observation, e.g., "It looks like..." or "Here's something you may not have noticed...".
        **User's Data:**
        ${userDataString}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A short, intriguing title for the insight." },
              insight: { type: Type.STRING, description: "The concise paragraph describing the insight." }
            },
            required: ["title", "insight"]
          }
        }
      });
      
      if (response.text) {
        const newInsight = JSON.parse(response.text);
        setInsight(newInsight);
        setCachedInsight({ data: newInsight, timestamp: Date.now() });
      } else {
        throw new Error("Received an empty response from the AI.");
      }
    } catch (e) {
      console.error(e);
      setError("We couldn't generate a deep insight at this moment. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [userLogs, cachedInsight, setCachedInsight]);

  useEffect(() => {
    if (!process.env.API_KEY) {
        setError("This feature is currently unavailable due to a configuration issue.");
        setIsLoading(false);
        return;
    }
    generateInsight();
  }, [generateInsight]);

  const cardContent = () => {
    if (isLoading) {
      return (
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 dark:bg-dusk-bg rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 dark:bg-dusk-bg rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-dusk-bg rounded w-5/6 mt-2"></div>
        </div>
      );
    }

    if (error) {
      return <p className="text-sm text-center text-gray-500 dark:text-dusk-text-muted">{error}</p>;
    }

    if (insight) {
      return (
        <>
          <h3 className="font-serif text-xl text-gray-800 dark:text-dusk-text">{insight.title}</h3>
          <p className="text-gray-600 dark:text-dusk-text-muted text-sm mt-2">{insight.insight}</p>
        </>
      );
    }

    return null;
  };

  return (
    <div className="bg-gradient-to-br from-white to-soft-clay/10 dark:from-dusk-surface dark:to-soft-clay/10 p-6 rounded-2xl border border-soft-clay/20 shadow-soft relative">
        <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-soft-clay/10 dark:bg-soft-clay/20">
                <LightbulbIcon className="w-5 h-5 text-soft-clay" />
            </div>
            <div className="flex-1">
                {cardContent()}
            </div>
        </div>
         <button 
            onClick={() => generateInsight(true)} 
            disabled={isLoading || !!error}
            className="absolute top-2 right-2 text-gray-400 dark:text-dusk-text-muted/70 hover:text-soft-clay dark:hover:text-soft-clay disabled:text-gray-300 dark:disabled:text-dusk-bg"
            title="Generate new insight"
          >
            <RefreshIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
    </div>
  );
};

export default DeepInsightCard;