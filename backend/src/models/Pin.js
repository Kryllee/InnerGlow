import mongoose from "mongoose";

const pinSchema = new mongoose.Schema({
    // 1. LINK TO THE USER
    // We need to know which InnerGlow user created this pin
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Connects to your User model
        required: true
    },

    // 2. PIN DETAILS
    // In your frontend you used 'title', so we use 'title' here (not 'name')
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ""
    },

    // 3. BOARD CATEGORY
    // Stores "Travel", "Food", "Style", etc.
    board: {
        type: String,
        required: true,
        index: true // Helps load pins faster when filtering by board
    },

    // 4. IMAGES ARRAY
    // InnerGlow allows multiple photos in one pin (Carousel)
    images: [{
        url: { 
            type: String, 
            required: true 
        },
        // Optional: You can save width/height here if you want a masonry layout later
        width: Number, 
        height: Number
    }]

}, {
    timestamps: true // Automatically saves 'createdAt' (for "Newest" sort)
});

const Pin = mongoose.model("Pin", pinSchema);

export default Pin;