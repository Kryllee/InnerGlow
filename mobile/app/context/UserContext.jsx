import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userProfile, setUserProfile] = useState({
        firstName: "Nuxczy",
        surname: "Schutz",
        username: "Nuxczy",
        bio: "\"Becoming the best version of yourself, one day at a time\"",
        avatar: null, // Using null to indicate default avatar, can be replaced with actual image source if needed
    });

    const updateProfile = (newProfile) => {
        setUserProfile((prevProfile) => ({
            ...prevProfile,
            ...newProfile,
        }));
    };

    return (
        <UserContext.Provider value={{ userProfile, updateProfile }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
