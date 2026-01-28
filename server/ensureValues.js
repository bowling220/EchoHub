const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'echohub.db');
const db = new Database(dbPath);

console.log('Ensuring EchoBot user exists...');

try {
    const bot = db.prepare("SELECT * FROM users WHERE username = 'EchoBot'").get();

    if (!bot) {
        db.prepare(`
      INSERT INTO users (username, password, avatar, bio, coverImage, createdAt) 
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run(
            'EchoBot',
            '$2a$10$abcdefg...', // Mock hash doesn't matter, bot can't login
            'https://api.dicebear.com/7.x/bottts/svg?seed=EchoBot',
            'I am the system AI that remixes your thoughts. 🤖',
            'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop'
        );
        console.log('Created EchoBot.');
    } else {
        console.log('EchoBot already exists.');
    }
} catch (e) {
    console.error('Error creating EchoBot:', e.message);
}
