const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'echohub.db');
const db = new Database(dbPath);

console.log('Running migration...');

try {
    const usersInfo = db.pragma('table_info(users)');
    const hasBio = usersInfo.some(col => col.name === 'bio');

    if (!hasBio) {
        db.exec("ALTER TABLE users ADD COLUMN bio TEXT DEFAULT ''");
        console.log('Added bio column.');
    }

    const hasCover = usersInfo.some(col => col.name === 'coverImage');
    if (!hasCover) {
        db.exec("ALTER TABLE users ADD COLUMN coverImage TEXT DEFAULT 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop'");
        console.log('Added coverImage column.');
    }

    db.exec(`
    CREATE TABLE IF NOT EXISTS follows (
      followerId INTEGER NOT NULL,
      followingId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (followerId, followingId),
      FOREIGN KEY (followerId) REFERENCES users(id),
      FOREIGN KEY (followingId) REFERENCES users(id)
    );
  `);
    console.log('Ensured follows table exists.');

} catch (e) {
    console.error('Migration error:', e.message);
}
