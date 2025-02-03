import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: 'admin' | 'usuario';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                    <p className="text-gray-600 font-medium">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole) {
        if (user.rol === 'admin') {
            return <>{children}</>;
        }

        if (requiredRole === 'admin' && user.rol !== 'admin') {
            return <Navigate to="/dashboard" replace />;
        }

        if (requiredRole === 'usuario' && user.rol !== 'usuario') {
            return <Navigate to="/admin" replace />;
        }
    }

    if (!requiredRole) {
        if (user.rol === 'admin') {
            return <Navigate to="/admin" replace />;
        } else {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <>{children}</>;
};