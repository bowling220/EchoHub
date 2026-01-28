const express = require('express');
const db = require('../db');

module.exports = (io) => {
    const router = express.Router();

    // Get conversation list
    router.get('/conversations/:userId', (req, res) => {
        const { userId } = req.params;
        try {
            const conversations = db.prepare(`
                SELECT 
                    u.id, 
                    u.username, 
                    u.avatar,
                    (SELECT content FROM messages 
                     WHERE (senderId = u.id AND receiverId = ?) 
                        OR (senderId = ? AND receiverId = u.id)
                     ORDER BY createdAt DESC LIMIT 1) as lastMessage,
                    (SELECT createdAt FROM messages 
                     WHERE (senderId = u.id AND receiverId = ?) 
                        OR (senderId = ? AND receiverId = u.id)
                     ORDER BY createdAt DESC LIMIT 1) as lastTimestamp
                FROM users u
                WHERE u.id IN (
                    SELECT senderId FROM messages WHERE receiverId = ?
                    UNION
                    SELECT receiverId FROM messages WHERE senderId = ?
                )
            `).all(userId, userId, userId, userId, userId, userId);
            res.json(conversations);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Get messages between two users
    router.get('/:userId/:otherId', (req, res) => {
        const { userId, otherId } = req.params;
        try {
            const messages = db.prepare(`
                SELECT * FROM messages 
                WHERE (senderId = ? AND receiverId = ?) 
                   OR (senderId = ? AND receiverId = ?)
                ORDER BY createdAt ASC
            `).all(userId, otherId, otherId, userId);
            res.json(messages);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Send Message
    router.post('/', (req, res) => {
        const { senderId, receiverId, content } = req.body;
        if (!senderId || !receiverId || !content) return res.status(400).json({ error: 'Missing data' });

        try {
            const info = db.prepare('INSERT INTO messages (senderId, receiverId, content) VALUES (?, ?, ?)').run(senderId, receiverId, content);
            const newMessage = {
                id: info.lastInsertRowid,
                senderId,
                receiverId,
                content,
                createdAt: new Date().toISOString()
            };

            // Emit via socket for real-time
            io.emit('private_message', newMessage);
            res.status(201).json(newMessage);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
