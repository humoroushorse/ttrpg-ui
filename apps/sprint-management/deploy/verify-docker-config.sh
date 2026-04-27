#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Docker Configuration Verification ===${NC}"
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

echo ""
info "Checking Dockerfile..."
if [ -f "apps/sprint-management/deploy/Dockerfile" ]; then
    success "Dockerfile exists"
else
    error "Dockerfile not found"
    exit 1
fi

echo ""
info "Checking Dockerfile syntax..."
if grep -q "FROM node:" apps/sprint-management/deploy/Dockerfile && \
   grep -q "FROM nginx:" apps/sprint-management/deploy/Dockerfile; then
    success "Dockerfile has multi-stage build"
else
    error "Dockerfile missing multi-stage build"
    exit 1
fi

echo ""
info "Checking docker-compose.yml..."
if [ -f "apps/sprint-management/deploy/docker-compose.yml" ]; then
    success "docker-compose.yml exists"
else
    error "docker-compose.yml not found"
    exit 1
fi

echo ""
info "Checking docker-entrypoint.sh..."
if [ -f "apps/sprint-management/deploy/docker-entrypoint.sh" ]; then
    success "docker-entrypoint.sh exists"

    if [ -x "apps/sprint-management/deploy/docker-entrypoint.sh" ]; then
        success "docker-entrypoint.sh is executable"
    else
        info "docker-entrypoint.sh is not executable (will be set in Dockerfile)"
    fi
else
    error "docker-entrypoint.sh not found"
    exit 1
fi

echo ""
info "Checking Nginx configuration..."
if [ -f "apps/sprint-management/deploy/nginx/nginx.conf" ]; then
    success "nginx.conf exists"
else
    error "nginx.conf not found"
    exit 1
fi

if [ -f "apps/sprint-management/deploy/nginx/templates/default.conf.template" ]; then
    success "default.conf.template exists"
else
    error "default.conf.template not found"
    exit 1
fi

echo ""
info "Checking app.config.template.json..."
if [ -f "apps/sprint-management/src/assets/app.config.template.json" ]; then
    success "app.config.template.json exists"
else
    error "app.config.template.json not found"
    exit 1
fi

echo ""
info "Checking environment variable substitution..."
if grep -q "APP_SPRINT_MANAGEMENT__API_BASE_PATH" apps/sprint-management/deploy/docker-entrypoint.sh && \
   grep -q "APP_SPRINT_MANAGEMENT__API_URL" apps/sprint-management/deploy/docker-entrypoint.sh; then
    success "Environment variable substitution configured"
else
    error "Environment variable substitution not configured"
    exit 1
fi

echo ""
info "Checking Kubernetes manifests..."
if [ -f "apps/sprint-management/deploy/deployment.yml" ]; then
    success "deployment.yml exists"
else
    info "deployment.yml not found (optional)"
fi

if [ -f "apps/sprint-management/deploy/service.yml" ]; then
    success "service.yml exists"
else
    info "service.yml not found (optional)"
fi

if [ -f "apps/sprint-management/deploy/ingress.yml" ]; then
    success "ingress.yml exists"
else
    info "ingress.yml not found (optional)"
fi

echo ""
info "Checking Cloudflare tunnel configuration..."
if [ -f "apps/sprint-management/deploy/cloudflared.yaml" ]; then
    success "cloudflared.yaml exists"
else
    info "cloudflared.yaml not found (optional)"
fi

echo ""
info "Checking Dockerfile paths..."
if grep -q "COPY apps/sprint-management/deploy/nginx" apps/sprint-management/deploy/Dockerfile; then
    success "Nginx configuration paths are correct"
else
    error "Nginx configuration paths may be incorrect"
    exit 1
fi

if grep -q "COPY apps/sprint-management/src/assets/app.config.template.json" apps/sprint-management/deploy/Dockerfile; then
    success "App config template path is correct"
else
    error "App config template path may be incorrect"
    exit 1
fi

echo ""
info "Checking exposed ports..."
if grep -q "EXPOSE 80" apps/sprint-management/deploy/Dockerfile; then
    success "Port 80 is exposed"
else
    error "Port 80 is not exposed"
    exit 1
fi

echo ""
info "Checking docker-compose environment variables..."
if grep -q "APP_SPRINT_MANAGEMENT__API_BASE_PATH" apps/sprint-management/deploy/docker-compose.yml && \
   grep -q "APP_SPRINT_MANAGEMENT__API_URL" apps/sprint-management/deploy/docker-compose.yml; then
    success "Environment variables configured in docker-compose.yml"
else
    error "Environment variables not configured in docker-compose.yml"
    exit 1
fi

echo ""
info "Checking Nginx template variables..."
if grep -q "\$NGINX_PORT" apps/sprint-management/deploy/nginx/templates/default.conf.template; then
    success "Nginx template uses NGINX_PORT variable"
else
    info "Nginx template may not use NGINX_PORT variable"
fi

echo ""
info "Checking app.config.template.json placeholders..."
if grep -q "APP_SPRINT_MANAGEMENT__API_BASE_PATH" apps/sprint-management/src/assets/app.config.template.json && \
   grep -q "APP_SPRINT_MANAGEMENT__API_URL" apps/sprint-management/src/assets/app.config.template.json; then
    success "app.config.template.json has environment variable placeholders"
else
    error "app.config.template.json missing environment variable placeholders"
    exit 1
fi

echo ""
info "Checking entrypoint script shebang..."
if head -n 1 apps/sprint-management/deploy/docker-entrypoint.sh | grep -q "#!/bin/sh\|#!/bin/bash"; then
    success "Entrypoint script has proper shebang"
else
    error "Entrypoint script missing proper shebang"
    exit 1
fi

echo ""
echo -e "${GREEN}=== All configuration checks passed! ===${NC}"
echo ""
echo "Docker configuration is valid and ready for building."
echo ""
echo "Next steps:"
echo "  1. Fix any application build errors"
echo "  2. Run: ./apps/sprint-management/deploy/test-docker.sh"
echo "  3. Or build manually: docker build -t sprint-management-app:test -f apps/sprint-management/deploy/Dockerfile ."
echo ""
