import express from "express";
import Mood from "../models/Mood.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Log a mood (Create or Update if exists for today)
router.post("/", protectRoute, async (req, res) => {
    try {
        const { mood, date, note } = req.body;
        const userId = req.user._id;

        if (!mood || !date) {
            return res.status(400).json({ message: "Mood and date are required" });
        }

        // Check if mood exists for this user and date
        let existingMood = await Mood.findOne({ userId, date });

        if (existingMood) {
            existingMood.mood = mood;
            if (note !== undefined) existingMood.note = note;
            await existingMood.save();
            return res.status(200).json(existingMood);
        } else {
            const newMood = new Mood({
                userId,
                mood,
                date,
                note,
            });
            await newMood.save();
            return res.status(201).json(newMood);
        }
    } catch (error) {
        console.error("Error in logMood:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get moods for the current week (or date range)
router.get("/weekly", protectRoute, async (req, res) => {
    try {
        const userId = req.user._id;
        const { startDate, endDate } = req.query; // Expecting YYYY-MM-DD

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "startDate and endDate are required" });
        }

        const moods = await Mood.find({
            userId,
            date: { $gte: startDate, $lte: endDate },
        }).sort({ date: 1 });

        res.status(200).json(moods);
    } catch (error) {
        console.error("Error in getWeeklyMoods:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get most common mood (Stats)
router.get("/stats", protectRoute, async (req, res) => {
    try {
        const userId = req.user._id;
        const { startDate, endDate } = req.query;

        const matchStage = { userId };
        if (startDate && endDate) {
            matchStage.date = { $gte: startDate, $lte: endDate };
        }

        // Aggregate to find the most common mood
        const stats = await Mood.aggregate([
            { $match: matchStage },
            { $group: { _id: "$mood", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 },
        ]);

        if (stats.length === 0) {
            return res.status(200).json({ mostCommon: null });
        }

        res.status(200).json({ mostCommon: stats[0]._id, count: stats[0].count });
    } catch (error) {
        console.error("Error in getMoodStats:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Update a specific mood entry
router.put("/:id", protectRoute, async (req, res) => {
    try {
        const { id } = req.params;
        const { mood, note } = req.body;
        const userId = req.user._id;

        const updatedMood = await Mood.findOneAndUpdate(
            { _id: id, userId },
            { mood, note },
            { new: true }
        );

        if (!updatedMood) {
            return res.status(404).json({ message: "Mood entry not found" });
        }

        res.status(200).json(updatedMood);
    } catch (error) {
        console.error("Error in updateMood:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Delete a specific mood entry
router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const deletedMood = await Mood.findOneAndDelete({ _id: id, userId });

        if (!deletedMood) {
            return res.status(404).json({ message: "Mood entry not found" });
        }

        res.status(200).json({ message: "Mood deleted successfully" });
    } catch (error) {
        console.error("Error in deleteMood:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
