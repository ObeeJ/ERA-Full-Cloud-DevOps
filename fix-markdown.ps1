# PowerShell script to fix common markdown linting issues
param(
    [string]$FilePath
)

if (-not $FilePath) {
    Write-Host "Usage: .\fix-markdown.ps1 -FilePath 'path\to\file.md'"
    exit 1
}

if (-not (Test-Path $FilePath)) {
    Write-Host "File not found: $FilePath"
    exit 1
}

Write-Host "Fixing markdown formatting in: $FilePath"

# Read the file content
$content = Get-Content $FilePath -Raw

# Fix MD022: Add blank lines around headings
$content = $content -replace '(?m)^([^#\r\n])(\r?\n)(#{1,6}\s)', '$1$2$2$3'
$content = $content -replace '(?m)(#{1,6}[^\r\n]*)(\r?\n)([^#\r\n])', '$1$2$2$3'

# Fix MD032: Add blank lines around lists
$content = $content -replace '(?m)^([^-*+\s\r\n])(\r?\n)([\-\*\+]\s)', '$1$2$2$3'
$content = $content -replace '(?m)([\-\*\+][^\r\n]*)(\r?\n)([^-*+\s\r\n])', '$1$2$2$3'

# Fix MD031: Add blank lines around code fences
$content = $content -replace '(?m)^([^`\r\n])(\r?\n)(```)', '$1$2$2$3'
$content = $content -replace '(?m)(```)(\r?\n)([^`\r\n])', '$1$2$2$3'

# Fix MD026: Remove trailing punctuation from headings
$content = $content -replace '(?m)(#{1,6}[^:\r\n]*):(\r?\n)', '$1$2'

# Clean up multiple consecutive blank lines (max 2)
$content = $content -replace '(\r?\n){3,}', '$1$1'

# Write the fixed content back
$content | Set-Content $FilePath -NoNewline

Write-Host "Markdown formatting fixed!"
