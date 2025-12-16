import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema({
    text: {
        type: String,
        // Required only for journal entries
    },
    items: {
        type: [String],
        // Required only for gratitude entries
    },
    type: {
        type: String,
        enum: ['journal', 'gratitude'],
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    audioUrl: {
        type: String,
        default: ""
    },
    displayDate: {
        type: String, // formatted date string for UI consistency
        required: true,
    },
    imageUrl: {
        type: String,
        default: ""
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Entry', entrySchema);
