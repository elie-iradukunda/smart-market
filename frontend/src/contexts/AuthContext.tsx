import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { API_BASE } from '@/config/api'

export interface User {
    id: string
    fullName: string
    email: string
    phoneNumber: string
}

interface RegisterResult {
    success: boolean
    error?: string
}

interface AuthContextType {
    user: User | null
    login: (email: string, password: string) => Promise<boolean>
    register: (fullName: string, email: string, phoneNumber: string, password: string) => Promise<RegisterResult>
    logout: () => void
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = sessionStorage.getItem('currentUser')
        return savedUser ? JSON.parse(savedUser) : null
    })

    useEffect(() => {
        if (user) {
            sessionStorage.setItem('currentUser', JSON.stringify(user))
        } else {
            sessionStorage.removeItem('currentUser')
        }
    }, [user])

    const register = async (fullName: string, email: string, phoneNumber: string, password: string): Promise<RegisterResult> => {
        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: fullName,
                    email,
                    phone: phoneNumber,
                    password,
                }),
            })

            if (response.ok) {
                const data = await response.json()
                const userWithToken = {
                    ...data.user,
                    fullName: data.user.name,
                    phoneNumber: data.user.phone,
                    token: data.token
                }
                setUser(userWithToken)
                sessionStorage.setItem('token', data.token)
                return { success: true }
            }

            // Extract error message from response
            let errorMessage = 'Registration failed. Please try again.'
            try {
                const errorData = await response.json()
                errorMessage = errorData.error || errorData.message || errorMessage
            } catch {
                // If response is not JSON, use status text
                errorMessage = response.status === 409 
                    ? 'Email or phone number already exists. Please use a different one.'
                    : `Registration failed: ${response.statusText}`
            }

            return { success: false, error: errorMessage }
        } catch (error) {
            console.error('Registration error:', error)
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Network error. Please check your connection and try again.' 
            }
        }
    }

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            if (response.ok) {
                const data = await response.json()
                const userWithToken = {
                    ...data.user,
                    fullName: data.user.name,
                    phoneNumber: data.user.phone || '', // Handle potential null phone
                    token: data.token,
                    is_super_admin: data.user.is_super_admin || false
                }
                setUser(userWithToken)
                sessionStorage.setItem('token', data.token)
                return true
            }
            return false
        } catch (error) {
            console.error('Login error:', error)
            return false
        }
    }

    const logout = () => {
        setUser(null)
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('currentUser')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
