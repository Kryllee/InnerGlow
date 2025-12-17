import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import {
    createPin,
    getPins,
    getBoards,
    getPinById,
    getUserBoards,
    updateBoard,
    deleteBoard,
    getBoardDetails,
    deletePins,
    savePin
} from "../controllers/pinController.js";
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Cloudinary configuration (reused from entryRoutes pattern)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpg|jpeg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Routes
router.post("/create", protectRoute, createPin);
router.get("/boards", getBoards); // Get list of all boards (for home tabs)
router.get("/user-boards", protectRoute, getUserBoards); // Get user's boards with covers

// New Board Management Routes
router.put("/boards/:id", protectRoute, updateBoard);
router.delete("/boards/:id", protectRoute, deleteBoard);
router.get("/boards/:id", protectRoute, getBoardDetails); // Get single board details

router.get("/:id", getPinById); // Get single pin by ID
router.post("/delete-batch", protectRoute, deletePins); // Delete multiple pins
router.post("/save/:id", protectRoute, savePin); // Save pin to board
router.get("/", protectRoute, getPins); // /api/pins?board=Travel

// Upload route
router.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'image',
                folder: 'innerglow/pins',
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ message: 'Failed to upload image' });
                }
                res.json({ imageUrl: result.secure_url });
            }
        );

        uploadStream.end(req.file.buffer);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
