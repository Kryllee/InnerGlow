import Pin from "../models/Pin.js";
import Board from "../models/Board.js";
import fetch from "node-fetch";

// Create a new pin
export const createPin = async (req, res) => {
    try {
        const { title, description, board, boardId, images, isPrivate } = req.body;

        const newPin = new Pin({
            userId: req.user._id,
            title,
            description: description || "",
            board,
            boardId: boardId || null,
            images: images || [],
            isPrivate: isPrivate || false,
            isSaved: false  // Original user-created pins are not saved copies
        });

        const savedPin = await newPin.save();
        res.status(201).json(savedPin);
    } catch (error) {
        console.error('Create pin error:', error);
        res.status(400).json({ message: error.message });
    }
};

// Get all pins (with optional board filter)
export const getPins = async (req, res) => {
    try {
        const { board, userId } = req.query;

        const filter = {};
        // Only filter by userId if explicitly provided (e.g., for profile page)
        if (userId) {
            filter.userId = userId;
        }
        if (board) {
            filter.board = board;
        }

        // If searching by board but NO userId, default to only public discovery/community pins
        if (board && !userId) {
            filter.isSaved = { $ne: true };
            filter.isPrivate = { $ne: true };
            // Optional: only show pins from the "Discovery" board if that's the intention
            // filter.board = 'Discovery'; 
        } else if (!userId) {
            filter.isSaved = { $ne: true };
            filter.isPrivate = { $ne: true };
        }

        // Search logic
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            filter.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { board: searchRegex }
            ];
        }

        const pins = await Pin.find(filter)
            .populate('userId', 'username profileImage fullName')
            .populate('originalAuthor', 'username profileImage fullName') // Populate original author
            .sort({ createdAt: -1 });
        res.json(pins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all boards (for home tabs)
export const getBoards = async (req, res) => {
    try {
        // Get distinct board names from pins (only public pins)
        const boards = await Pin.distinct('board', { isPrivate: { $ne: true } });
        res.json(boards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single pin by ID
export const getPinById = async (req, res) => {
    try {
        const { id } = req.params;
        let pin;

        if (id.startsWith('unsplash-')) {
            const unsplashIdStr = id.replace('unsplash-', '');
            // 1. Check if we have a local mirror with comments
            pin = await Pin.findOne({ unsplashId: unsplashIdStr })
                .populate('userId', 'username profileImage fullName')
                .populate('comments.userId', 'username profileImage fullName');

            if (!pin) {
                // 2. Fetch from Unsplash API directly if not in DB
                const accessKey = process.env.UNSPLASH_ACCESS_KEY;
                if (!accessKey) {
                    return res.status(500).json({ message: 'Unsplash key not configured' });
                }

                const unsplashRes = await fetch(`https://api.unsplash.com/photos/${unsplashIdStr}`, {
                    headers: { 'Authorization': `Client-ID ${accessKey}` }
                });

                if (unsplashRes.ok) {
                    const photo = await unsplashRes.json();
                    return res.json({
                        _id: `unsplash-${photo.id}`,
                        unsplashId: photo.id,
                        title: photo.description || photo.alt_description || 'Inspiration',
                        description: photo.alt_description || '',
                        images: [{
                            url: photo.urls.regular,
                            width: photo.width,
                            height: photo.height
                        }],
                        userId: {
                            username: photo.user.username,
                            profileImage: photo.user.profile_image.medium,
                            fullName: photo.user.name
                        },
                        comments: [],
                        isUnsplash: true
                    });
                }
            }
        } else {
            pin = await Pin.findById(id)
                .populate('userId', 'username profileImage fullName')
                .populate('originalAuthor', 'username profileImage fullName')
                .populate('comments.userId', 'username profileImage fullName');
        }

        if (!pin) {
            return res.status(404).json({ message: 'Pin not found' });
        }
        res.json(pin);
    } catch (error) {
        console.error('Get pin by ID error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get user's boards with cover images
export const getUserBoards = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Get explicit boards
        const explicitBoards = await Board.find({ userId }).sort({ createdAt: -1 });

        // 2. Get implicit boards from Pins (legacy support)
        // Find all pins for this user that have a 'board' field but might not have 'boardId'
        const distinctBoardNames = await Pin.distinct('board', { userId });

        // Filter out names that already exist in explicitBoards
        const existingNames = explicitBoards.map(b => b.name);
        const missingNames = distinctBoardNames.filter(name => !existingNames.includes(name));

        // Create implicit board objects
        const implicitBoards = missingNames.map(name => ({
            _id: 'implicit-' + name, // Temporary ID
            name: name,
            isPrivate: false,
            createdAt: new Date(),
            isImplicit: true
        }));

        // Combine
        const allBoards = [...explicitBoards, ...implicitBoards];

        // 3. For each board, get the cover image (latest pin)
        const boardsWithCovers = await Promise.all(
            allBoards.map(async (board) => {
                // Search by boardId (if explicit) OR board name (if implicit or fallback)
                const query = { userId };

                if (board._id && !board.isImplicit) {
                    // Try matching by boardId first, falback to name
                    query.$or = [{ boardId: board._id }, { board: board.name }];
                } else {
                    query.board = board.name;
                }

                const firstPin = await Pin.findOne(query).sort({ createdAt: -1 });

                return {
                    _id: board._id,
                    name: board.name,
                    isPrivate: board.isPrivate,
                    description: board.description || "",
                    coverImage: firstPin?.images?.[0]?.url || null,
                    createdAt: board.createdAt,
                    updatedAt: board.updatedAt
                };
            })
        );

        // Sort explicitly: real boards by date, then implicit ones
        // Or just sort all by name? Or created? Let's keep them mixed or just return
        res.json(boardsWithCovers);
    } catch (error) {
        console.error('Get user boards error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update a board
export const updateBoard = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, isPrivate } = req.body;

        const board = await Board.findOne({ _id: id, userId: req.user._id });
        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        if (name) board.name = name;
        if (description !== undefined) board.description = description;
        if (isPrivate !== undefined) board.isPrivate = isPrivate;

        const updatedBoard = await board.save();
        res.json(updatedBoard);
    } catch (error) {
        console.error('Update board error:', error);
        res.status(400).json({ message: error.message });
    }
};

// Delete a board
export const deleteBoard = async (req, res) => {
    try {
        const { id } = req.params;

        const board = await Board.findOneAndDelete({ _id: id, userId: req.user._id });
        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        // Optionally delete all pins in this board
        await Pin.deleteMany({ boardId: id });

        res.json({ message: 'Board deleted successfully' });
    } catch (error) {
        console.error('Delete board error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get board details with all pins
export const getBoardDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        let board;
        let pins;

        // Check if it's an implicit board
        if (id.startsWith('implicit-')) {
            const boardName = id.replace('implicit-', '');

            // Construct virtual board object
            board = {
                _id: id,
                name: boardName,
                isPrivate: false,
                userId: userId,
                isImplicit: true
            };

            // Fetch pins by board name and user
            pins = await Pin.find({ board: boardName, userId: userId })
                .populate('userId', 'username profileImage fullName')
                .sort({ createdAt: -1 });

        } else {
            // Regular explicit board
            board = await Board.findOne({ _id: id, userId: userId });
            if (!board) {
                return res.status(404).json({ message: 'Board not found' });
            }

            // Fetch pins by boardId OR board name (strictly for THIS user)
            pins = await Pin.find({
                userId: userId, // CRITICAL: Only show pins belonging to this user
                $or: [
                    { boardId: id },
                    { board: board.name }
                ]
            })
                .populate('userId', 'username profileImage fullName')
                .sort({ createdAt: -1 });
        }

        res.json({
            board,
            pins
        });
    } catch (error) {
        console.error('Get board details error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete multiple pins
export const deletePins = async (req, res) => {
    try {
        const { pinIds } = req.body;

        if (!Array.isArray(pinIds) || pinIds.length === 0) {
            return res.status(400).json({ message: 'No pins provided for deletion' });
        }

        // Only delete pins that belong to the current user
        const result = await Pin.deleteMany({
            _id: { $in: pinIds },
            userId: req.user._id
        });

        res.json({ message: `${result.deletedCount} pins deleted successfully` });
    } catch (error) {
        console.error('Delete pins error:', error);
        res.status(500).json({ message: error.message });
    }
};


// Save a pin (Clone logic)
export const savePin = async (req, res) => {
    try {
        const { id } = req.params; // ID of the pin to save
        const { boardName, createNewBoard } = req.body;

        const originalPin = await Pin.findById(id);
        if (!originalPin) {
            return res.status(404).json({ message: 'Pin not found' });
        }

        // Determine Board ID
        let targetBoardId = null;
        let targetBoardName = boardName;

        if (createNewBoard) {
            // Check if board already exists for user
            let existingBoard = await Board.findOne({ userId: req.user._id, name: boardName });
            if (existingBoard) {
                targetBoardId = existingBoard._id;
            } else {
                // Create new board
                const newBoard = new Board({
                    userId: req.user._id,
                    name: boardName,
                    isPrivate: false // Default to public for now
                });
                const savedBoard = await newBoard.save();
                targetBoardId = savedBoard._id;
            }
        } else {
            // Find existing board by name
            const existingBoard = await Board.findOne({ userId: req.user._id, name: boardName });
            if (existingBoard) {
                targetBoardId = existingBoard._id;
            } else {
                // Fallback: Create it if it doesn't exist (implicit creation)
                const newBoard = new Board({
                    userId: req.user._id,
                    name: boardName
                });
                const savedBoard = await newBoard.save();
                targetBoardId = savedBoard._id;
            }
        }

        // Create new Pin copy
        const newPin = new Pin({
            userId: req.user._id,
            title: originalPin.title,
            description: originalPin.description,
            board: targetBoardName,
            boardId: targetBoardId,
            images: originalPin.images,
            isPrivate: false, // Default
            isSaved: true, // Mark as a saved copy
            unsplashId: originalPin.unsplashId // Carry over unsplashId if it exists
        });

        await newPin.save();

        res.status(201).json({ message: 'Pin saved successfully' });

    } catch (error) {
        console.error('Save pin error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Helper to Fetch from Unsplash
const fetchUnsplashSearch = async (query, page = 1, per_page = 20) => {
    try {
        const accessKey = process.env.UNSPLASH_ACCESS_KEY;
        if (!accessKey) return [];

        const fetchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}`;
        const response = await fetch(fetchUrl, {
            headers: { 'Authorization': `Client-ID ${accessKey}` }
        });

        if (!response.ok) return [];

        const data = await response.json();
        return data.results.map(photo => ({
            _id: `unsplash-${photo.id}`,
            unsplashId: photo.id,
            title: photo.description || photo.alt_description || 'Inspiration',
            description: photo.alt_description || '',
            board: 'Discovery',
            images: [{
                url: photo.urls.regular,
                width: photo.width,
                height: photo.height
            }],
            userId: {
                username: photo.user.username,
                profileImage: photo.user.profile_image.medium,
                fullName: photo.user.name
            },
            isUnsplash: true
        }));
    } catch (e) {
        console.error('Unsplash search error:', e);
        return [];
    }
};

// Hybrid For You Feed (Mixes local and Unsplash)
export const getForYouPins = async (req, res) => {
    try {
        // 1. Get local public pins
        const localPins = await Pin.find({
            isSaved: { $ne: true },
            isPrivate: { $ne: true }
        })
            .populate('userId', 'username profileImage fullName')
            .sort({ createdAt: -1 })
            .limit(10);

        // 2. Get Unsplash extras
        const unsplashPins = await fetchUnsplashSearch('aesthetic', 1, 15);

        // 3. Combine (Local first, then Unsplash)
        const combined = [...localPins, ...unsplashPins];
        res.json(combined);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hybrid Search
export const searchPins = async (req, res) => {
    try {
        const query = req.query.q || '';
        if (!query) return res.json([]);

        // 1. Search local DB
        const searchRegex = new RegExp(query, 'i');
        const localPins = await Pin.find({
            isPrivate: { $ne: true },
            $or: [
                { title: searchRegex },
                { description: searchRegex }
            ]
        }).populate('userId', 'username profileImage fullName').limit(15);

        // 2. Search Unsplash
        const unsplashPins = await fetchUnsplashSearch(query, 1, 20);

        res.json([...localPins, ...unsplashPins]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a comment to a pin
export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, unsplashData } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        let pin;
        if (id.startsWith('unsplash-')) {
            const unsplashIdStr = id.replace('unsplash-', '');
            pin = await Pin.findOne({ unsplashId: unsplashIdStr });

            if (!pin && unsplashData) {
                // Mirror the pin: the commenting user becomes the "discoverer"
                pin = new Pin({
                    userId: req.user._id,
                    title: unsplashData.title || 'Inspiration',
                    description: unsplashData.description || '',
                    board: unsplashData.board || 'Discovery',
                    images: unsplashData.images,
                    unsplashId: unsplashIdStr,
                    isSaved: false,
                    isPrivate: false
                });
                await pin.save();
            } else if (!pin) {
                return res.status(400).json({ message: 'Missing data to mirror this discovery' });
            }
        } else {
            pin = await Pin.findById(id);
        }

        if (!pin) return res.status(404).json({ message: 'Pin not found' });

        pin.comments.push({
            userId: req.user._id,
            text: text.trim(),
            createdAt: new Date()
        });

        await pin.save();

        const populated = await Pin.findById(pin._id).populate('comments.userId', 'username profileImage fullName');
        res.status(201).json(populated.comments);
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Proxies Unsplash API to keep key safe on backend
export const getUnsplashPins = async (req, res) => {
    try {
        const { query = 'aesthetic', page = 1, per_page = 20 } = req.query;
        const accessKey = process.env.UNSPLASH_ACCESS_KEY;

        if (!accessKey) {
            return res.status(500).json({ message: 'Unsplash API key not configured in backend env' });
        }

        const fetchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}`;
        const response = await fetch(fetchUrl, {
            headers: { 'Authorization': `Client-ID ${accessKey}` }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Unsplash API error:', errorText);
            return res.status(response.status).json({ message: 'Failed to fetch from Unsplash' });
        }

        const data = await response.json();

        // Transform for mobile app
        const pins = data.results.map(photo => ({
            _id: `unsplash-${photo.id}`,
            unsplashId: photo.id,
            title: photo.description || photo.alt_description || 'Inspiration',
            description: photo.alt_description || '',
            board: 'Discovery',
            images: [{
                url: photo.urls.regular,
                width: photo.width,
                height: photo.height
            }],
            userId: { // Mirror Unsplash user as InnerGlow user object for UI consistency
                username: photo.user.username,
                profileImage: photo.user.profile_image.medium,
                fullName: photo.user.name
            },
            isUnsplash: true
        }));

        res.json(pins);
    } catch (error) {
        console.error('Get Unsplash pins error:', error);
        res.status(500).json({ message: error.message });
    }
};
