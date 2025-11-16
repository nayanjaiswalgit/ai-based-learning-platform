# Development Environment Setup Script (PowerShell)
# This script sets up the development environment for the AI Learning Platform

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI Learning Platform - Development Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "Warning: .env file not found" -ForegroundColor Yellow
    Write-Host "Creating .env from .env.example..."

    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host "[OK] Created .env file" -ForegroundColor Green
        Write-Host "[!] Please update .env with your actual values" -ForegroundColor Yellow
    } else {
        Write-Host "[X] .env.example not found" -ForegroundColor Red
        Write-Host "Please create a .env file manually"
    }
    Write-Host ""
}

# Generate Prisma Client
Write-Host "Step 1: Generating Prisma Client..." -ForegroundColor Cyan
Write-Host "-----------------------------------"

if (Test-Path "packages\database") {
    Push-Location packages\database

    if (Test-Path "prisma\schema.prisma") {
        Write-Host "Generating Prisma client..."
        pnpm prisma generate
        Write-Host "[OK] Prisma client generated" -ForegroundColor Green
    } else {
        Write-Host "[X] prisma\schema.prisma not found" -ForegroundColor Red
    }

    Pop-Location
} else {
    Write-Host "[!] packages\database directory not found" -ForegroundColor Yellow
}
Write-Host ""

# Check if PostgreSQL is accessible
Write-Host "Step 2: Checking PostgreSQL..." -ForegroundColor Cyan
Write-Host "-------------------------------"

$psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
if ($psqlCmd) {
    Write-Host "[OK] PostgreSQL CLI found" -ForegroundColor Green
} else {
    Write-Host "[!] PostgreSQL CLI not found" -ForegroundColor Yellow
    Write-Host "Make sure PostgreSQL is installed and running"
}
Write-Host ""

# Check if Redis is accessible
Write-Host "Step 3: Checking Redis..." -ForegroundColor Cyan
Write-Host "-------------------------"

$redisCmd = Get-Command redis-cli -ErrorAction SilentlyContinue
if ($redisCmd) {
    try {
        $redisResponse = redis-cli ping 2>$null
        if ($redisResponse -eq "PONG") {
            Write-Host "[OK] Redis is running" -ForegroundColor Green
        } else {
            Write-Host "[!] Redis is not responding" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[!] Redis is not responding" -ForegroundColor Yellow
        Write-Host "Make sure Redis (or Memurai) is installed and running"
    }
} else {
    Write-Host "[!] Redis CLI not found" -ForegroundColor Yellow
    Write-Host "Install Redis or Memurai for Windows"
}
Write-Host ""

# Check if Docker is running
Write-Host "Step 4: Checking Docker..." -ForegroundColor Cyan
Write-Host "--------------------------"

$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerCmd) {
    try {
        docker info 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Docker is running" -ForegroundColor Green
        } else {
            Write-Host "[!] Docker daemon is not running" -ForegroundColor Yellow
            Write-Host "Start Docker Desktop to enable terminal and code execution services"
        }
    } catch {
        Write-Host "[!] Docker daemon is not running" -ForegroundColor Yellow
        Write-Host "Start Docker Desktop to enable terminal and code execution services"
    }
} else {
    Write-Host "[!] Docker not found" -ForegroundColor Yellow
    Write-Host "Install Docker Desktop for full functionality"
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Update .env file with your actual configuration"
Write-Host "2. Run database migrations:"
Write-Host "   pnpm --filter @ai-learning/database prisma migrate dev"
Write-Host "3. Seed the database (optional):"
Write-Host "   pnpm --filter @ai-learning/database prisma db seed"
Write-Host "4. Start the development server:"
Write-Host "   pnpm dev"
Write-Host ""
