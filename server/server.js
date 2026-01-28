require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Environment configuration
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validate JWT secret in production
if (NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}

const io = new Server(server, {
    cors: {
        origin: NODE_ENV === 'production' ? CLIENT_URL : '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: NODE_ENV === 'production' ? CLIENT_URL : '*',
    credentials: true
}));
app.use(express.json());

// Health check endpoint for Render
app.get('/api/auth/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts')(io); // Pass io to posts for live events

const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const messageRoutes = require('./routes/messages')(io);

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

// Socket.io Connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
