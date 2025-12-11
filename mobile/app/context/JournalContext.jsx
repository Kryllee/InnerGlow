import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const JournalContext = createContext();

export const JournalProvider = ({ children }) => {
    // Shared state for Journal and Gratitude entries
    const [entries, setEntries] = useState([]);
    const [gratitude, setGratitude] = useState([]);
    const [isStreakActive, setIsStreakActive] = useState(false);

    // Fetch entries on mount
    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/entries`);
            const data = await response.json();
            if (Array.isArray(data)) {
                // Filter by type
                setEntries(data.filter(e => e.type === 'journal'));
                setGratitude(data.filter(e => e.type === 'gratitude'));
            }
        } catch (error) {
            console.error("Failed to fetch entries:", error);
        }
    };

    // Add entry helper
    const addEntry = async (text, audioUrl = null) => {
        try {
            const newEntry = {
                text: text || "",
                audioUrl: audioUrl || "",
                type: 'journal',
                displayDate: new Date().toLocaleString()
            };

            const response = await fetch(`${API_BASE_URL}/entries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEntry)
            });
            const savedEntry = await response.json();

            setEntries([savedEntry, ...entries]);
            return savedEntry;
        } catch (error) {
            console.error("Failed to add entry:", error);
            throw error;
        }
    };

    // Update entry helper
    const updateEntry = async (id, data, type) => {
        try {
            const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const updatedEntry = await response.json();

            if (type === 'journal') {
                setEntries(entries.map(e => e._id === id ? updatedEntry : e));
            } else {
                setGratitude(gratitude.map(e => e._id === id ? updatedEntry : e));
            }
        } catch (error) {
            console.error("Failed to update entry:", error);
        }
    };

    // Add gratitude helper
    const addGratitude = async (items) => {
        try {
            const newEntry = {
                items,
                type: 'gratitude',
                displayDate: new Date().toLocaleString()
            };

            const response = await fetch(`${API_BASE_URL}/entries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEntry)
            });
            const savedEntry = await response.json();

            setGratitude([savedEntry, ...gratitude]);
        } catch (error) {
            console.error("Failed to add gratitude:", error);
        }
    };

    return (
        <JournalContext.Provider value={{ entries, gratitude, setEntries, setGratitude, addEntry, addGratitude, updateEntry, isStreakActive, setIsStreakActive }}>
            {children}
        </JournalContext.Provider>
    );
};

export const useJournal = () => useContext(JournalContext);
