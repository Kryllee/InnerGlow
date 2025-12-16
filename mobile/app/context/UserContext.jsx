import React, { createContext, useState, useContext } from 'react';
import { API_BASE_URL } from '../config';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userProfile, setUserProfile] = useState(null);
    const [token, setToken] = useState(null);

    const updateProfile = (newProfile) => {
        setUserProfile((prevProfile) => ({
            ...prevProfile,
            ...newProfile,
        }));
    };

    const login = (userData, authToken) => {
        // Sanitize avatar URL to ensure PNG format for React Native Image component
        let sanitizedData = { ...userData };
        if (sanitizedData.avatar && sanitizedData.avatar.uri) {
            if (sanitizedData.avatar.uri.includes("api.dicebear.com") && sanitizedData.avatar.uri.includes("/svg")) {
                sanitizedData.avatar.uri = sanitizedData.avatar.uri.replace("/svg", "/png");
            }
        }
        setUserProfile(sanitizedData);
        setToken(authToken);
    };

    const logout = () => {
        setUserProfile(null);
        setToken(null);
    };

    const refreshProfile = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const updatedUser = await response.json();
                // Ensure legacy field support if needed, or just update userProfile
                // The backend returns user object directly
                setUserProfile(prev => ({ ...prev, ...updatedUser }));
            }
        } catch (e) {
            console.error("Failed to refresh profile", e);
        }
    };

    return (
        <UserContext.Provider value={{ userProfile, updateProfile, token, login, logout, refreshProfile }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
