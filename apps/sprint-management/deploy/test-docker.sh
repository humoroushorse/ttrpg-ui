#!/bin/bash

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

IMAGE_NAME="sprint-management-app"
IMAGE_TAG="test-$(date +%s)"
CONTAINER_NAME="sprint-management-test"
TEST_PORT="8080"

echo -e "${YELLOW}=== Sprint Management Docker Build and Deployment Test ===${NC}"
echo ""

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

error() {
    echo -e "${RED}✗ $1${NC}"
}

info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

cleanup() {
    info "Cleaning up..."
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
    docker rmi "$IMAGE_NAME:$IMAGE_TAG" 2>/dev/null || true
    success "Cleanup complete"
}

trap cleanup EXIT

echo ""
info "Test 1: Building Docker image..."
if docker build \
    -t "$IMAGE_NAME:$IMAGE_TAG" \
    -f apps/sprint-management/deploy/Dockerfile \
    . ; then
    success "Docker image built successfully"
else
    error "Docker image build failed"
    exit 1
fi

echo ""
info "Test 2: Verifying Docker image..."
if docker images | grep -q "$IMAGE_NAME.*$IMAGE_TAG"; then
    success "Docker image exists"
else
    error "Docker image not found"
    exit 1
fi

echo ""
info "Test 3: Starting container with custom environment variables..."
docker run -d \
    --name "$CONTAINER_NAME" \
    -p "$TEST_PORT:80" \
    -e "NGINX_PORT=80" \
    -e "APP_SPRINT_MANAGEMENT__API_BASE_PATH=/api/v1" \
    -e "APP_SPRINT_MANAGEMENT__API_URL=http://backend:8003" \
    "$IMAGE_NAME:$IMAGE_TAG"

if [ $? -eq 0 ]; then
    success "Container started successfully"
else
    error "Container failed to start"
    exit 1
fi

info "Waiting for container to be ready..."
sleep 5

echo ""
info "Test 4: Verifying container is running..."
if docker ps | grep -q "$CONTAINER_NAME"; then
    success "Container is running"
else
    error "Container is not running"
    docker logs "$CONTAINER_NAME"
    exit 1
fi

echo ""
info "Test 5: Testing HTTP response..."
if curl -f -s "http://localhost:$TEST_PORT" > /dev/null; then
    success "HTTP response successful"
else
    error "HTTP response failed"
    docker logs "$CONTAINER_NAME"
    exit 1
fi

echo ""
info "Test 6: Verifying HTML content..."
RESPONSE=$(curl -s "http://localhost:$TEST_PORT")
if echo "$RESPONSE" | grep -q "<html"; then
    success "HTML content is being served"
else
    error "HTML content not found"
    echo "Response: $RESPONSE"
    exit 1
fi

echo ""
info "Test 7: Verifying app.config.json is accessible..."
if curl -f -s "http://localhost:$TEST_PORT/browser/assets/app.config.json" > /dev/null; then
    success "app.config.json is accessible"
else
    error "app.config.json is not accessible"
    docker logs "$CONTAINER_NAME"
    exit 1
fi

echo ""
info "Test 8: Verifying environment variable substitution..."
CONFIG_CONTENT=$(curl -s "http://localhost:$TEST_PORT/browser/assets/app.config.json")
if echo "$CONFIG_CONTENT" | grep -q "APP_SPRINT_MANAGEMENT__API_BASE_PATH"; then
    if echo "$CONFIG_CONTENT" | grep -q "/api/v1"; then
        success "Environment variables substituted correctly in app.config.json"
    else
        error "Environment variable substitution failed - value not found"
        echo "Config content: $CONFIG_CONTENT"
        exit 1
    fi
else
    error "Environment variable substitution failed - key not found"
    echo "Config content: $CONFIG_CONTENT"
    exit 1
fi

echo ""
info "Test 9: Verifying Nginx configuration..."
docker exec "$CONTAINER_NAME" nginx -t
if [ $? -eq 0 ]; then
    success "Nginx configuration is valid"
else
    error "Nginx configuration is invalid"
    exit 1
fi

echo ""
info "Test 10: Verifying gzip compression..."
GZIP_HEADER=$(curl -s -I -H "Accept-Encoding: gzip" "http://localhost:$TEST_PORT" | grep -i "content-encoding: gzip")
if [ -n "$GZIP_HEADER" ]; then
    success "Gzip compression is enabled"
else
    info "Gzip compression may not be enabled (this is OK for small responses)"
fi

echo ""
info "Test 11: Verifying security headers..."
HEADERS=$(curl -s -I "http://localhost:$TEST_PORT")

if echo "$HEADERS" | grep -qi "X-Frame-Options"; then
    success "X-Frame-Options header is present"
else
    info "X-Frame-Options header not found (may need configuration)"
fi

if echo "$HEADERS" | grep -qi "X-Content-Type-Options"; then
    success "X-Content-Type-Options header is present"
else
    info "X-Content-Type-Options header not found (may need configuration)"
fi

echo ""
info "Test 12: Verifying SPA routing fallback..."
RESPONSE=$(curl -s "http://localhost:$TEST_PORT/work-items")
if echo "$RESPONSE" | grep -q "<html"; then
    success "SPA routing fallback works"
else
    error "SPA routing fallback failed"
    exit 1
fi

echo ""
info "Test 13: Verifying static assets..."
if curl -f -s "http://localhost:$TEST_PORT/favicon.ico" > /dev/null 2>&1; then
    success "Static assets are being served"
else
    info "Favicon not found (this is OK if not configured)"
fi

echo ""
info "Test 14: Checking container logs for errors..."
LOGS=$(docker logs "$CONTAINER_NAME" 2>&1)
if echo "$LOGS" | grep -qi "error"; then
    info "Errors found in logs (review manually):"
    echo "$LOGS" | grep -i "error"
else
    success "No errors found in container logs"
fi

echo ""
info "Test 15: Checking container resource usage..."
docker stats "$CONTAINER_NAME" --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
success "Container resource usage displayed above"

echo ""
info "Test 16: Testing container restart..."
docker restart "$CONTAINER_NAME"
sleep 3
if docker ps | grep -q "$CONTAINER_NAME"; then
    success "Container restarted successfully"
else
    error "Container failed to restart"
    exit 1
fi

echo ""
info "Test 17: Verifying health after restart..."
sleep 2
if curl -f -s "http://localhost:$TEST_PORT" > /dev/null; then
    success "Application is healthy after restart"
else
    error "Application is not healthy after restart"
    exit 1
fi

echo ""
echo -e "${GREEN}=== All Docker tests passed! ===${NC}"
echo ""
echo "Image: $IMAGE_NAME:$IMAGE_TAG"
echo "Container: $CONTAINER_NAME"
echo "Port: $TEST_PORT"
echo ""
echo "To manually inspect the container:"
echo "  docker logs $CONTAINER_NAME"
echo "  docker exec -it $CONTAINER_NAME sh"
echo ""
echo "To access the application:"
echo "  http://localhost:$TEST_PORT"
echo ""
