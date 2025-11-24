# Font Update Script for InnerGlow Project
# This script replaces fontWeight with fontFamily references

Write-Host "=== InnerGlow Font Update Script ===" -ForegroundColor Cyan
Write-Host ""

# Define files to update
$files = @(
    "mobile\app\(tabs)\home.jsx",
    "mobile\app\(tabs)\progress.jsx",
    "mobile\app\(tabs)\community.jsx",
    "mobile\app\index.jsx",
    "mobile\app\SignUp.jsx"
)

$projectRoot = $PSScriptRoot
$updatedCount = 0
$notFoundCount = 0

foreach ($file in $files) {
    $filePath = Join-Path $projectRoot $file
    
    if (Test-Path $filePath) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        $content = Get-Content $filePath -Raw
        $originalContent = $content
        
        # Replace fontWeight: 'bold' or fontWeight: '700' with fontFamily: 'Quicksand-Bold'
        $content = $content -replace "fontWeight:\s*'bold'", "fontFamily: 'Quicksand-Bold'"
        $content = $content -replace 'fontWeight:\s*"bold"', "fontFamily: 'Quicksand-Bold'"
        $content = $content -replace "fontWeight:\s*'700'", "fontFamily: 'Quicksand-Bold'"
        $content = $content -replace 'fontWeight:\s*"700"', "fontFamily: 'Quicksand-Bold'"
        
        # Replace fontWeight: '600' with fontFamily: 'Quicksand-SemiBold'
        $content = $content -replace "fontWeight:\s*'600'", "fontFamily: 'Quicksand-SemiBold'"
        $content = $content -replace 'fontWeight:\s*"600"', "fontFamily: 'Quicksand-SemiBold'"
        
        # Replace fontWeight: '500' with fontFamily: 'Quicksand-Medium'
        $content = $content -replace "fontWeight:\s*'500'", "fontFamily: 'Quicksand-Medium'"
        $content = $content -replace 'fontWeight:\s*"500"', "fontFamily: 'Quicksand-Medium'"
        
        # Replace fontWeight: '400' or 'normal' with fontFamily: 'Quicksand-Regular'
        $content = $content -replace "fontWeight:\s*'400'", "fontFamily: 'Quicksand-Regular'"
        $content = $content -replace 'fontWeight:\s*"400"', "fontFamily: 'Quicksand-Regular'"
        $content = $content -replace "fontWeight:\s*'normal'", "fontFamily: 'Quicksand-Regular'"
        $content = $content -replace 'fontWeight:\s*"normal"', "fontFamily: 'Quicksand-Regular'"
        
        # Replace fontWeight: '300' with fontFamily: 'Quicksand-Light'
        $content = $content -replace "fontWeight:\s*'300'", "fontFamily: 'Quicksand-Light'"
        $content = $content -replace 'fontWeight:\s*"300"', "fontFamily: 'Quicksand-Light'"
        
        # Check if any changes were made
        if ($content -ne $originalContent) {
            Set-Content $filePath $content -NoNewline
            Write-Host "  [OK] Updated $file" -ForegroundColor Green
            $updatedCount++
        } else {
            Write-Host "  - No changes needed for $file" -ForegroundColor Gray
        }
    } else {
        Write-Host "  [MISSING] File not found: $file" -ForegroundColor Red
        $notFoundCount++
    }
}

Write-Host ""
Write-Host "=== Font Update Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  - Files updated: $updatedCount" -ForegroundColor White
Write-Host "  - Files not found: $notFoundCount" -ForegroundColor White
Write-Host ""
