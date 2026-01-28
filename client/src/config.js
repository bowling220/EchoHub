// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const config = {
    apiUrl: API_URL,
    socketUrl: API_URL,
};

export default config;
