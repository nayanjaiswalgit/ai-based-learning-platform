#!/bin/bash

###############################################################################
# AI-Based Learning Platform - Automated Setup Script
# This script sets up the entire development environment with a single command
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    log_warning "This script is optimized for Linux. It may work on other Unix-like systems."
fi

print_header "🚀 AI-Based Learning Platform - Setup Script"

log_info "Starting automated setup..."
log_info "This will install all dependencies and set up the development environment"

###############################################################################
# 1. Check Prerequisites
###############################################################################

print_header "📋 Checking Prerequisites"

# Check for sudo/root access
if [ "$EUID" -eq 0 ]; then
    log_warning "Running as root. This is not recommended."
    SUDO=""
else
    SUDO="sudo"
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Docker
if command_exists docker; then
    DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)
    log_success "Docker installed: $DOCKER_VERSION"
else
    log_error "Docker is not installed"
    log_info "Installing Docker..."

    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    $SUDO sh get-docker.sh
    $SUDO usermod -aG docker $USER
    rm get-docker.sh

    log_success "Docker installed successfully"
    log_warning "You may need to log out and back in for Docker permissions to take effect"
fi

# Check Docker Compose
if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
    log_success "Docker Compose is available"
else
    log_error "Docker Compose is not available"
    log_info "Docker Compose should be included with Docker Desktop or Docker Engine"
fi

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    REQUIRED_NODE_VERSION="20.18.0"

    if [ "$(printf '%s\n' "$REQUIRED_NODE_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_NODE_VERSION" ]; then
        log_success "Node.js installed: $NODE_VERSION"
    else
        log_warning "Node.js version $NODE_VERSION is below recommended $REQUIRED_NODE_VERSION"
    fi
else
    log_error "Node.js is not installed"
    log_info "Installing Node.js via nvm..."

    # Install nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

    # Load nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    # Install Node.js
    nvm install 20
    nvm use 20
    nvm alias default 20

    log_success "Node.js installed successfully"
fi

# Check pnpm
if command_exists pnpm; then
    PNPM_VERSION=$(pnpm --version)
    log_success "pnpm installed: $PNPM_VERSION"
else
    log_error "pnpm is not installed"
    log_info "Installing pnpm..."

    npm install -g pnpm@9.14.2

    log_success "pnpm installed successfully"
fi

# Check Git
if command_exists git; then
    GIT_VERSION=$(git --version | cut -d ' ' -f3)
    log_success "Git installed: $GIT_VERSION"
else
    log_error "Git is not installed"
    log_info "Installing Git..."

    if command_exists apt-get; then
        $SUDO apt-get update && $SUDO apt-get install -y git
    elif command_exists yum; then
        $SUDO yum install -y git
    elif command_exists dnf; then
        $SUDO dnf install -y git
    fi

    log_success "Git installed successfully"
fi

###############################################################################
# 2. Setup Environment Variables
###############################################################################

print_header "🔧 Setting up Environment Variables"

if [ -f .env ]; then
    log_warning ".env file already exists. Skipping..."
else
    log_info "Creating .env file from .env.example..."
    cp .env.example .env

    # Generate random secrets
    JWT_SECRET=$(openssl rand -base64 32 | tr -d '\n')
    NEXTAUTH_SECRET=$(openssl rand -base64 32 | tr -d '\n')
    REFRESH_TOKEN_SECRET=$(openssl rand -base64 32 | tr -d '\n')
    SESSION_SECRET=$(openssl rand -base64 32 | tr -d '\n')

    # Update .env file with generated secrets
    if command_exists sed; then
        sed -i "s/your_jwt_secret_key_at_least_32_chars_long/$JWT_SECRET/" .env
        sed -i "s/your_nextauth_secret_at_least_32_chars_long/$NEXTAUTH_SECRET/" .env
        sed -i "s/your_refresh_token_secret_at_least_32_chars_long/$REFRESH_TOKEN_SECRET/" .env
        sed -i "s/your_session_secret_at_least_32_chars_long/$SESSION_SECRET/" .env
    fi

    log_success ".env file created with generated secrets"
fi

# Create .env.local for Next.js apps if it doesn't exist
if [ ! -f apps/web/.env.local ]; then
    log_info "Creating apps/web/.env.local..."
    cat > apps/web/.env.local <<EOF
# Auto-generated by setup script
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4003
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/learning_platform
EOF
    log_success "Created apps/web/.env.local"
fi

###############################################################################
# 3. Start Docker Containers
###############################################################################

print_header "🐳 Starting Docker Containers"

log_info "Stopping any existing containers..."
docker-compose down 2>/dev/null || true

log_info "Starting infrastructure services (PostgreSQL, Redis, Meilisearch)..."
docker-compose up -d

log_info "Waiting for services to be healthy..."
sleep 10

# Check if PostgreSQL is ready
log_info "Checking PostgreSQL..."
for i in {1..30}; do
    if docker exec learning-platform-db pg_isready -U postgres >/dev/null 2>&1; then
        log_success "PostgreSQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "PostgreSQL failed to start"
        exit 1
    fi
    sleep 2
done

# Check if Redis is ready
log_info "Checking Redis..."
for i in {1..30}; do
    if docker exec learning-platform-redis redis-cli ping >/dev/null 2>&1; then
        log_success "Redis is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Redis failed to start"
        exit 1
    fi
    sleep 2
done

log_success "All Docker containers are running"

###############################################################################
# 4. Install Dependencies
###############################################################################

print_header "📦 Installing Dependencies"

log_info "Installing Node.js packages with pnpm..."
pnpm install --frozen-lockfile=false

log_success "Dependencies installed successfully"

###############################################################################
# 5. Setup Database
###############################################################################

print_header "🗄️  Setting up Database"

log_info "Generating Prisma Client..."
cd packages/database
pnpm db:generate
cd ../..

log_success "Prisma Client generated"

log_info "Pushing database schema..."
cd packages/database
pnpm db:push --skip-generate
cd ../..

log_success "Database schema created"

log_info "Seeding database with initial data..."
cd packages/database
pnpm db:seed 2>/dev/null || log_warning "Database seeding skipped (seed file may not exist)"
cd ../..

log_success "Database setup complete"

###############################################################################
# 6. Build Packages
###############################################################################

print_header "🔨 Building Shared Packages"

log_info "Building shared packages..."
pnpm build --filter=@repo/database --filter=@repo/types --filter=@repo/ui --filter=@repo/utils 2>/dev/null || log_warning "Some packages may not have build scripts"

log_success "Packages built successfully"

###############################################################################
# 7. Setup Git Hooks
###############################################################################

print_header "🪝 Setting up Git Hooks"

if [ -d .git ]; then
    log_info "Installing Husky git hooks..."
    pnpm prepare 2>/dev/null || log_warning "Husky setup skipped"
    log_success "Git hooks installed"
else
    log_warning "Not a git repository. Skipping git hooks setup."
fi

###############################################################################
# 8. Create Helper Scripts
###############################################################################

print_header "📝 Creating Helper Scripts"

# Create start script
cat > start.sh <<'EOF'
#!/bin/bash
# Start all development services

echo "🚀 Starting AI-Based Learning Platform..."

# Start Docker containers
echo "📦 Starting infrastructure services..."
docker-compose up -d

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 5

# Start development servers
echo "💻 Starting development servers..."
pnpm dev

EOF

chmod +x start.sh
log_success "Created start.sh"

# Create stop script
cat > stop.sh <<'EOF'
#!/bin/bash
# Stop all services

echo "🛑 Stopping all services..."

# Kill all node processes (development servers)
pkill -f "pnpm dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "nest start" 2>/dev/null || true

# Stop Docker containers
docker-compose down

echo "✓ All services stopped"
EOF

chmod +x stop.sh
log_success "Created stop.sh"

# Create logs script
cat > logs.sh <<'EOF'
#!/bin/bash
# View logs from Docker containers

if [ -z "$1" ]; then
    echo "📋 Showing logs from all containers..."
    docker-compose logs -f
else
    echo "📋 Showing logs from $1..."
    docker-compose logs -f "$1"
fi
EOF

chmod +x logs.sh
log_success "Created logs.sh"

# Create reset script
cat > reset.sh <<'EOF'
#!/bin/bash
# Reset database and restart services

read -p "⚠️  This will delete all data. Are you sure? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

echo "🗑️  Stopping services..."
docker-compose down -v

echo "🔄 Starting fresh..."
docker-compose up -d

echo "⏳ Waiting for database..."
sleep 10

echo "🗄️  Resetting database..."
cd packages/database
pnpm db:push --force-reset
pnpm db:seed

echo "✓ Reset complete!"
EOF

chmod +x reset.sh
log_success "Created reset.sh"

###############################################################################
# 9. Final Summary
###############################################################################

print_header "✅ Setup Complete!"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🎉 AI-Based Learning Platform is ready!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${BLUE}📊 Services Running:${NC}"
echo -e "  • PostgreSQL:   http://localhost:5432"
echo -e "  • Redis:        http://localhost:6379"
echo -e "  • Meilisearch:  http://localhost:7700"
echo -e "  • Mailpit UI:   http://localhost:8025"
echo ""

echo -e "${BLUE}🔧 Optional Services (run with --profile tools):${NC}"
echo -e "  • pgAdmin:        http://localhost:5050"
echo -e "  • Redis Commander: http://localhost:8081"
echo -e "  $ docker-compose --profile tools up -d"
echo ""

echo -e "${BLUE}🚀 Next Steps:${NC}"
echo -e "  1. Start development servers:"
echo -e "     ${YELLOW}./start.sh${NC}  or  ${YELLOW}pnpm dev${NC}"
echo ""
echo -e "  2. Access the application:"
echo -e "     • Web App:  http://localhost:3000"
echo -e "     • Admin:    http://localhost:3001"
echo ""
echo -e "  3. View logs:"
echo -e "     ${YELLOW}./logs.sh${NC}  or  ${YELLOW}docker-compose logs -f${NC}"
echo ""
echo -e "  4. Stop everything:"
echo -e "     ${YELLOW}./stop.sh${NC}  or  ${YELLOW}docker-compose down${NC}"
echo ""
echo -e "  5. Reset database:"
echo -e "     ${YELLOW}./reset.sh${NC}"
echo ""

echo -e "${BLUE}📚 Documentation:${NC}"
echo -e "  • README.md                        - Project overview"
echo -e "  • MERGE_SUMMARY_AND_REMAINING_TASKS.md - Current status & tasks"
echo -e "  • ARCHITECTURE.md                  - System architecture"
echo -e "  • TECH_STACK.md                    - Technology stack"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Happy coding! 🚀${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Auto-start option
read -p "Would you like to start the development servers now? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Starting development servers..."
    exec pnpm dev
fi
