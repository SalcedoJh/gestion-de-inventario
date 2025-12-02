import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const response = await authService.login(username, password);
        if (response.success) {
            setUser(response.user);
        }
        return response;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        loading,
        // Tipo 1 = Admin
        isAdmin: user?.tipo === 1,
        // Tipo 3 = Full Access
        isFullAccess: user?.tipo === 3,
        // Tipo 2 = Limited Access
        isLimitedAccess: user?.tipo === 2,
        // Sucursal info
        sucursalId: user?.sucursalId
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
