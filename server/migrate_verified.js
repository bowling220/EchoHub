const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'echohub.db');
const db = new Database(dbPath);

console.log('Running verified status migration...');

try {
    const usersInfo = db.pragma('table_info(users)');
    const hasVerified = usersInfo.some(col => col.name === 'isVerified');

    if (!hasVerified) {
        db.prepare('ALTER TABLE users ADD COLUMN isVerified INTEGER DEFAULT 0').run();
        console.log('Added isVerified column.');
    }

    // Set EchoBot as verified by default
    db.prepare("UPDATE users SET isVerified = 1 WHERE username = 'EchoBot'").run();
    console.log('EchoBot has been verified.');

    console.log('Migration complete.');
} catch (e) {
    console.error('Migration failed:', e.message);
}
