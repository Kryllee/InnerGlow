import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { useUser } from './UserContext';

const JournalContext = createContext();

export const JournalProvider = ({ children }) => {
    const { token } = useUser();
    // Shared state for Journal and Gratitude entries
    const [entries, setEntries] = useState([]);
    const [gratitude, setGratitude] = useState([]);
    const [isStreakActive, setIsStreakActive] = useState(false);

    // Fetch entries on mount or when token changes
    useEffect(() => {
        if (token) {
            fetchEntries();
        } else {
            // Clear entries if no token
            setEntries([]);
            setGratitude([]);
        }
    }, [token]);

    const fetchEntries = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/entries`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    // Filter by type
                    setEntries(data.filter(e => e.type === 'journal'));
                    setGratitude(data.filter(e => e.type === 'gratitude'));
                }
            }
        } catch (error) {
            console.error("Failed to fetch entries:", error);
        }
    };

    // Add entry helper
    const addEntry = async (text, audioUrl = null, imageUrl = "") => {
        if (!token) return;
        try {
            const newEntry = {
                text: text || "",
                audioUrl: audioUrl || "",
                type: 'journal',
                displayDate: new Date().toLocaleString(),
                imageUrl: imageUrl || ""
            };

            const response = await fetch(`${API_BASE_URL}/entries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newEntry)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add entry");
            }

            const savedEntry = await response.json();

            setEntries(prev => [savedEntry, ...prev]);
            return savedEntry;
        } catch (error) {
            console.error("Failed to add entry:", error);
            throw error;
        }
    };

    // Update entry helper
    const updateEntry = async (id, data, type) => {
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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
    const addGratitude = async (items, imageUrl = "") => {
        if (!token) return;
        try {
            const newEntry = {
                items,
                type: 'gratitude',
                displayDate: new Date().toLocaleString(),
                imageUrl: imageUrl || ""
            };

            const response = await fetch(`${API_BASE_URL}/entries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newEntry)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add gratitude");
            }

            const savedEntry = await response.json();

            // Ensure we update state immediately
            setGratitude(prev => [savedEntry, ...prev]);
            return savedEntry;
        } catch (error) {
            console.error("Failed to add gratitude:", error);
            throw error;
        }
    }; // End of addGratitude

    // Delete entry helper
    const deleteEntry = async (id, type) => {
        if (!token) return false;
        try {
            await fetch(`${API_BASE_URL}/entries/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (type === 'journal') {
                setEntries(entries.filter(e => e._id !== id));
            } else {
                setGratitude(gratitude.filter(e => e._id !== id));
            }
            return true;
        } catch (error) {
            console.error("Failed to delete entry:", error);
            return false;
        }
    };

    return (
        <JournalContext.Provider value={{ entries, gratitude, setEntries, setGratitude, addEntry, addGratitude, updateEntry, deleteEntry, fetchEntries, isStreakActive, setIsStreakActive }}>
            {children}
        </JournalContext.Provider>
    );
};

export const useJournal = () => useContext(JournalContext);
