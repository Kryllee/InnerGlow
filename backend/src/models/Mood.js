import mongoose from "mongoose";

const moodSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        mood: {
            type: String,
            enum: ["Great", "Good", "Okay", "Low", "Struggling"],
            required: true,
        },
        date: {
            type: String, // Storing as YYYY-MM-DD for easy querying/uniqueness
            required: true,
        },
        note: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Ensure one mood per user per day logic is easily enforceable/queryable
// We can use a compound index if we want STRICT uniqueness, but for "upsert" logic we might just query.
// check if user has already logged a mood for this date
moodSchema.index({ userId: 1, date: 1 });

const Mood = mongoose.model("Mood", moodSchema);

export default Mood;
