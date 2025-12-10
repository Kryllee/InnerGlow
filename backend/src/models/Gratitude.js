import mongoose from "mongoose";

const gratitudeSchema = new mongoose.Schema({
    // 1. Link to User
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // 2. What they are grateful for
    // We use an Array of Strings so they can add multiple bullet points
    // Example: ["My cat", "Sunny weather", "Good food"]
    items: [{
        type: String,
        required: true,
        trim: true
    }],

    // 3. Quote of the day (Optional context)
    // Sometimes apps show a quote, and the user writes gratitude based on it
    prompt: {
        type: String,
        default: "What are you grateful for today?"
    }

}, {
    timestamps: true 
});

const Gratitude = mongoose.model("Gratitude", gratitudeSchema);

export default Gratitude;