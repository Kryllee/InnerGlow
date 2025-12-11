import express from 'express';
import Entry from '../models/Entry.js';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

const router = express.Router();

// GET all entries (sorted by newest first)
router.get('/', async (req, res) => {
    try {
        const entries = await Entry.find().sort({ date: -1 });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new entry
router.post('/', async (req, res) => {
    try {
        const { text, items, type, displayDate, audioUrl } = req.body;
        const newEntry = new Entry({
            text,
            items,
            type,
            audioUrl: audioUrl || "",
            displayDate: displayDate || new Date().toLocaleString()
        });

        const savedEntry = await newEntry.save();
        res.status(201).json(savedEntry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE entry
router.delete('/:id', async (req, res) => {
    try {
        await Entry.findByIdAndDelete(req.params.id);
        res.json({ message: 'Entry deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE entry
router.put('/:id', async (req, res) => {
    try {
        const updatedEntry = await Entry.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedEntry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer memory storage for Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /m4a|mp4|mp3|wav/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'));
        }
    }
});

// POST audio upload to Cloudinary
router.post('/upload-audio', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No audio file uploaded' });
        }

        // Upload to Cloudinary using stream
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'video', // Cloudinary uses 'video' for audio files
                folder: 'innerglow/audio',
                format: 'mp3'
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ message: 'Failed to upload audio' });
                }

                console.log('Audio uploaded to Cloudinary:', result.secure_url);
                res.json({ audioUrl: result.secure_url });
            }
        );

        uploadStream.end(req.file.buffer);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
