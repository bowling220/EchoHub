const fs = require('fs');
const path = require('path');

const files = [
    { path: 'src/pages/Feed.jsx', configPath: '../config' },
    { path: 'src/pages/Profile.jsx', configPath: '../config' },
    { path: 'src/pages/Settings.jsx', configPath: '../config' },
    { path: 'src/pages/Notifications.jsx', configPath: '../config' },
    { path: 'src/pages/Admin.jsx', configPath: '../config' },
    { path: 'src/pages/PostDetail.jsx', configPath: '../config' },
    { path: 'src/components/PostCard.jsx', configPath: '../config' },
    { path: 'src/components/RightBar.jsx', configPath: '../config' }
];

const clientDir = __dirname;

console.log('🔧 Updating client files to use config...\n');

files.forEach(({ path: filePath, configPath }) => {
    const fullPath = path.join(clientDir, filePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`❌ File not found: ${filePath}`);
        return;
    }

    try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;

        // Check if config is already imported
        if (!content.includes("import config from")) {
            // Find the last import statement
            const importRegex = /import .* from .*;/g;
            const imports = content.match(importRegex);

            if (imports && imports.length > 0) {
                const lastImport = imports[imports.length - 1];
                const lastImportIndex = content.lastIndexOf(lastImport);
                const insertPosition = lastImportIndex + lastImport.length;

                content = content.slice(0, insertPosition) +
                    `\nimport config from '${configPath}';` +
                    content.slice(insertPosition);
                modified = true;
            }
        }

        // Replace hardcoded URLs
        const urlPattern = /(axios\.(get|post|patch|delete|put)\()['"]http:\/\/localhost:3001\//g;
        if (urlPattern.test(content)) {
            content = content.replace(urlPattern, '$1`${config.apiUrl}/');
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`✅ Updated: ${filePath}`);
        } else {
            console.log(`⏭️  Skipped (already updated): ${filePath}`);
        }

    } catch (error) {
        console.log(`❌ Error updating ${filePath}:`, error.message);
    }
});

console.log('\n✨ URL update complete!');
console.log('📝 Next steps:');
console.log('   1. Test locally: npm run dev');
console.log('   2. Check DEPLOYMENT_SUMMARY.md for deployment instructions');
