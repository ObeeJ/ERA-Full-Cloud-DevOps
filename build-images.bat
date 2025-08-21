@echo off
REM Raally Application Build Script for Windows
REM This script builds Docker images for the Raally application

setlocal EnableDelayedExpansion

REM Configuration
set PROJECT_NAME=raally
set VERSION=%1
if "%VERSION%"=="" set VERSION=v1.0.0

set REGISTRY=%2
if "%REGISTRY%"=="" set REGISTRY=123456789012.dkr.ecr.us-west-2.amazonaws.com

set PUSH_IMAGES=%3
if "%PUSH_IMAGES%"=="" set PUSH_IMAGES=false

echo 🚀 Building Raally Application Docker Images
echo Version: %VERSION%
echo Registry: %REGISTRY%
echo Push to registry: %PUSH_IMAGES%
echo ======================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Build backend image
echo 📦 Building backend image...
docker build -t %PROJECT_NAME%/backend:%VERSION% -t %PROJECT_NAME%/backend:latest ./raally-backend-js-node
if %errorlevel% neq 0 (
    echo ❌ Failed to build backend image
    exit /b 1
)

if not "%REGISTRY%"=="local" (
    docker tag %PROJECT_NAME%/backend:%VERSION% %REGISTRY%/%PROJECT_NAME%/backend:%VERSION%
    docker tag %PROJECT_NAME%/backend:latest %REGISTRY%/%PROJECT_NAME%/backend:latest
)
echo ✅ Successfully built backend image

REM Build frontend image
echo 📦 Building frontend image...
docker build -t %PROJECT_NAME%/frontend:%VERSION% -t %PROJECT_NAME%/frontend:latest ./raally-frontend-js-react
if %errorlevel% neq 0 (
    echo ❌ Failed to build frontend image
    exit /b 1
)

if not "%REGISTRY%"=="local" (
    docker tag %PROJECT_NAME%/frontend:%VERSION% %REGISTRY%/%PROJECT_NAME%/frontend:%VERSION%
    docker tag %PROJECT_NAME%/frontend:latest %REGISTRY%/%PROJECT_NAME%/frontend:latest
)
echo ✅ Successfully built frontend image

REM Login to ECR if pushing and using AWS ECR
if "%PUSH_IMAGES%"=="true" (
    if not "%REGISTRY%"=="local" (
        echo 🔐 Logging into AWS ECR...
        for /f "tokens=*" %%i in ('aws ecr get-login-password --region us-west-2') do set ECR_PASSWORD=%%i
        echo !ECR_PASSWORD! | docker login --username AWS --password-stdin %REGISTRY%
    )
)

REM Push images if requested
if "%PUSH_IMAGES%"=="true" (
    if not "%REGISTRY%"=="local" (
        echo 🚢 Pushing backend image...
        docker push %REGISTRY%/%PROJECT_NAME%/backend:%VERSION%
        docker push %REGISTRY%/%PROJECT_NAME%/backend:latest
        echo ✅ Successfully pushed backend image

        echo 🚢 Pushing frontend image...
        docker push %REGISTRY%/%PROJECT_NAME%/frontend:%VERSION%
        docker push %REGISTRY%/%PROJECT_NAME%/frontend:latest
        echo ✅ Successfully pushed frontend image
    )
)

REM Display summary
echo.
echo 🎉 Build Summary
echo ================
echo ✅ Backend image: %PROJECT_NAME%/backend:%VERSION%
echo ✅ Frontend image: %PROJECT_NAME%/frontend:%VERSION%

if "%PUSH_IMAGES%"=="true" (
    if not "%REGISTRY%"=="local" (
        echo ✅ Images pushed to: %REGISTRY%
    )
) else (
    echo 📦 Images built locally only
)

echo.
echo 🔧 Next steps:
if "%PUSH_IMAGES%"=="false" (
    echo 1. Test locally: docker-compose up
    echo 2. Push to registry: %~nx0 %VERSION% %REGISTRY% true
)
echo 3. Deploy to Kubernetes: kubectl apply -k k8s/overlays/production
echo 4. Check deployment: kubectl get pods -n raally

echo.
echo 🐳 Available images:
docker images | findstr %PROJECT_NAME%

endlocal
