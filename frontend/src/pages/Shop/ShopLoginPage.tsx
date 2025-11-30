import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import { toast } from 'react-toastify'

export default function ShopLoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { login } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email || !password) {
            setError('Please fill in all fields')
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
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                        <p className="text-gray-600">Sign in to your account to continue</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                            Sign In
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link
                                to="/shop/register"
                                className="text-blue-600 hover:text-blue-700 font-semibold"
                            >
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
