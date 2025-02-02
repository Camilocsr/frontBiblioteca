export const env = {
    server: {
        endpointGeneral: import.meta.env.VITE_ENV_ENPOINT_GENERAL || 'http://localhost:3002/api',
    }
};