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
                sessionStorage.setItem('token', data.token)
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
