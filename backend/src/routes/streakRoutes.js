import express from "express";
import User from "../models/User.js";
import fetch from "node-fetch";

const router = express.Router();

// GET /api/streak/challenge - Get a random quote/challenge
router.get("/challenge", async (req, res) => {
    try {
        // Fetch a random quote from a free API
        const response = await fetch("https://zenquotes.io/api/random");
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            const quote = data[0];
            const challenge = `Reflect on this: "${quote.q}" — ${quote.a}. How does this apply to your life today?`;
            return res.json({ challenge });
        } else {
            return res.json({ challenge: "Reflect on one thing you are grateful for today." });
        }
    } catch (error) {
        console.error("Error fetching quote:", error);
        res.json({ challenge: "Reflect on your biggest achievement this week." });
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
