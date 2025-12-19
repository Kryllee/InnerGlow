import mongoose from "mongoose";

const pinSchema = new mongoose.Schema({
    // 1. LINK TO THE USER
    // We need to know which InnerGlow user created this pin
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Connects to your User model
        required: true
    },
    // The original creator (if this is a saved/cloned pin)
    originalAuthor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
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
    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Board"
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    isSaved: {
        type: Boolean,
        default: false
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
    }],

    // 5. COMMENTS
    // Persistent comments for the pin
    comments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // 6. EXTERNAL REFERENCE
    // If this pin came from Unsplash
    unsplashId: {
        type: String,
        index: true,
        default: null
    }

}, {
    timestamps: true // Automatically saves 'createdAt' (for "Newest" sort)
});

const Pin = mongoose.model("Pin", pinSchema);

export default Pin;