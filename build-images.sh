#!/bin/bash

# Raally Application Build Script
# This script builds and optionally pushes Docker images for the Raally application

set -e  # Exit on any error

# Configuration
PROJECT_NAME="raally"
VERSION=${1:-"v1.0.0"}
REGISTRY=${2:-"123456789012.dkr.ecr.us-west-2.amazonaws.com"}
PUSH_IMAGES=${3:-false}

echo "🚀 Building Raally Application Docker Images"
echo "Version: $VERSION"
echo "Registry: $REGISTRY"
echo "Push to registry: $PUSH_IMAGES"
echo "======================================"

# Function to build and tag image
build_and_tag() {
    local service=$1
    local context=$2
    local image_name="$PROJECT_NAME/$service"
    local full_image_name="$REGISTRY/$image_name:$VERSION"
    
    echo "📦 Building $service image..."
    docker build -t "$image_name:$VERSION" -t "$image_name:latest" "$context"
    
    if [ "$REGISTRY" != "local" ]; then
        docker tag "$image_name:$VERSION" "$full_image_name"
        docker tag "$image_name:latest" "$REGISTRY/$image_name:latest"
    fi
    
    echo "✅ Successfully built $service image"
}

# Function to push image
push_image() {
    local service=$1
    local image_name="$PROJECT_NAME/$service"
    local full_image_name="$REGISTRY/$image_name:$VERSION"
    local latest_image_name="$REGISTRY/$image_name:latest"
    
    echo "🚢 Pushing $service image..."
    docker push "$full_image_name"
    docker push "$latest_image_name"
    echo "✅ Successfully pushed $service image"
}

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build backend image
echo "Building backend image..."
build_and_tag "backend" "./raally-backend-js-node"

# Build frontend image
echo "Building frontend image..."
build_and_tag "frontend" "./raally-frontend-js-react"

# Login to ECR if pushing and using AWS ECR
if [ "$PUSH_IMAGES" = "true" ] && [[ "$REGISTRY" == *"ecr"* ]]; then
    echo "🔐 Logging into AWS ECR..."
    aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin "$REGISTRY"
fi

# Push images if requested
if [ "$PUSH_IMAGES" = "true" ] && [ "$REGISTRY" != "local" ]; then
    echo "Pushing images to registry..."
    push_image "backend"
    push_image "frontend"
fi

# Display summary
echo ""
echo "🎉 Build Summary"
echo "================"
echo "✅ Backend image: $PROJECT_NAME/backend:$VERSION"
echo "✅ Frontend image: $PROJECT_NAME/frontend:$VERSION"

if [ "$PUSH_IMAGES" = "true" ] && [ "$REGISTRY" != "local" ]; then
    echo "✅ Images pushed to: $REGISTRY"
else
    echo "📦 Images built locally only"
fi

echo ""
echo "🔧 Next steps:"
if [ "$PUSH_IMAGES" = "false" ]; then
    echo "1. Test locally: docker-compose up"
    echo "2. Push to registry: $0 $VERSION $REGISTRY true"
fi
echo "3. Deploy to Kubernetes: kubectl apply -k k8s/overlays/production"
echo "4. Check deployment: kubectl get pods -n raally"

echo ""
echo "🐳 Available images:"
docker images | grep "$PROJECT_NAME" | head -10
