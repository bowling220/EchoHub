const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    try {
        const notifs = db.prepare(`
      SELECT n.*, u.username as actorName, u.avatar as actorAvatar, p.content as postSnippet 
      FROM notifications n
      LEFT JOIN users u ON n.actorId = u.id
      LEFT JOIN posts p ON n.postId = p.id
      WHERE n.userId = ?
      ORDER BY n.createdAt DESC
      LIMIT 50
    `).all(userId);

        res.json(notifs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get unread count
router.get('/unread-count', (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    try {
        const result = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0').get(userId);
        res.json({ count: result.count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark all as read
router.post('/mark-read', (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    try {
        db.prepare('UPDATE notifications SET isRead = 1 WHERE userId = ?').run(userId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete notification
router.delete('/:id', (req, res) => {
    const notifId = req.params.id;
    const userId = req.query.userId || req.body.userId;

    try {
        // Verify ownership before deleting
        const notif = db.prepare('SELECT userId FROM notifications WHERE id = ?').get(notifId);
        if (!notif) return res.status(404).json({ error: 'Notification not found' });
        if (notif.userId !== parseInt(userId)) return res.status(403).json({ error: 'Unauthorized' });

        db.prepare('DELETE FROM notifications WHERE id = ?').run(notifId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Helper function to create notifications
const notify = (userId, actorId, type, postId = null, reason = null, context = null) => {
    if (userId === actorId && type !== 'SUSPENSION' && type !== 'POST_DELETED') return; // Don't notify yourself except for admin actions
    try {
        db.prepare('INSERT INTO notifications (userId, actorId, type, postId, reason, context) VALUES (?, ?, ?, ?, ?, ?)').run(userId, actorId, type, postId, reason, context);
    } catch (e) {
        console.error('Notification error:', e);
    }
};

module.exports = router;
module.exports.notify = notify;
