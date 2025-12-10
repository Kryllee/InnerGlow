import mongoose from "mongoose";

const journalSchema = new mongoose.Schema({
    // 1. Link to User
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // 2. Journal Content
    title: {
        type: String,
        trim: true,
        default: "Untitled"
    },
    content: {
        type: String,
        required: true, // You can't save an empty journal
    },

    // 3. Mood Tracker (Crucial for your Profile Chart)
    // Values: "Great", "Good", "Okay", "Low", "Bad"
    mood: {
        type: String,
        enum: ["Great", "Good", "Okay", "Low", "Bad"], 
        default: "Okay"
    },

    // 4. Privacy (Journals are usually private by default)
    isPrivate: {
        type: Boolean,
        default: true
    },

    // 5. Optional: Add a photo to the journal entry
    image: {
        type: String,
        default: "" 
    }

}, {
    timestamps: true 
});

const Journal = mongoose.model("Journal", journalSchema);

export default Journal;