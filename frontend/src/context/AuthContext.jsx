import {
    createContext,
    useContext,
    useState,
    useEffect
} from 'react';

import API from '../services/api';

const AuthContext = createContext(null);

// Authentication Provider
export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore login session when the application opens
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }

        setLoading(false);
    }, []);

    // REGISTER USER
    const register = async (userData) => {
        try {
            const response = await API.post(
                '/auth/register',
                userData
            );

            return response.data;

        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                'Registration failed. Please try again.'
            );
        }
    };

    // LOGIN USER
    const login = async (credentials) => {
        try {
            const response = await API.post(
                '/auth/login',
                credentials
            );

            const { token: newToken, user: userData } = response.data;

            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));

            setToken(newToken);
            setUser(userData);

            return userData;

        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                'Login failed. Please check your credentials.'
            );
        }
    };

    // LOGOUT USER
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        register,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom Authentication Hook
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuth must be used inside AuthProvider'
        );
    }

    return context;
};