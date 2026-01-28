const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'echohub.db');
const db = new Database(dbPath);

console.log('Running theme migration...');

try {
    const usersInfo = db.pragma('table_info(users)');
    const hasThemeColor = usersInfo.some(col => col.name === 'themeColor');

    if (!hasThemeColor) {
        db.prepare('ALTER TABLE users ADD COLUMN themeColor TEXT DEFAULT "#00f0ff"').run();
        console.log('Added themeColor column.');
    } else {
        console.log('themeColor column already exists.');
    }

    console.log('Migration complete.');
} catch (e) {
    console.error('Migration failed:', e.message);
}
