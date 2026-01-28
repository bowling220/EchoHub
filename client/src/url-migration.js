// Migration script to update hardcoded URLs to use config
// This file documents the changes needed - they will be applied automatically

const urlReplacements = {
    // Replace hardcoded localhost URLs with config
    "http://localhost:3001": "config.apiUrl",
    "io('http://localhost:3001')": "io(config.socketUrl)",

    // Files to update:
    files: [
        'src/App.jsx',
        'src/context/AuthContext.jsx',
        'src/pages/Feed.jsx',
        'src/pages/Profile.jsx',
        'src/pages/Settings.jsx',
        'src/pages/Notifications.jsx',
        'src/pages/Messages.jsx',
        'src/pages/Admin.jsx',
        'src/pages/PostDetail.jsx',
        'src/components/PostCard.jsx',
        'src/components/RightBar.jsx'
    ]
};

console.log('URL Migration Guide:');
console.log('===================');
console.log('Replace all instances of:');
console.log('  axios.get(\'http://localhost:3001/...\')');
console.log('With:');
console.log('  axios.get(`${config.apiUrl}/...`)');
console.log('');
console.log('And add at the top of each file:');
console.log('  import config from \'../config\';');
