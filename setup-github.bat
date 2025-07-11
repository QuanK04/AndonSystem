@echo off
echo ========================================
echo Smart Andon System - GitHub Setup
echo ========================================
echo.

echo Initializing Git repository...
git init

echo Adding all files to Git...
git add .

echo Creating initial commit...
git commit -m "Initial commit: Smart Andon System for TEKCOM Manufacturing"

echo.
echo ========================================
echo GitHub Repository Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Go to https://github.com/QuanK04
echo 2. Click "New repository"
echo 3. Name it: andon-system-tekcom
echo 4. Make it Public
echo 5. Don't initialize with README (we already have one)
echo 6. Click "Create repository"
echo.
echo Then run these commands:
echo git remote add origin https://github.com/QuanK04/andon-system-tekcom.git
echo git branch -M main
echo git push -u origin main
echo.
echo Press any key to continue...
pause > nul 