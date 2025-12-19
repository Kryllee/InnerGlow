import express from "express";
import cors from "cors";
import "dotenv/config.js";
import authRoutes from "./routes/authRoutes.js";
import moodRoutes from "./routes/moodRoutes.js";
import affirmationRoutes from './routes/affirmationRoutes.js';
import entryRoutes from './routes/entryRoutes.js';
import streakRoutes from './routes/streakRoutes.js';
import userRoutes from './routes/userRoutes.js';
import pinRoutes from './routes/pinRoutes.js';
import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use("/api/auth", authRoutes);
app.use('/api/affirmation', affirmationRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/streak', streakRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pins", pinRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})