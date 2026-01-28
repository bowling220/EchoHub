const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey';

// Register
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (existingUser) return res.status(400).json({ error: 'Username already taken' });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate an avatar color/style based on username for now or random
        const avatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`;

        const info = db.prepare('INSERT INTO users (username, password, avatar) VALUES (?, ?, ?)').run(username, hashedPassword, avatar);

        const token = jwt.sign({ id: info.lastInsertRowid, username }, SECRET_KEY, { expiresIn: '7d' });

        res.status(201).json({
            token,
            user: {
                id: info.lastInsertRowid,
                username,
                avatar,
                role: 'user',
                bio: '',
                coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
                themeColor: '#00f0ff',
                isVerified: 0,
                isSuspended: 0
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (!user) return res.status(400).json({ error: 'User not found' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: 'Invalid password' });

        if (user.isSuspended) {
            return res.status(403).json({ error: 'NEURAL_LINK_DENIED: Your identity signature has been suspended by an administrator.' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                avatar: user.avatar,
                role: user.role,
                bio: user.bio,
                coverImage: user.coverImage,
                themeColor: user.themeColor,
                isVerified: user.isVerified,
                isSuspended: user.isSuspended
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
