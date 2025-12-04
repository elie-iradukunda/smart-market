import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, AlertCircle, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'react-toastify'

export default function ShopLoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (!email || !password) {
            setError('Please fill in all fields')
            setLoading(false)
            return
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            if (response.ok) {
                const data = await response.json()

                // Check if user is a customer (role_id 13) or other role
                const CUSTOMER_ROLE_ID = 13

                if (data.user.role_id !== CUSTOMER_ROLE_ID && data.user.role_id !== null) {
                    // Non-customer user - redirect to their business dashboard
                    // Store auth data in localStorage for business app
                    localStorage.setItem('auth_token', data.token)
                    localStorage.setItem('auth_user', JSON.stringify(data.user))

                    // Determine dashboard path based on role
                    const dashboardPaths: { [key: number]: string } = {
                        1: '/dashboard/owner',
                        2: '/dashboard/admin',
                        3: '/dashboard/accountant',
                        4: '/dashboard/controller',
                        5: '/dashboard/reception',
                        6: '/dashboard/technician',
                        7: '/dashboard/production',
                        8: '/dashboard/inventory',
                        9: '/dashboard/sales',
                        10: '/dashboard/marketing',
                        11: '/dashboard/pos',
                        12: '/dashboard/support',
                    }

                    const dashboardPath = dashboardPaths[data.user.role_id] || '/dashboard/owner'
                    toast.success('Login successful! Redirecting to your dashboard...')
                    // Use window.location.href for full page reload to properly initialize business app
                    window.location.href = dashboardPath
                } else {
                    // Customer user - use the AuthContext login function
                    const success = await login(email, password)
                    if (success) {
                        toast.success('Login successful!')
                        const redirect = searchParams.get('redirect') || '/'
                        navigate(redirect)
                    } else {
                        setError('Invalid email or password')
                    }
                }
            } else {
                setError('Invalid email or password')
            }
        } catch (error: any) {
            console.error('Login error:', error)
            setError('Invalid email or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
                <div className="absolute w-96 h-96 bg-purple-400/20 rounded-full blur-3xl top-1/2 right-0 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl -bottom-20 left-1/3 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            TOP Design
                        </span>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                        <p className="text-gray-600">Sign in to your account to continue shopping</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 animate-pulse">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-red-800 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
                                    placeholder="you@example.com"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
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

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link
                                to="/shop/register"
                                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors hover:underline"
                            >
                                Create one here
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        <span>Back to Home</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
