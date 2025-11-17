import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "15d"}); 
}

// REGISTER/SIGNUP - requires fullName, username, email, password
router.post("/register", async (req, res) => {
    try {
        const { fullName, username, email, password } = req.body;

        // Validate all fields
        if (!fullName || !username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password should be at least 6 characters long" });
        }

        if (username.length < 6) {
            return res.status(400).json({ message: "Username should be at least 6 characters long" });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username is already taken" });
        }

        // Generate profile image
        const profileImage = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${username}`;

        // Create new user
        const user = new User({
            fullName,
            username,
            email,
            password,
            profileImage,
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);
        
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                _id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
        });

    } catch (error) {
        console.log("Error in register route", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// LOGIN - accepts either username OR email + password
router.post("/login", async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;

        if (!usernameOrEmail || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Find user by either email or username
        const user = await User.findOne({
            $or: [
                { email: usernameOrEmail },
                { username: usernameOrEmail }
            ]
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check password
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Generate token
        const token = generateToken(user._id);
        
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
        });

    } catch (error) {
        console.log("Error in login route", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;