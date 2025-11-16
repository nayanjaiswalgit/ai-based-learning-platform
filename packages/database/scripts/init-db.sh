#!/bin/bash

# Database Initialization Script
# Comprehensive setup for the AI-based learning platform database

set -e

echo "🚀 Initializing AI-Based Learning Platform Database..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required environment variables are set
check_env_vars() {
    print_info "Checking environment variables..."

    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL is not set"
        exit 1
    fi

    print_success "Environment variables OK"
}

# Check if Docker is running
check_docker() {
    print_info "Checking Docker..."

    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker."
        exit 1
    fi

    print_success "Docker is running"
}

# Start infrastructure services
start_infrastructure() {
    print_info "Starting infrastructure services..."

    cd ../../infrastructure

    # Start PostgreSQL, Redis, Meilisearch
    docker-compose -f docker-compose.dev.yml up -d

    print_success "Infrastructure services started"

    # Wait for services to be ready
    print_info "Waiting for services to be ready..."
    sleep 10

    # Check PostgreSQL
    until docker exec postgres-primary pg_isready > /dev/null 2>&1; do
        echo "Waiting for PostgreSQL..."
        sleep 2
    done
    print_success "PostgreSQL is ready"

    # Check Redis
    until docker exec redis-1 redis-cli ping > /dev/null 2>&1; do
        echo "Waiting for Redis..."
        sleep 2
    done
    print_success "Redis is ready"

    # Check Meilisearch
    until curl -s http://localhost:7700/health > /dev/null 2>&1; do
        echo "Waiting for Meilisearch..."
        sleep 2
    done
    print_success "Meilisearch is ready"

    cd ../packages/database
}

# Generate Prisma client
generate_prisma_client() {
    print_info "Generating Prisma client..."

    pnpm prisma generate

    print_success "Prisma client generated"
}

# Run database migrations
run_migrations() {
    print_info "Running database migrations..."

    pnpm prisma migrate deploy

    print_success "Database migrations completed"
}

# Apply database triggers and functions
apply_triggers() {
    print_info "Applying database triggers and functions..."

    # Extract database connection details from DATABASE_URL
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\).*/\1/p')

    # Apply triggers
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f prisma/triggers.sql

    print_success "Database triggers and functions applied"
}

# Seed database
seed_database() {
    print_info "Seeding database with sample data..."

    pnpm prisma db seed

    print_success "Database seeded"
}

# Initialize search indexes
init_search() {
    print_info "Initializing Meilisearch indexes..."

    # This would run a Node.js script
    node -e "
        const { searchService } = require('./dist/search');
        searchService.initializeIndexes()
            .then(() => console.log('Search indexes initialized'))
            .catch(console.error);
    "

    print_success "Search indexes initialized"
}

# Initialize vector database (if Pinecone is configured)
init_vector_db() {
    if [ -n "$PINECONE_API_KEY" ]; then
        print_info "Initializing Pinecone vector database..."

        node -e "
            const { vectorSearchService } = require('./dist/vector');
            vectorSearchService.initializeIndex()
                .then(() => console.log('Pinecone index initialized'))
                .catch(console.error);
        "

        print_success "Vector database initialized"
    else
        print_warning "PINECONE_API_KEY not set, skipping vector database initialization"
    fi
}

# Warm caches
warm_caches() {
    print_info "Warming caches with popular data..."

    node -e "
        const { initializeCacheWarming } = require('./dist/cache-warming');
        initializeCacheWarming()
            .then(() => console.log('Cache warming completed'))
            .catch(console.error);
    "

    print_success "Caches warmed"
}

# Run health checks
run_health_checks() {
    print_info "Running health checks..."

    node -e "
        const { healthCheckService } = require('./dist/health-check');
        healthCheckService.checkHealth()
            .then(result => {
                console.log('Health Status:', result.status);
                console.log('PostgreSQL:', result.checks.postgres.status);
                console.log('Redis:', result.checks.redis.status);
                console.log('Meilisearch:', result.checks.meilisearch.status);
                console.log('Pinecone:', result.checks.pinecone.status);
            })
            .catch(console.error);
    "

    print_success "Health checks completed"
}

# Display summary
display_summary() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_success "Database initialization completed successfully!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📊 Services Status:"
    echo "   • PostgreSQL: http://localhost:5432"
    echo "   • PgBouncer: http://localhost:6432"
    echo "   • Redis Cluster: http://localhost:7001-7006"
    echo "   • Meilisearch: http://localhost:7700"
    echo ""
    echo "🔑 Test Credentials:"
    echo "   • Admin: admin@learning-platform.com / admin123"
    echo "   • Instructor: instructor@learning-platform.com / instructor123"
    echo "   • Student: student@learning-platform.com / student123"
    echo ""
    echo "🛠️  Next Steps:"
    echo "   • Run 'pnpm prisma studio' to explore the database"
    echo "   • Visit http://localhost:7700 for Meilisearch dashboard"
    echo "   • Start your application server"
    echo ""
}

# Main execution
main() {
    check_env_vars
    check_docker
    start_infrastructure
    generate_prisma_client
    run_migrations
    # apply_triggers  # Uncomment if triggers.sql is needed
    seed_database
    # init_search  # Uncomment after building TypeScript
    # init_vector_db  # Uncomment after building TypeScript
    # warm_caches  # Uncomment after building TypeScript
    # run_health_checks  # Uncomment after building TypeScript
    display_summary
}

# Run main function
main
