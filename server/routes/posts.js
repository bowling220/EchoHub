module.exports = (io) => {
    const express = require('express');
    const db = require('../db');
    const { createRemix } = require('../services/remixService');
    const { notify } = require('./notifications');
    const router = express.Router();

    // Get Feed
    router.get('/', (req, res) => {
        const currentUserId = req.query.currentUserId ? parseInt(req.query.currentUserId) : 0;
        const authorId = req.query.authorId;
        const parentId = req.query.parentId;
        const isFollowingFeed = req.query.following === 'true';

        let sql = `
      SELECT 
        p.*, 
        u.username, 
        u.avatar,
        u.isVerified,
        u.isSuspended,
        (SELECT COUNT(*) FROM likes WHERE postId = p.id) as likeCount,
        (SELECT COUNT(*) FROM likes WHERE postId = p.id AND userId = ?) as userLiked
      FROM posts p 
      JOIN users u ON p.userId = u.id 
    `;
        const params = [currentUserId];

        let whereClauses = [];
        if (authorId) {
            whereClauses.push(`p.userId = ?`);
            params.push(authorId);
        } else if (isFollowingFeed && currentUserId) {
            // Check if user follows anyone
            const followCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE followerId = ?').get(currentUserId).count;

            if (followCount > 0) {
                // Show posts from followed users + own posts
                whereClauses.push(`(p.userId IN (SELECT followingId FROM follows WHERE followerId = ?) OR p.userId = ?)`);
                params.push(currentUserId, currentUserId);
            }
            // If followCount === 0, don't add any user filter (show discovery feed)
        }

        if (parentId) {
            whereClauses.push(`p.parentId = ?`);
            params.push(parentId);
        } else if (!authorId) {
            // Only show top-level posts on main feeds
            whereClauses.push(`p.parentId IS NULL`);
        }

        if (whereClauses.length > 0) {
            sql += ` WHERE ` + whereClauses.join(' AND ');
        }

        // If following feed with no follows, sort by engagement (discovery mode)
        if (isFollowingFeed && currentUserId) {
            const followCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE followerId = ?').get(currentUserId).count;
            if (followCount === 0) {
                sql += ` ORDER BY (SELECT COUNT(*) FROM likes WHERE postId = p.id) DESC, p.createdAt DESC LIMIT 50`;
            } else {
                sql += ` ORDER BY p.createdAt DESC LIMIT 50`;
            }
        } else {
            sql += ` ORDER BY p.createdAt DESC LIMIT 50`;
        }

        try {
            const posts = db.prepare(sql).all(...params);
            const enriched = posts.map(p => ({ ...p, userLiked: p.userLiked > 0 }));
            res.json(enriched);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    });

    // Get Single Post by ID
    router.get('/:id', (req, res) => {
        const postId = req.params.id;
        const currentUserId = req.query.currentUserId ? parseInt(req.query.currentUserId) : 0;

        try {
            const post = db.prepare(`
                SELECT 
                    p.*, 
                    u.username, 
                    u.avatar,
                    u.isVerified,
                    u.isSuspended,
                    (SELECT COUNT(*) FROM likes WHERE postId = p.id) as likeCount,
                    (SELECT COUNT(*) FROM likes WHERE postId = p.id AND userId = ?) as userLiked
                FROM posts p 
                JOIN users u ON p.userId = u.id 
                WHERE p.id = ?
            `).get(currentUserId, postId);

            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            const enriched = { ...post, userLiked: post.userLiked > 0 };
            res.json(enriched);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    });

    // Get Trending / Analytics
    router.get('/analytics/trending', (req, res) => {
        try {
            const topPosts = db.prepare(`
        SELECT p.id, p.content, u.username, COUNT(l.id) as likes
        FROM posts p
        JOIN users u ON p.userId = u.id
        LEFT JOIN likes l ON p.id = l.postId
        GROUP BY p.id
        ORDER BY likes DESC
        LIMIT 5
      `).all();

            const activeUsers = db.prepare(`
        SELECT u.username, u.avatar, COUNT(p.id) as postCount
        FROM users u
        LEFT JOIN posts p ON u.id = p.userId
        GROUP BY u.id
        ORDER BY postCount DESC
        LIMIT 5
      `).all();

            res.json({ topPosts, activeUsers });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Create Post or Reply
    router.post('/', async (req, res) => {
        const { content, userId, parentId, contextBinding } = req.body;
        if (!content || !userId) return res.status(400).json({ error: 'Missing content or userId' });

        try {
            const type = parentId ? 'REPLY' : 'ORIGINAL';
            let originId = null;
            let parentPost = null;

            if (parentId) {
                parentPost = db.prepare('SELECT originId, id, userId FROM posts WHERE id = ?').get(parentId);
                if (parentPost) {
                    originId = parentPost.originId || parentPost.id;
                }
            }

            const stmt = db.prepare('INSERT INTO posts (content, userId, type, category, parentId, originId, contextBinding) VALUES (?, ?, ?, ?, ?, ?, ?)');
            const info = stmt.run(content, userId, type, type === 'ORIGINAL' ? 'thoughts' : null, parentId, originId, contextBinding);
            const newPostId = info.lastInsertRowid;

            if (parentId && parentPost) {
                const notifType = parentPost.originId ? 'BRANCH' : 'REPLY';
                notify(parentPost.userId, userId, notifType, newPostId);
            }

            if (!originId && type === 'ORIGINAL') {
                db.prepare('UPDATE posts SET originId = ? WHERE id = ?').run(newPostId, newPostId);
            }

            // Trigger AI Remix (Disabled by user request)
            /*
            const originalPost = { id: newPostId, content };
            const remixData = await createRemix(originalPost);
            const remixOrigin = originId || newPostId;
            let remixAuthorId = userId;
            const bot = db.prepare("SELECT id FROM users WHERE username = 'EchoBot'").get();
            if (bot) remixAuthorId = bot.id;
            const remixStmt = db.prepare('INSERT INTO posts (content, userId, type, category, parentId, originId) VALUES (?, ?, ?, ?, ?, ?)');
            const remixInfo = remixStmt.run(remixData.content, remixAuthorId, 'REMIX', remixData.category, newPostId, remixOrigin);
            if (userId !== remixAuthorId) {
                notify(userId, remixAuthorId, 'REMIX', remixInfo.lastInsertRowid);
            }
            */

            // Emit the original post instead so it appears in live feed
            const author = db.prepare('SELECT username, avatar FROM users WHERE id = ?').get(userId);
            const livePost = {
                id: newPostId,
                content,
                userId,
                type,
                parentId,
                originId: originId || newPostId,
                username: author.username,
                avatar: author.avatar,
                createdAt: new Date().toISOString(),
                likeCount: 0,
                userLiked: false
            };

            io.emit('new_post', livePost);
            res.status(201).json(livePost);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    });

    // Like Toggle
    router.post('/:id/like', (req, res) => {
        const { userId } = req.body;
        const postId = req.params.id;
        if (!userId) return res.status(400).json({ error: 'Missing userId' });

        try {
            const existing = db.prepare('SELECT * FROM likes WHERE userId = ? AND postId = ?').get(userId, postId);
            let liked = false;
            if (existing) {
                db.prepare('DELETE FROM likes WHERE userId = ? AND postId = ?').run(userId, postId);
            } else {
                db.prepare('INSERT INTO likes (userId, postId) VALUES (?, ?)').run(userId, postId);
                liked = true;

                const post = db.prepare('SELECT userId FROM posts WHERE id = ?').get(postId);
                if (post) notify(post.userId, userId, 'LIKE', postId);
            }
            const count = db.prepare('SELECT COUNT(*) as count FROM likes WHERE postId = ?').get(postId).count;
            res.json({ liked, count });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    });

    // Delete Post
    router.delete('/:id', (req, res) => {
        const userId = req.query.userId || req.body.userId; // Accept both for compatibility
        const postId = req.params.id;
        const reason = req.body.reason || req.query.reason;

        try {
            const post = db.prepare('SELECT userId, content FROM posts WHERE id = ?').get(postId);
            if (!post) return res.status(404).json({ error: 'Post not found' });

            const user = db.prepare('SELECT role FROM users WHERE id = ?').get(userId);
            const isAdmin = user && user.role === 'admin';

            if (post.userId !== parseInt(userId) && !isAdmin) {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            // Notify the post author if admin is deleting (not self-delete)
            // Don't pass postId since the post will be deleted, but pass content as context
            if (isAdmin && post.userId !== parseInt(userId)) {
                notify(post.userId, userId, 'POST_DELETED', null, reason || 'Violates community guidelines', post.content);
            }

            // To avoid foreign key violations, delete children first or nullify
            // For EchoHub, let's delete all replies/remixes associated with this post recursively (simplified)
            const children = db.prepare('SELECT id FROM posts WHERE parentId = ?').all(postId);
            for (const child of children) {
                // Recursive-ish cleanup for the immediate children's likes/notifications
                db.prepare('DELETE FROM likes WHERE postId = ?').run(child.id);
                db.prepare('DELETE FROM notifications WHERE postId = ?').run(child.id);
            }
            db.prepare('DELETE FROM posts WHERE parentId = ?').run(postId);

            // Now delete the post itself
            db.prepare('DELETE FROM likes WHERE postId = ?').run(postId);
            db.prepare('DELETE FROM notifications WHERE postId = ?').run(postId);
            db.prepare('DELETE FROM posts WHERE id = ?').run(postId);

            res.json({ success: true });
        } catch (err) {
            console.error('Delete error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // Edit Post
    router.patch('/:id', (req, res) => {
        const { userId, content } = req.body;
        const postId = req.params.id;

        try {
            const post = db.prepare('SELECT userId FROM posts WHERE id = ?').get(postId);
            if (!post) return res.status(404).json({ error: 'Post not found' });
            if (post.userId !== parseInt(userId)) return res.status(403).json({ error: 'Unauthorized' });

            db.prepare('UPDATE posts SET content = ? WHERE id = ?').run(content, postId);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Get Tree
    router.get('/tree/:rootId', (req, res) => {
        const rootId = req.params.rootId;
        const related = db.prepare(`
      SELECT p.*, u.username 
      FROM posts p 
      JOIN users u ON p.userId = u.id 
      WHERE p.id = ? OR p.originId = ? OR p.parentId = ?
      ORDER BY p.createdAt ASC
    `).all(rootId, rootId, rootId);
        res.json(related);
    });

    return router;
};
