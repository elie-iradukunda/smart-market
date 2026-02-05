import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
    id: string
    fullName: string
    email: string
    phoneNumber: string
}

interface AuthContextType {
    user: User | null
    login: (email: string, password: string) => Promise<boolean>
    register: (fullName: string, email: string, phoneNumber: string, password: string) => Promise<boolean>
    logout: () => void
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        // Check localStorage (primary source for apiClient compatibility)
        const savedUser = localStorage.getItem('auth_user')
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser)
                // Normalize name -> fullName if missing (handles data from apiClient login)
                if (parsed.name && !parsed.fullName) {
                    parsed.fullName = parsed.name
                }
                return parsed
            } catch (e) {
                return null
            }
        }
        return null
    })

    useEffect(() => {
        if (user) {
            localStorage.setItem('auth_user', JSON.stringify(user))
            // Ensure token is also synced if present in user object
            // (Login sets it explicitly, but good to be safe)
        } else {
            localStorage.removeItem('auth_user')
            localStorage.removeItem('auth_token')
        }
    }, [user])

    const register = async (fullName: string, email: string, phoneNumber: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
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
                localStorage.setItem('auth_token', data.token)
                localStorage.setItem('auth_user', JSON.stringify(userWithToken))
                return true
            }
            return false
        } catch (error) {
            console.error('Registration error:', error)
            return false
        }
    }

    const login = async (email: string, password: string): Promise<boolean> => {
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
                const userWithToken = {
                    ...data.user,
                    fullName: data.user.name,
                    phoneNumber: data.user.phone || '', // Handle potential null phone
                    token: data.token
                }
                setUser(userWithToken)
                localStorage.setItem('auth_token', data.token)
                localStorage.setItem('auth_user', JSON.stringify(userWithToken))
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
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        sessionStorage.clear() // Clear legacy session
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
