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

        // Increment streak
        // Basic logic: Just increment. 
        // Advanced logic (not implemented yet): Check if already completed today.
        user.streakCount = (user.streakCount || 0) + 1;
        await user.save();

        res.json({
            message: "Streak updated",
            streakCount: user.streakCount
        });

    } catch (error) {
        console.error("Error updating streak:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
