import express from 'express';
import Affirmation from '../models/Affirmation.js';
import fetch from 'node-fetch';

const router = express.Router();

// Get a daily affirmation (Persisted for the day)
router.get('/daily', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // 1. Check Cache
        const cached = await import('../models/DailyCache.js').then(m => m.default.findOne({ date: today, type: 'affirmation' }));
        if (cached) {
            return res.json(cached.content);
        }

        // 2. Fetch from ZenQuotes API directly
        let selectedAffirmation;
        try {
            // ZenQuotes "Today's Quote" - reliable and free
            const response = await fetch('https://zenquotes.io/api/today');
            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                selectedAffirmation = {
                    text: data[0].q, // Quote text
                    category: "Inspiration" // ZenQuotes doesn't always give category, generic fallback
                };
            } else {
                throw new Error("Invalid API response");
            }
        } catch (apiError) {
            console.error("ZenQuotes API failed, trying fallback:", apiError);

            // Fallback: Pick random from DB
            const count = await Affirmation.countDocuments();
            if (count > 0) {
                const random = Math.floor(Math.random() * count);
                selectedAffirmation = await Affirmation.findOne().skip(random);
            } else {
                selectedAffirmation = {
                    text: "You are capable of amazing things.",
                    category: "Positivity"
                };
            }
        }

        // 3. Save to Cache
        if (selectedAffirmation) {
            const DailyCache = (await import('../models/DailyCache.js')).default;
            await DailyCache.create({
                date: today,
                type: 'affirmation',
                content: selectedAffirmation
            });
        }

        res.json(selectedAffirmation);
    } catch (error) {
        // Handle race condition: Duplicate Key Error (11000)
        if (error.code === 11000) {
            try {
                const today = new Date().toISOString().split('T')[0];
                const cached = await import('../models/DailyCache.js').then(m => m.default.findOne({ date: today, type: 'affirmation' }));
                return res.json(cached ? cached.content : { text: "Believe in yourself.", category: "Fallback" });
            } catch (retryError) {
                return res.status(500).json({ message: retryError.message });
            }
        }
        res.status(500).json({ message: error.message });
    }
});

// Seed database with initial affirmations (Dynamic Fetch)
router.post('/seed', async (req, res) => {
    try {
        await Affirmation.deleteMany({}); // Clear existing

        // Fetch from a free quote API to seed the database dynamically
        const response = await fetch("https://type.fit/api/quotes");
        const data = await response.json();

        // Transform data to match our schema (text, category)
        // type.fit returns { text, author }
        const affirmations = data.slice(0, 20).map(q => ({
            text: q.text,
            category: "General" // API doesn't provide category, default to General
        }));

        await Affirmation.insertMany(affirmations);

        res.json({ message: `Seeded ${affirmations.length} affirmations from external API!` });
    } catch (error) {
        console.error("Seed error:", error);
        res.status(500).json({ message: "Failed to seed from API: " + error.message });
    }
});

export default router;
