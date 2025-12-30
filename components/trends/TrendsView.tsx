
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { HomeIcon, SparkleIcon, TrendingUpIcon, RefreshIcon } from '../icons/Icons';
import SimpleChart, { ChartData } from '../charts/SimpleChart';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';

interface AnalysisResponse {
    summary: string;
    chartData?: ChartData;
}

const suggestionPrompts = [
    "How does my sleep affect my mood the next day?",
    "Compare my energy levels in March vs April.",
    "Is there a link between my headaches and stress?",
    "Show my sleep quality on weekends vs weekdays."
];

const TrendsView: React.FC = () => {
    const { logs: userLogs } = useUser();
    const { navigate } = useApp();
    const [query, setQuery] = useState('');
    const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!process.env.API_KEY) {
            setError("This feature is currently unavailable due to a configuration issue.");
        }
    }, []);

    const generateAnalysis = useCallback(async (currentQuery: string) => {
        if (!currentQuery.trim()) return;

        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            if (!process.env.API_KEY) throw new Error("API key is not configured.");
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const userDataString = JSON.stringify(userLogs, null, 2);

            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `You are a data analyst for Femiora. Your goal is to analyze the user's wellness data based on their question and provide a gentle, insightful summary and optional chart data.
                - **NEVER give medical advice.**
                - Analyze the full dataset provided.
                - Respond in the specified JSON format.
                - For chart data, provide appropriate labels and datasets. For time-based queries, labels should be dates or months. For comparisons, labels should be the categories being compared.
                - The summary should be in Markdown format.

                **User's Question:** "${currentQuery}"

                **User's Data:**
                ${userDataString}`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING },
                            chartData: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ['bar', 'line'] },
                                    labels: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    datasets: { 
                                        type: Type.ARRAY, 
                                        items: { 
                                            type: Type.OBJECT,
                                            properties: {
                                                label: { type: Type.STRING },
                                                data: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                                            },
                                            required: ["label", "data"]
                                        }
                                    }
                                },
                                required: ["type", "labels", "datasets"]
                            },
                        },
                        required: ["summary"]
                    }
                }
            });

            if (response.text) {
                setAnalysis(JSON.parse(response.text));
            } else {
                throw new Error("Received an empty response from the AI.");
            }

        } catch (e) {
            console.error(e);
            setError("We couldn't generate the analysis. The AI may be busy, please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [userLogs]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        generateAnalysis(query);
    };

    const handleSuggestionClick = (prompt: string) => {
        setQuery(prompt);
        generateAnalysis(prompt);
    };

    return (
        <div className="min-h-screen bg-paper-white/80 pb-8">
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-serif text-gray-800">Advanced Trends</h1>
                        <p className="text-sm text-gray-500">Ask questions about your long-term data.</p>
                    </div>
                    <button onClick={() => navigate('home')} className="flex items-center gap-2 text-sm px-3 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                        <HomeIcon className="w-5 h-5 text-gray-600" />
                        <span className="hidden md:inline">Dashboard</span>
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 mb-8">
                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., How does my sleep affect my mood?"
                            className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-full px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mist-blue"
                            disabled={!!error}
                        />
                        <button type="submit" disabled={isLoading || !query.trim() || !!error} className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-calm-sage text-white hover:bg-opacity-90 transition-all transform hover:-translate-y-0.5 shadow-lg disabled:bg-gray-300 disabled:shadow-none disabled:transform-none">
                            <SparkleIcon className="w-5 h-5" />
                            {isLoading ? 'Analyzing...' : 'Generate Analysis'}
                        </button>
                    </form>
                </div>

                <div className="space-y-8">
                    {isLoading && (
                        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                            <div className="h-48 bg-gray-200 rounded-lg mt-8"></div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl flex flex-col items-center text-center">
                            <p className="mb-4">{error}</p>
                            {error.includes("try again") && (
                                <button onClick={() => generateAnalysis(query)} className="flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-red-300 bg-white hover:bg-red-50 transition-colors">
                                    <RefreshIcon className="w-4 h-4" />
                                    Try Again
                                </button>
                            )}
                        </div>
                    )}
                    
                    {!isLoading && !analysis && !error && (
                         <div className="text-center text-gray-600 p-8 bg-white rounded-2xl shadow-soft border border-gray-100">
                            <TrendingUpIcon className="w-12 h-12 text-calm-sage mx-auto mb-4"/>
                            <h2 className="text-xl font-serif text-gray-800">Unlock Deeper Insights</h2>
                            <p className="mt-2 mb-4">Ask a question about your data, or try one of these suggestions:</p>
                             <div className="flex flex-wrap justify-center gap-2">
                                {suggestionPrompts.map(prompt => (
                                    <button key={prompt} onClick={() => handleSuggestionClick(prompt)} className="px-3 py-1.5 text-sm bg-calm-sage/10 text-calm-sage rounded-full hover:bg-calm-sage/20 transition-colors">{prompt}</button>
                                ))}
                            </div>
                        </div>
                    )}

                    {analysis && (
                        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 space-y-8">
                            {analysis.chartData && <SimpleChart data={analysis.chartData} />}
                            <div className="prose prose-sm max-w-none prose-h2:font-serif prose-h2:border-b prose-h2:pb-2 prose-h2:mb-3 prose-strong:text-gray-700">
                               <div dangerouslySetInnerHTML={{ __html: analysis.summary.replace(/## (.*?)\n/g, '<h2>$1</h2>').replace(/\* \*\*(.*?)\*\*:/g, '<ul><li><strong>$1:</strong>') }} />
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TrendsView;