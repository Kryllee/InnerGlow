import mongoose from 'mongoose';

const dailyCacheSchema = new mongoose.Schema({
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true
    },
    type: {
        type: String, // 'affirmation' | 'challenge'
        required: true,
        enum: ['affirmation', 'challenge']
    },
    content: {
        type: mongoose.Schema.Types.Mixed, // Stores the caching object (text, category, etc.)
        required: true
    }
}, { timestamps: true });

// Ensure unique combination of date + type
dailyCacheSchema.index({ date: 1, type: 1 }, { unique: true });

export default mongoose.model('DailyCache', dailyCacheSchema);
