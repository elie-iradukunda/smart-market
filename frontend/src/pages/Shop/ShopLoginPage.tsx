// @ts-nocheck
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';

/**
 * ShopLoginPage Component.
 * Handles customer authentication for the storefront with a flat, bordered UI.
 */
export default function ShopLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('Please fill in all fields.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                const CUSTOMER_ROLE_ID = 13;

                if (data.user.role_id !== CUSTOMER_ROLE_ID && data.user.role_id !== null) {
                    // Non-customer user - redirect to their business dashboard.
                    localStorage.setItem('auth_token', data.token);
                    localStorage.setItem('auth_user', JSON.stringify(data.user));

                    const dashboardPaths: { [key: number]: string } = {
                        1: '/dashboard/admin',
                        2: '/dashboard/sales',
                        3: '/dashboard/staff',
                        4: '/client'
                    };

                    const dashboardPath = dashboardPaths[data.user.role_id] || '/dashboard/owner';
                    toast.success('Login successful! Redirecting...');

                    const redirect = searchParams.get('redirect');
                    window.location.href = redirect || dashboardPath;
                } else {
                    // Customer user - use the AuthContext login function.
                    const success = await login(email, password);
                    if (success) {
                        toast.success('Login successful!');
                        const redirect = searchParams.get('redirect') || '/client';
                        navigate(redirect);
                    } else {
                        setError('Invalid email or password.');
                    }
                }
            } else {
                setError('Invalid email or password.');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Logo Section. */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
                        <div className="p-3 rounded-2xl border border-gray-200 bg-white">
                            <Sparkles className="w-8 h-8 text-indigo-600" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">
                            TOP Design
                        </span>
                    </Link>
                </div>

                {/* Main Card - Bordered, flat, no shadows. */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back.</h2>
                        <p className="text-gray-500">Sign in to your account to continue shopping.</p>
                    </div>

                    {/* Error Message. */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-red-800 text-sm font-semibold">{error}</p>
                        </div>
                    )}

                    {/* Login Form. */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-sm outline-none"
                                    placeholder="you@example.com"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-sm outline-none"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <Lock className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-gray-100 pt-6">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link
                                to="/shop/register"
                                className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
                            >
                                Create one here.
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Return to Storefront. */}
                <div className="text-center mt-6">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-bold group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        <span>Back to Home.</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}