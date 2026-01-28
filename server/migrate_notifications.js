const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'echohub.db');
const db = new Database(dbPath);

console.log('Running Notification migration...');

try {
    db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      actorId INTEGER NOT NULL,
      type TEXT NOT NULL, -- 'LIKE', 'REMIX', 'FOLLOW', 'REPLY'
      postId INTEGER,
      isRead BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (actorId) REFERENCES users(id),
      FOREIGN KEY (postId) REFERENCES posts(id)
    );
  `);
    console.log('Notifications table created.');

} catch (e) {
    console.error('Migration error:', e.message);
}
