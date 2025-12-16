import React, { createContext, useState, useContext } from 'react';

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

    return (
        <UserContext.Provider value={{ userProfile, updateProfile, token, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
