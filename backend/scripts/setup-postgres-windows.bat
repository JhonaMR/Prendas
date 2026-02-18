@echo off
REM Setup PostgreSQL for Windows
REM This script adds PostgreSQL to the Windows PATH

echo.
echo ============================================================
echo PostgreSQL Windows Setup
echo ============================================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator
    echo.
    echo Please:
    echo 1. Right-click on Command Prompt
    echo 2. Select "Run as Administrator"
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo Checking PostgreSQL installation...

REM Check if PostgreSQL 18 is installed
if exist "C:\Program Files\PostgreSQL\18\bin\psql.exe" (
    echo Found: PostgreSQL 18
    set POSTGRES_PATH=C:\Program Files\PostgreSQL\18\bin
) else if exist "C:\Program Files\PostgreSQL\17\bin\psql.exe" (
    echo Found: PostgreSQL 17
    set POSTGRES_PATH=C:\Program Files\PostgreSQL\17\bin
) else if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" (
    echo Found: PostgreSQL 16
    set POSTGRES_PATH=C:\Program Files\PostgreSQL\16\bin
) else (
    echo ERROR: PostgreSQL not found in Program Files
    echo.
    echo Please install PostgreSQL from: https://www.postgresql.org/download/windows/
    echo.
    pause
    exit /b 1
)

echo.
echo Adding PostgreSQL to PATH...
echo Path: %POSTGRES_PATH%
echo.

REM Add to PATH using setx
setx PATH "%PATH%;%POSTGRES_PATH%"

if %errorLevel% equ 0 (
    echo.
    echo ============================================================
    echo SUCCESS: PostgreSQL added to PATH
    echo ============================================================
    echo.
    echo IMPORTANT: You must restart Command Prompt or PowerShell
    echo for the changes to take effect.
    echo.
    echo After restarting, verify with:
    echo   psql --version
    echo.
) else (
    echo.
    echo ERROR: Failed to add PostgreSQL to PATH
    echo.
)

pause
