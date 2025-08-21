@echo off
echo Fixing markdown formatting for all portfolio files...

echo Fixing PORTFOLIO_README.md...
powershell.exe -Command "(Get-Content PORTFOLIO_README.md -Raw) -replace '(?m)^(#{1,6}[^\r\n]*)\r?\n([^#\r\n])', '$1`r`n`r`n$2' -replace '(?m)^([^#\r\n])\r?\n(#{1,6}\s)', '$1`r`n`r`n$2' -replace '(?m)^(-\s[^\r\n]*)\r?\n([^-\s])', '$1`r`n`r`n$2' -replace '(?m)^([^-\s\r\n])\r?\n(-\s)', '$1`r`n`r`n$2' -replace '(?m)^(```[^\r\n]*)\r?\n', '$1`r`n`r`n' -replace '(?m)\r?\n(```)\r?\n([^`])', '`r`n$1`r`n`r`n$2' -replace '[.!?]+$', '' | Set-Content PORTFOLIO_README.md"

echo Fixing BUG_FIXES_SUMMARY.md...
powershell.exe -Command "(Get-Content BUG_FIXES_SUMMARY.md -Raw) -replace '(?m)^(#{1,6}[^\r\n]*)\r?\n([^#\r\n])', '$1`r`n`r`n$2' -replace '(?m)^([^#\r\n])\r?\n(#{1,6}\s)', '$1`r`n`r`n$2' -replace '(?m)^(-\s[^\r\n]*)\r?\n([^-\s])', '$1`r`n`r`n$2' -replace '(?m)^([^-\s\r\n])\r?\n(-\s)', '$1`r`n`r`n$2' -replace '(?m)^(```[^\r\n]*)\r?\n', '$1`r`n`r`n' -replace '(?m)\r?\n(```)\r?\n([^`])', '`r`n$1`r`n`r`n$2' -replace '[.!?]+$', '' | Set-Content BUG_FIXES_SUMMARY.md"

echo Fixing LESSONS_LEARNED.md...
powershell.exe -Command "(Get-Content LESSONS_LEARNED.md -Raw) -replace '(?m)^(#{1,6}[^\r\n]*)\r?\n([^#\r\n])', '$1`r`n`r`n$2' -replace '(?m)^([^#\r\n])\r?\n(#{1,6}\s)', '$1`r`n`r`n$2' -replace '(?m)^(-\s[^\r\n]*)\r?\n([^-\s])', '$1`r`n`r`n$2' -replace '(?m)^([^-\s\r\n])\r?\n(-\s)', '$1`r`n`r`n$2' -replace '(?m)^(```[^\r\n]*)\r?\n', '$1`r`n`r`n' -replace '(?m)\r?\n(```)\r?\n([^`])', '`r`n$1`r`n`r`n$2' -replace '[.!?]+$', '' | Set-Content LESSONS_LEARNED.md"

echo Fixing TECHNICAL_HIGHLIGHTS.md...
powershell.exe -Command "(Get-Content TECHNICAL_HIGHLIGHTS.md -Raw) -replace '(?m)^(#{1,6}[^\r\n]*)\r?\n([^#\r\n])', '$1`r`n`r`n$2' -replace '(?m)^([^#\r\n])\r?\n(#{1,6}\s)', '$1`r`n`r`n$2' -replace '(?m)^(-\s[^\r\n]*)\r?\n([^-\s])', '$1`r`n`r`n$2' -replace '(?m)^([^-\s\r\n])\r?\n(-\s)', '$1`r`n`r`n$2' -replace '(?m)^(```[^\r\n]*)\r?\n', '$1`r`n`r`n' -replace '(?m)\r?\n(```)\r?\n([^`])', '`r`n$1`r`n`r`n$2' -replace '[.!?]+$', '' | Set-Content TECHNICAL_HIGHLIGHTS.md"

echo All markdown files have been formatted!
echo.
echo You can now commit these files to Git:
echo git add PORTFOLIO_README.md BUG_FIXES_SUMMARY.md LESSONS_LEARNED.md TECHNICAL_HIGHLIGHTS.md
echo git commit -m "docs: Format portfolio documentation for professional presentation"
