const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'echohub.db');
const db = new Database(dbPath);

console.log('Running role migration...');

try {
    const usersInfo = db.pragma('table_info(users)');
    const hasRole = usersInfo.some(col => col.name === 'role');

    if (!hasRole) {
        db.prepare('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "user"').run();
        console.log('Added role column.');
    }

    // Set the first user or specific username as admin
    // For safety in this environment, let's set 'blaine' or the first user to admin if it exists
    const firstUser = db.prepare('SELECT id, username FROM users ORDER BY id ASC LIMIT 1').get();
    if (firstUser) {
        db.prepare('UPDATE users SET role = "admin" WHERE id = ?').run(firstUser.id);
        console.log(`User ${firstUser.username} (ID: ${firstUser.id}) promoted to admin.`);
    }

    console.log('Migration complete.');
} catch (e) {
    console.error('Migration failed:', e.message);
}
