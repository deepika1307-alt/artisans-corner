import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

// Automatically attach JWT token to protected requests
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle API errors consistently
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