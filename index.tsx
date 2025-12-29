
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

const ConfigError: React.FC<{ messages: string[] }> = ({ messages }) => (
    <div className="min-h-screen flex items-center justify-center bg-paper-white p-4">
        <div className="max-w-md w-full text-center">
            <h1 className="text-2xl font-serif text-red-700">Configuration Error</h1>
            <p className="text-gray-600 mt-2 mb-4">The application cannot start because some required settings are missing.</p>
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-left">
                <ul className="list-disc list-inside text-sm space-y-1">
                    {messages.map((msg, i) => <li key={i}>{msg}</li>)}
                </ul>
            </div>
            <p className="text-xs text-gray-500 mt-4">Please contact the administrator to resolve this issue.</p>
        </div>
    </div>
);

const missingConfigs: string[] = [];
if (!process.env.SUPABASE_URL) missingConfigs.push("Supabase URL is not set.");
if (!process.env.SUPABASE_ANON_KEY) missingConfigs.push("Supabase Anon Key is not set.");
if (!process.env.API_KEY) missingConfigs.push("Google AI API Key is not set.");

if (missingConfigs.length > 0) {
    root.render(<ConfigError messages={missingConfigs} />);
} else {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
}