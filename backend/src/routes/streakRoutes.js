import express from "express";
import User from "../models/User.js";
import fetch from "node-fetch";

const router = express.Router();

// GET /api/streak/challenge - Get a random quote/challenge (Persisted daily)
router.get("/challenge", async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // 1. Check Cache
        const cached = await import('../models/DailyCache.js').then(m => m.default.findOne({ date: today, type: 'challenge' }));
        if (cached) {
            return res.json(cached.content);
        }

        // 2. Fetch from API or generate
        let challenge;
        try {
            const response = await fetch("https://zenquotes.io/api/random");
            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                const quote = data[0];
                challenge = `Reflect on this: "${quote.q}" — ${quote.a}. How does this apply to your life today?`;
            } else {
                challenge = "Reflect on one thing you are grateful for today.";
            }
        } catch (apiError) {
            console.error("Error fetching zenquotes:", apiError);
            // Fallback to another API
            try {
                const fallbackResponse = await fetch("https://api.quotable.io/random");
                const fallbackData = await fallbackResponse.json();
                challenge = `Reflect on this: "${fallbackData.content}" — ${fallbackData.author}.`;
            } catch (fallbackError) {
                console.error("Error fetching fallback quote:", fallbackError);
                challenge = "Reflect on your biggest achievement this week.";
            }
        }

        const challengeContent = { challenge };

        // 3. Save to Cache
        const DailyCache = (await import('../models/DailyCache.js')).default;
        await DailyCache.create({
            date: today,
            type: 'challenge',
            content: challengeContent
        });

        res.json(challengeContent);
    } catch (error) {
        // Handle race condition
        if (error.code === 11000) {
            try {
                const today = new Date().toISOString().split('T')[0];
                const cached = await import('../models/DailyCache.js').then(m => m.default.findOne({ date: today, type: 'challenge' }));
                return res.json(cached ? cached.content : { challenge: "What makes you smile today?" });
            } catch (retryError) {
                return res.status(500).json({ message: retryError.message });
            }
        }
        console.error("Error getting challenge:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// GET /api/streak/status/:userId - Get current streak status
router.get("/status/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const today = new Date().toISOString().split('T')[0];
        const completedToday = user.lastStreakDate === today;

        res.json({
            streakCount: user.streakCount || 0,
            completedToday,
            lastStreakDate: user.lastStreakDate
        });
    } catch (error) {
        console.error("Error getting streak status:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// POST /api/streak/complete - Increment user streak
router.post("/complete", async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const lastStreak = user.lastStreakDate;

        if (lastStreak === today) {
            // Already completed today, just return current status
            return res.json({
                message: "Streak already updated for today",
                streakCount: user.streakCount,
                completedToday: true
            });
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastStreak === yesterdayStr) {
            // Consecutive day
            user.streakCount = (user.streakCount || 0) + 1;
        } else {
            // Missed a day or first time
            user.streakCount = 1;
        }

        user.lastStreakDate = today;
        await user.save();

        res.json({
            message: "Streak updated",
            streakCount: user.streakCount,
            completedToday: true
        });

    } catch (error) {
        console.error("Error updating streak:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
