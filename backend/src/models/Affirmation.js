import mongoose from 'mongoose';

const affirmationSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        default: 'General',
    },
}, { timestamps: true });

export default mongoose.model('Affirmation', affirmationSchema);
