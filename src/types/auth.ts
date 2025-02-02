export interface LoginResponse {
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