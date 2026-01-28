# Quick Reference: Update Remaining Files

## Files that need updating:
1. src/pages/Feed.jsx
2. src/pages/Profile.jsx
3. src/pages/Settings.jsx
4. src/pages/Notifications.jsx
5. src/pages/Admin.jsx
6. src/pages/PostDetail.jsx
7. src/components/PostCard.jsx
8. src/components/RightBar.jsx

## Steps for each file:
1. Add import: `import config from '../config';` (or `'../../config'` for components)
2. Replace: `'http://localhost:3001/` with `` `${config.apiUrl}/``
3. Replace: `"http://localhost:3001/` with `` `${config.apiUrl}/``

## Example:
Before: `axios.get('http://localhost:3001/api/posts')`
After: `axios.get(\`${config.apiUrl}/api/posts\`)`

## Already Updated:
✓ App.jsx
✓ Messages.jsx  
✓ AuthContext.jsx
