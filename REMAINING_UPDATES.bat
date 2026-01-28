@echo off
echo ========================================
echo EchoHub - Remaining Files to Update
echo ========================================
echo.
echo The following files still need to be updated:
echo.
echo 1. client\src\components\RightBar.jsx
echo 2. client\src\pages\Feed.jsx
echo 3. client\src\pages\Profile.jsx
echo 4. client\src\pages\Settings.jsx
echo 5. client\src\pages\Notifications.jsx
echo 6. client\src\pages\Admin.jsx
echo 7. client\src\pages\PostDetail.jsx
echo.
echo ========================================
echo What to do in each file:
echo ========================================
echo.
echo 1. Add this import at the top:
echo    import config from '../config';
echo.
echo 2. Replace all instances of:
echo    'http://localhost:3001/'
echo    with:
echo    `${config.apiUrl}/`
echo.
echo ========================================
echo Quick Method (VS Code):
echo ========================================
echo.
echo 1. Open VS Code
echo 2. Press Ctrl+Shift+F (Find in Files)
echo 3. Search: 'http://localhost:3001/
echo 4. Replace: `${config.apiUrl}/
echo 5. Review and apply changes
echo 6. Add import statement to each file
echo.
echo ========================================
echo.
pause
