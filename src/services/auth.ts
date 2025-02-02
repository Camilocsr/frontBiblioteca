import { env } from "../config/envConfig";

interface LoginResponse {
    success: boolean;
    message: string;
    data?: {
        usuario?: {
            id: string;
            email: string;
            nombre: string;
            apellido: string;
            rol: string;
        };
        token?: string;
    };
    error?: string;
}

const getHeaders = (includeAuth: boolean = false) => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    if (includeAuth) {
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
};

export const authService = {
    async loginWithGoogle(userData: {
        email: string;
        googleId: string;
        nombre: string;
        apellido: string;
    }): Promise<LoginResponse> {
        const response = await fetch(`${env.server.endpointGeneral}/login/google`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(userData),
        });
        return response.json();
    },

    async validateToken(): Promise<LoginResponse> {
        const response = await fetch(`${env.server.endpointGeneral}/auth/validar`, {
            method: 'GET',
            headers: getHeaders(true),
        });
        return response.json();
    },

    async logout(): Promise<LoginResponse> {
        const response = await fetch(`${env.server.endpointGeneral}/auth/logout`, {
            method: 'POST',
            headers: getHeaders(true),
        });
        localStorage.removeItem('token');
        return response.json();
    },
};