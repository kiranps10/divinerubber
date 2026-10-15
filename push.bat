@echo off
setlocal
cd /d "%~dp0"

set MSG=%*
if "%MSG%"=="" set MSG=Update Divine Rubber website

echo ===================================================
echo Pushing Divine Rubber changes to GitHub...
echo Commit message: %MSG%
echo ===================================================

git add .
git commit -m "%MSG%"
git push origin main

echo.
echo ===================================================
echo Push completed!
echo ===================================================
pause
