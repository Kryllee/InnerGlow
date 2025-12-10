import React, { createContext, useContext, useState } from 'react';

const MoodContext = createContext();

export const MoodProvider = ({ children }) => {
    // Placeholder state for now
    const [moodHistory, setMoodHistory] = useState([]);

    const logMood = (mood) => {
        console.log("Mood logged:", mood);
    };

    return (
        <MoodContext.Provider value={{ moodHistory, logMood }}>
            {children}
        </MoodContext.Provider>
    );
};

export const useMood = () => useContext(MoodContext);
