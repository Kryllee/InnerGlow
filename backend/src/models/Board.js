import mongoose from "mongoose";

const boardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        trim: true,
        default: ""
    }
}, {
    timestamps: true
});

// Ensure a user can't have duplicate board names
boardSchema.index({ userId: 1, name: 1 }, { unique: true });

const Board = mongoose.model("Board", boardSchema);
export default Board;
