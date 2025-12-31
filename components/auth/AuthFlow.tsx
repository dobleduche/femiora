
import React, { useState } from 'react';
import { supabase } from '../../lib/db';
import { FeatherIcon } from '../icons/Icons';

const AuthFlow: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        const { error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage('Check your email for the magic link!');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-warm-sand to-calm-teal flex flex-col justify-center">
            <div className="max-w-sm mx-auto p-8 w-full">
                <div className="text-center mb-8">
                    <FeatherIcon className="w-16 h-16 text-calm-sage mx-auto" />
                    <h1 className="text-3xl font-serif text-gray-800 mt-4">
                        Your body isn’t breaking. It’s changing.
                    </h1>
                    <p className="text-gray-700 mt-3">
                        Femiora helps you notice the patterns — without fear, without shame, without labels.
                    </p>
                    <p className="text-sm text-gray-600 mt-3">
                        Enter your email to start reflecting.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="sr-only">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mist-blue"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-6 bg-calm-sage text-white rounded-full 
                                   font-medium hover:bg-opacity-90 transition-all transform hover:-translate-y-0.5
                                   shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mist-blue
                                   disabled:bg-gray-400 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending...' : 'Start Reflecting →'}
                    </button>
                </form>

                {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}
                {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
            </div>
        </div>
    );
};

export default AuthFlow;
