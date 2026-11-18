import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 30000
});

// Automatically attach JWT token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Handle API errors
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error(
                'API Error:',
                error.response.data.message || 'Something went wrong.'
            );
        } else if (error.request) {
            console.error('Backend server is not responding.');
        } else {
            console.error('Request Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default API;