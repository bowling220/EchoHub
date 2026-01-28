# PowerShell script to update all hardcoded localhost URLs to use config

$files = @(
    "src\pages\Feed.jsx",
    "src\pages\Profile.jsx",
    "src\pages\Settings.jsx",
    "src\pages\Notifications.jsx",
    "src\pages\Admin.jsx",
    "src\pages\PostDetail.jsx",
    "src\components\PostCard.jsx",
    "src\components\RightBar.jsx"
)

$clientDir = "c:\Users\Blaine Oler\Gemini Website\EchoHub\client"

foreach ($file in $files) {
    $filePath = Join-Path $clientDir $file
    
    if (Test-Path $filePath) {
        Write-Host "Updating $file..." -ForegroundColor Cyan
        
        # Read file content
        $content = Get-Content $filePath -Raw
        
        # Check if config is already imported
        if ($content -notmatch "import config from") {
            # Add import after other imports
            $content = $content -replace "(import.*from.*;\r?\n)(\r?\n)(const|export|function)", "`$1import config from '../config';`$2`$3"
            
            # If no match, try adding after first import block
            if ($content -notmatch "import config from") {
                $content = $content -replace "(import.*;\r?\n)(\r?\n)([^i])", "`$1import config from '../config';`$2`$3"
            }
        }
        
        # Replace all axios calls with hardcoded URLs
        $content = $content -replace "axios\.(get|post|patch|delete|put)\('http://localhost:3001/", "axios.`$1(```${config.apiUrl}/"
        $content = $content -replace 'axios\.(get|post|patch|delete|put)\("http://localhost:3001/', 'axios.$1(`${config.apiUrl}/'
        
        # Save updated content
        Set-Content $filePath $content -NoNewline
        
        Write-Host "✓ Updated $file" -ForegroundColor Green
    } else {
        Write-Host "✗ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nAll files updated successfully!" -ForegroundColor Green
Write-Host "Remember to test the application locally before deploying." -ForegroundColor Yellow
