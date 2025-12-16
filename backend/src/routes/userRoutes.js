import express from "express";
import User from "../models/User.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import path from 'path';
import cloudinary from '../lib/cloudinary.js';
import multer from 'multer';

const router = express.Router();

// Multer setup for images
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Only images are allowed"));
    }
});

// UPLOAD AVATAR
router.post("/upload-avatar", protectRoute, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "innerglow/avatars",
                format: "png", // Standardize to png
                transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }] // Optimize for avatar
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return res.status(500).json({ message: "Image upload failed" });
                }
                res.json({ imageUrl: result.secure_url });
            }
        );

        uploadStream.end(req.file.buffer);

    } catch (error) {
        console.error("Error in upload avatar", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// UPDATE PROFILE
router.put("/update-profile", protectRoute, async (req, res) => {
    try {
        // Now also accepts avatarUrl
        const { fullName, surname, bio, username, avatarUrl } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (fullName) user.fullName = fullName;
        if (bio !== undefined) user.bio = bio;
        if (avatarUrl) user.profileImage = avatarUrl; // Update avatar if provided

        if (username) {
            // Check uniqueness if changing
            if (username !== user.username) {
                const existing = await User.findOne({ username });
                if (existing) return res.status(400).json({ message: "Username taken" });
                user.username = username;
            }
        }

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage, // Return updated image
                bio: user.bio,
                streakCount: user.streakCount
            }
        });

    } catch (error) {
        console.error("Error in update profile", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// GET PROFILE (to get bio and streak if needed explicitly, though usually stored in context)
router.get("/me", protectRoute, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.json(user);
    } catch (error) {
        console.error("Error fetching user profile", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
