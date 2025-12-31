
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SparkleIcon, HomeIcon, RefreshIcon, PrinterIcon, ClipboardIcon, CheckIcon } from '../icons/Icons';
import SegmentedControl from '../ui/SegmentedControl';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';

type DateRange = '30d' | '90d' | 'all';

const ClinicianSummaryView: React.FC = () => {
  const { logs: userLogs } = useUser();
  const { navigate } = useApp();
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setError("This feature is currently unavailable due to a configuration issue.");
    }
  }, []);

  const filteredLogs = useMemo(() => {
    if (dateRange === 'all') return userLogs;
    const days = dateRange === '30d' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return userLogs.filter(log => new Date(log.date) >= cutoff);
  }, [userLogs, dateRange]);

  const generateSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);

    if (filteredLogs.length < 5) {
      setError("At least 5 entries are needed in the selected date range to generate a meaningful summary.");
      setIsLoading(false);
      return;
    }

    try {
      if (!process.env.API_KEY) {
        throw new Error("API key is not configured.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const userDataString = JSON.stringify(filteredLogs, null, 2);
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a reflective summary writer. Your task is to synthesize the following user-logged wellness data into a clear, objective, and concise summary that can be used for personal reflection or shared with a trusted support person.

        **Instructions:**
        1.  **Do NOT diagnose or treat. Keep it observational and neutral.**
        2.  Present the information factually and neutrally using Markdown formatting.
        3.  Use clear headings (e.g., \`## Section Title\`).
        4.  Begin with a brief overview including the date range covered and the total number of entries analyzed.
        5.  Create a "Sensation Frequency" section, listing the most frequently reported sensations and their counts.
        6.  Create a "Mood & Sleep Patterns" section, summarizing common moods and the average reported sleep quality (on a scale of 1-5).
        7.  Create a "Noted Connections" section, highlighting any potential connections observed in the data (e.g., "Tension was often noted on days with reported sleep quality below 3/5.").
        8.  Keep the entire summary concise and easy to read.

        **User Data:**
        ${userDataString}`
      });
      
      setSummary(response.text);

    } catch (e) {
      console.error(e);
      setError("We couldn't generate the summary at this moment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [filteredLogs]);

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow?.document.write('<html><head><title>Femiora Support Summary</title>');
    printWindow?.document.write('<style>body{font-family:sans-serif;line-height:1.5;} h2{font-size:1.25rem;border-bottom:1px solid #eee;padding-bottom:0.5rem;margin-top:1.5rem;} ul{padding-left:1.25rem;} strong{font-weight:600;}</style>');
    printWindow?.document.write('</head><body>');
    printWindow?.document.write(`<h1>Femiora Support Summary</h1>`);
    printWindow?.document.write(summary?.replace(/## (.*)/g, '<h2>$1</h2>') || '');
    printWindow?.document.write('</body></html>');
    printWindow?.document.close();
    printWindow?.print();
  };

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };


  return (
    <div className="min-h-screen bg-paper-white/80 pb-24 md:pb-8">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif text-gray-800">Support Summary</h1>
            <p className="text-sm text-gray-500">A shareable reflection of your observations.</p>
          </div>
          <button 
            onClick={() => navigate('home')}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <HomeIcon className="w-5 h-5 text-gray-600" />
            <span className="hidden md:inline">Dashboard</span>
          </button>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                <SegmentedControl 
                    options={[
                        {label: 'Last 30 Days', value: '30d'},
                        {label: 'Last 90 Days', value: '90d'},
                        {label: 'All Time', value: 'all'},
                    ]}
                    selectedValue={dateRange}
                    onChange={(value) => setDateRange(value)}
                />
                 <button 
                    onClick={generateSummary}
                    disabled={isLoading || !!error}
                    className="w-full md:w-auto flex-shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-calm-sage text-white hover:bg-opacity-90 transition-all transform hover:-translate-y-0.5 shadow-lg disabled:bg-gray-300 disabled:shadow-none disabled:transform-none"
                >
                    <SparkleIcon className="w-5 h-5" />
                    {isLoading ? 'Generating...' : 'Generate Summary'}
                </button>
            </div>

            {/* Content */}
            <div className="prose prose-sm max-w-none prose-h2:font-serif prose-h2:border-b prose-h2:pb-2 prose-h2:mb-3 prose-strong:text-gray-700">
                {isLoading && (
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/4 mt-6"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                )}
                {error && (
                     <div className="p-4 rounded-xl flex flex-col items-center justify-center text-center bg-red-50 border border-red-200 text-red-800">
                        <p className="mb-4">{error}</p>
                        <button 
                            onClick={generateSummary}
                            className="flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-red-300 bg-white hover:bg-red-50 transition-colors"
                        >
                            <RefreshIcon className="w-4 h-4" />
                            Try Again
                        </button>
                    </div>
                )}
                 {summary && !isLoading && (
                    <>
                        <div className="flex justify-end gap-2 mb-4">
                            <button onClick={handlePrint} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-calm-sage p-2 rounded-lg hover:bg-gray-100 transition-colors"><PrinterIcon className="w-4 h-4" /> Print</button>
                            <button onClick={handleCopy} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-calm-sage p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                {isCopied ? <><CheckIcon className="w-4 h-4 text-calm-sage" /> Copied!</> : <><ClipboardIcon className="w-4 h-4" /> Copy</>}
                            </button>
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: summary.replace(/## (.*?)\n/g, '<h2>$1</h2>').replace(/\* \*\*(.*?)\*\*:/g, '<ul><li><strong>$1:</strong>') }} />
                    </>
                 )}
                 {!summary && !isLoading && !error && (
                    <div className="text-center text-gray-500 py-10">
                        <p>Select a date range and click "Generate Summary" to create your report.</p>
                    </div>
                 )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default ClinicianSummaryView;
