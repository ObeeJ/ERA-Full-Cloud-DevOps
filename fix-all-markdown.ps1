# PowerShell script to fix all markdown formatting issues
# Run this from the project root directory

Write-Host "🔧 Fixing markdown formatting issues..." -ForegroundColor Green

# Function to remove trailing spaces
function Remove-TrailingSpaces {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        Write-Host "  📝 Removing trailing spaces from $FilePath" -ForegroundColor Yellow
        $content = Get-Content $FilePath -Raw
        $fixed = $content -replace '\s+\r?\n', "`n" -replace '\s+$', ''
        Set-Content $FilePath $fixed -NoNewline
        Add-Content $FilePath "`n"  # Ensure file ends with newline
    }
}

# Function to fix multiple blank lines
function Fix-MultipleBlankLines {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        Write-Host "  📝 Fixing multiple blank lines in $FilePath" -ForegroundColor Yellow
        $content = Get-Content $FilePath -Raw
        $fixed = $content -replace '\n\n\n+', "`n`n"
        Set-Content $FilePath $fixed -NoNewline
        Add-Content $FilePath "`n"  # Ensure file ends with newline
    }
}

# List of markdown files to fix
$markdownFiles = @(
    "README.md",
    "DEVOPS_SUMMARY.md",
    "LESSONS_LEARNED.md",
    "PORTFOLIO_README.md",
    "TECHNICAL_HIGHLIGHTS.md",
    "BUG_FIXES_SUMMARY.md",
    "DEPLOYMENT_GUIDE.md",
    "DEVOPS_README.md"
)

# Fix trailing spaces and multiple blank lines
foreach ($file in $markdownFiles) {
    if (Test-Path $file) {
        Remove-TrailingSpaces -FilePath $file
        Fix-MultipleBlankLines -FilePath $file
    } else {
        Write-Host "  ⚠️  File not found: $file" -ForegroundColor Red
    }
}

Write-Host "✅ Markdown formatting fixes completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary of fixes applied:" -ForegroundColor Cyan
Write-Host "  • Removed trailing spaces from all markdown files" -ForegroundColor White
Write-Host "  • Fixed multiple consecutive blank lines" -ForegroundColor White
Write-Host "  • Ensured all files end with a single newline" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review the files for any manual fixes needed" -ForegroundColor White
Write-Host "  2. Run a markdown linter to verify all issues are resolved" -ForegroundColor White
Write-Host "  3. Commit the changes to git" -ForegroundColor White
