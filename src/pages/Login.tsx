import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';
import '../css/login-styles.css';

declare global {
    interface Window {
        google: any;
    }
}

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const { login, error } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        script.onload = () => {
            initializeGoogleSignIn();
        };

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const initializeGoogleSignIn = () => {
        window.google?.accounts.id.initialize({
            client_id: '886443640325-93p51cekrloh3vjrrddf5hrr1bhmbkn6.apps.googleusercontent.com',
            callback: handleGoogleResponse,
        });

        window.google?.accounts.id.renderButton(
            document.getElementById('googleSignInButton'),
            { theme: 'filled', size: 'large', width: '100%', text: 'continue_with' }
        );
    };

    const handleGoogleResponse = async (response: any) => {
        setIsLoading(true);
        try {
            const payload = decodeJwtResponse(response.credential);
            const googleData = {
                email: payload.email,
                googleId: payload.sub,
                nombre: payload.given_name,
                apellido: payload.family_name
            };
            await login(googleData);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error en login:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const decodeJwtResponse = (token: string) => {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    };

    return (
        <div className="login-container">
            <div className="forest-background">
                <div className="forest-overlay"></div>
                <div className="forest-trees"></div>
            </div>

            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="login-modal glass-effect modal-animation">
                    <div className="modal-header">
                        <h2 className="modal-title">Login</h2>
                        <button className="close-button">
                            <X size={24} />
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        {isLoading ? (
                            <div className="loading-spinner">
                                <span className="sr-only">Cargando...</span>
                            </div>
                        ) : (
                            <div className="google-button-container">
                                <div id="googleSignInButton"></div>
                            </div>
                        )}

                        <p className="text-sm text-gray-500 text-center">
                            Inicia sesión con Google para acceder a tu cuenta
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}