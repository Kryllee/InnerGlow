import express from 'express';
import Affirmation from '../models/Affirmation.js';

const router = express.Router();

// Get a daily affirmation (Random for now, or seeded by date)
router.get('/daily', async (req, res) => {
    try {
        const count = await Affirmation.countDocuments();
        if (count === 0) {
            return res.json({ text: "Believe in yourself and all that you are.", category: "Default" });
        }
        const random = Math.floor(Math.random() * count);
        const affirmation = await Affirmation.findOne().skip(random);
        res.json(affirmation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Seed database with initial affirmations
router.post('/seed', async (req, res) => {
    try {
        const affirmations = [
            { text: "I am worthy of love and happiness.", category: "Self-Love" },
            { text: "I choose to be happy today.", category: "Positivity" },
            { text: "My potential is limitless.", category: "Growth" },
            { text: "I radiate confidence and grace.", category: "Confidence" },
            { text: "I am enough just as I am.", category: "Self-Love" },
            { text: "Every day is a fresh start.", category: "Hope" },
            { text: "I have the power to create change.", category: "Empowerment" },
            { text: "I forgive myself and set myself free.", category: "Healing" },
            { text: "My challenges help me grow.", category: "Resilience" },
            { text: "I am grateful for this moment.", category: "Gratitude" }
        ];

        await Affirmation.deleteMany({}); // Clear existing
        await Affirmation.insertMany(affirmations);

        res.json({ message: "Affirmations seeded successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
