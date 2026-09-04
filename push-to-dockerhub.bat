@echo off
echo =======================================================
echo  Chameleon Backend - Build ^& Push to Docker Hub
echo  Target: muthukumaranarc/chameleon-backend:latest
echo =======================================================
echo.

:: Check if Docker daemon is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker daemon is not running!
    echo Please open "Docker Desktop" from your Desktop or Start Menu,
    echo wait a few seconds until Docker starts, and run this script again.
    echo.
    pause
    exit /b 1
)

echo [1/3] Building Chameleon Backend Docker image...
docker build -t muthukumaranarc/chameleon-backend:latest -f Backend/Chameleon/Dockerfile Backend/Chameleon

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Docker build failed! Check errors above.
    pause
    exit /b 1
)

echo.
echo [2/3] Verifying Docker Hub credentials for muthukumaranarc...
docker login

echo.
echo [3/3] Pushing image to Docker Hub: muthukumaranarc/chameleon-backend:latest...
docker push muthukumaranarc/chameleon-backend:latest

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Push failed! Ensure you are logged into muthukumaranarc on Docker Hub.
    pause
    exit /b 1
)

echo.
echo =======================================================
echo  SUCCESS! Your Docker image is live on Docker Hub:
echo  https://hub.docker.com/r/muthukumaranarc/chameleon-backend
echo =======================================================
pause
