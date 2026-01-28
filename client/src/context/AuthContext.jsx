import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { generateKeyPair } from '../services/cryptoService';
import config from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [presence, setPresence] = useState('Listening'); // Default state

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    // Presence Inference Logic
    useEffect(() => {
        if (!user) return;

        let activityTimeout;
        const handleActivity = (state) => {
            setPresence(state);
            clearTimeout(activityTimeout);
            activityTimeout = setTimeout(() => setPresence('Listening'), 10000); // Revert to Listening after 10s of silence
        };

        const onMouseMove = () => handleActivity('Active');
        const onKeyDown = () => handleActivity('Focused');
        const onScroll = () => handleActivity('Active');

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('scroll', onScroll);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('scroll', onScroll);
            clearTimeout(activityTimeout);
        };
    }, [user]);

    const initializeKeys = async (currentUser) => {
        const storedPrivate = localStorage.getItem(`priv_${currentUser.id}`);
        if (!storedPrivate || !currentUser.publicKey) {
            const { publicKey, privateKey } = await generateKeyPair();
            localStorage.setItem(`priv_${currentUser.id}`, privateKey);
            // Update server with public key
            await axios.patch(`${config.apiUrl}/api/users/profile`, {
                userId: currentUser.id,
                publicKey: publicKey
            });
            return { ...currentUser, publicKey };
        }
        return currentUser;
    };

    const login = async (username, password) => {
        try {
            const res = await axios.post(`${config.apiUrl}/api/auth/login`, { username, password });
            let { token, user } = res.data;
            user = await initializeKeys(user);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return true;
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const register = async (username, password) => {
        try {
            const res = await axios.post(`${config.apiUrl}/api/auth/register`, { username, password });
            let { token, user } = res.data;
            user = await initializeKeys(user);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return true;
        } catch (e) {
            throw e;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, presence }}>
            {children}
        </AuthContext.Provider>
    );
};
