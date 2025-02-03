import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth';

interface User {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    rol: string;
}

interface GoogleUserData {
    email: string;
    googleId: string;
    nombre: string;
    apellido: string;
}

interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    loading: boolean;
    login: (userData: GoogleUserData) => Promise<void>;
    logout: () => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await authService.validateToken();
                if (response.success && response.data?.usuario) {
                    setUser(response.data.usuario);
                }
            }
        } catch (err) {
            setError('Error al validar la sesión');
            if (err instanceof Error) {
                console.error(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData: GoogleUserData) => {
        try {
            setError(null);
            
            const response = await authService.loginWithGoogle(userData);

            console.log(`esto es lo que devulve el server: ${JSON.stringify(response,null,2)}`);
            if (response.success && response.data?.usuario) {
                setUser(response.data.usuario);
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                }
            } else {
                setError(response.message || 'Error al iniciar sesión');
            }
        } catch (err) {
            setError('Error al iniciar sesión');
            if (err instanceof Error) {
                console.error(err.message);
            }
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
            localStorage.removeItem('token');
        } catch (err) {
            if (err instanceof Error) {
                console.error('Error al cerrar sesión:', err.message);
            }
        }
    };

    const value = {
        user,
        isAdmin: user?.rol === 'admin',
        loading,
        login,
        logout,
        error
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};