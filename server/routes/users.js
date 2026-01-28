const express = require('express');
const db = require('../db');

const router = express.Router();

// System/Admin routes first
router.get('/system/active', (req, res) => {
    try {
        const users = db.prepare('SELECT id, username, avatar, role, isVerified, isSuspended FROM users').all();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/system/stats', (req, res) => {
    try {
        const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
        const postCount = db.prepare('SELECT COUNT(*) as count FROM posts').get().count;
        res.json({
            totalUsers: userCount,
            totalPosts: postCount,
            systemHealth: 'Optimal',
            bandwidth: '98.4%'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/system/suspend/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const { adminId, reason } = req.body;
        const user = db.prepare('SELECT isSuspended FROM users WHERE id = ?').get(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const newState = user.isSuspended ? 0 : 1;
        const suspensionReason = newState === 1 ? (reason || 'Violation of community guidelines') : null;

        db.prepare('UPDATE users SET isSuspended = ?, suspensionReason = ? WHERE id = ?').run(newState, suspensionReason, userId);

        // Notify user about suspension/unsuspension
        if (newState === 1) {
            const { notify } = require('./notifications');
            notify(userId, adminId || 1, 'SUSPENSION', null, suspensionReason);
        }

        res.json({ success: true, isSuspended: newState });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Profile route
router.get('/:username', (req, res) => {
    const { username } = req.params;
    const currentUserId = req.query.currentUserId ? parseInt(req.query.currentUserId) : 0;

    try {
        const user = db.prepare('SELECT id, username, avatar, bio, coverImage, isVerified, isSuspended, createdAt FROM users WHERE username = ?').get(username);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const followers = db.prepare('SELECT COUNT(*) as count FROM follows WHERE followingId = ?').get(user.id).count;
        const following = db.prepare('SELECT COUNT(*) as count FROM follows WHERE followerId = ?').get(user.id).count;
        const isFollowing = currentUserId ? db.prepare('SELECT 1 FROM follows WHERE followerId = ? AND followingId = ?').get(currentUserId, user.id) : false;

        res.json({ ...user, followers, following, isFollowing: !!isFollowing });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Search identities
router.get('/system/search', (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    try {
        const users = db.prepare('SELECT id, username, avatar FROM users WHERE username LIKE ? LIMIT 5').all(`%${q}%`);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Other routes...
router.post('/:id/follow', (req, res) => {
    const targetId = req.params.id;
    const { currentUserId } = req.body;
    if (!currentUserId) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const existing = db.prepare('SELECT 1 FROM follows WHERE followerId = ? AND followingId = ?').get(currentUserId, targetId);
        if (existing) {
            db.prepare('DELETE FROM follows WHERE followerId = ? AND followingId = ?').run(currentUserId, targetId);
            res.json({ following: false });
        } else {
            db.prepare('INSERT INTO follows (followerId, followingId) VALUES (?, ?)').run(currentUserId, targetId);
            // Notifications removed for 'Silent Follow' - clout focus disabled.
            res.json({ following: true });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch('/profile', (req, res) => {
    const { userId, bio, avatar, coverImage, themeColor, publicKey } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    try {
        const stmt = db.prepare(`
            UPDATE users SET bio = COALESCE(?, bio), avatar = COALESCE(?, avatar), coverImage = COALESCE(?, coverImage), themeColor = COALESCE(?, themeColor), publicKey = COALESCE(?, publicKey) WHERE id = ?
        `);
        stmt.run(bio, avatar, coverImage, themeColor, publicKey, userId);
        const updatedUser = db.prepare('SELECT id, username, avatar, bio, coverImage, themeColor, isVerified, publicKey FROM users WHERE id = ?').get(userId);
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id/followers', (req, res) => {
    const targetId = req.params.id;
    try {
        const users = db.prepare('SELECT u.id, u.username, u.avatar, u.isVerified FROM users u JOIN follows f ON u.id = f.followerId WHERE f.followingId = ?').all(targetId);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id/following', (req, res) => {
    const targetId = req.params.id;
    try {
        const users = db.prepare('SELECT u.id, u.username, u.avatar, u.isVerified FROM users u JOIN follows f ON u.id = f.followingId WHERE f.followerId = ?').all(targetId);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
