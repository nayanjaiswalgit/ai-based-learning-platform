# Windows Development Setup Guide

This guide helps you set up the AI-Based Learning Platform on Windows.

## Common Issues and Solutions

### Issue 1: `turbo` command not recognized

**Problem:**
```
'turbo' is not recognized as an internal or external command
```

**Solution:**

The issue is that pnpm on Windows may not correctly add packages to your PATH. Here are 3 solutions:

#### Option 1: Use pnpm exec (Recommended)
```bash
pnpm exec turbo run dev --concurrency=20
```

Or add this to your shell alias:
```bash
# In PowerShell profile
Set-Alias turbo "pnpm exec turbo"

# Or create a batch file
echo pnpm exec turbo %* > turbo.bat
```

#### Option 2: Use npx
```bash
npx turbo run dev --concurrency=20
```

#### Option 3: Update package.json scripts
The package.json already has the dev script configured. If turbo isn't in PATH, update it to:
```json
"scripts": {
  "dev": "pnpm exec turbo run dev --concurrency=20",
  "build": "pnpm exec turbo run build"
}
```

### Issue 2: node-pty build failure

**Problem:**
```
gyp ERR! find VS You need to install the latest version of Visual Studio
including the "Desktop development with C++" workload.
```

**Solution:**

The `node-pty` package has been moved to **optionalDependencies** and is not required for development. You can safely ignore this warning.

If you need terminal functionality later, you have two options:

#### Option A: Install Visual Studio Build Tools (For full terminal support)
1. Download [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
2. Run the installer
3. Select "Desktop development with C++" workload
4. Install (requires ~7GB disk space)

#### Option B: Use WSL2 (Recommended for serious development)
Windows Subsystem for Linux provides a better development experience:

```bash
# Enable WSL2
wsl --install

# Install Ubuntu
wsl --install -d Ubuntu

# Inside WSL2, install dependencies
sudo apt update
sudo apt install -y build-essential

# Clone and run the project in WSL2
cd /mnt/c/Users/YourUsername/path/to/project
pnpm install
pnpm dev
```

## Quick Start Guide

### Prerequisites

1. **Node.js 20.18.0 or higher**
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **pnpm 9.15.1 or higher**
   ```bash
   npm install -g pnpm@9.15.1
   ```
   - Verify: `pnpm --version`

3. **Git**
   - Download from [git-scm.com](https://git-scm.com/)

4. **Docker Desktop** (for full functionality)
   - Download from [docker.com](https://www.docker.com/products/docker-desktop)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-based-learning-platform
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

   **Note:** You may see warnings about `node-pty` and `handlebars` - these are safe to ignore.

3. **Set up environment variables**
   ```bash
   # Copy the example env file
   cp .env.example .env

   # Edit .env with your preferred editor
   notepad .env
   ```

4. **Start PostgreSQL and Redis**

   Option A: Using Docker (Recommended)
   ```bash
   docker-compose up -d postgres redis
   ```

   Option B: Install locally
   - PostgreSQL: [Download](https://www.postgresql.org/download/windows/)
   - Redis: Use [Memurai](https://www.memurai.com/) (Redis alternative for Windows)

5. **Run database migrations**
   ```bash
   pnpm exec prisma migrate dev
   ```

6. **Seed the database (optional)**
   ```bash
   pnpm exec prisma db seed
   ```

7. **Start development server**

   Using pnpm exec:
   ```bash
   pnpm exec turbo run dev --concurrency=20
   ```

   Or simply:
   ```bash
   pnpm dev
   ```

8. **Access the application**
   - Web App: http://localhost:3000
   - API Gateway: http://localhost:4000
   - Individual services: Check logs for port numbers

## Development Workflow

### Running Individual Services

```bash
# Run only the web app
pnpm --filter @ai-learning/web dev

# Run only a specific service
pnpm --filter @ai-learning/course-service dev

# Run multiple specific services
pnpm --filter @ai-learning/web --filter @ai-learning/api-gateway dev
```

### Building for Production

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @ai-learning/web build
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @ai-learning/course-service test
```

### Linting and Formatting

```bash
# Lint all packages
pnpm lint

# Format all code
pnpm format
```

## Troubleshooting

### PowerShell Execution Policy

If you get "cannot be loaded because running scripts is disabled":

```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Already in Use

```bash
# Find process using a port (e.g., 3000)
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### pnpm Store Corruption

```bash
# Clear pnpm cache
pnpm store prune

# Reinstall
rm -rf node_modules
pnpm install
```

### Slow Installation

```bash
# Use a faster registry (optional)
pnpm config set registry https://registry.npmmirror.com/

# Or use shamefully-hoist for faster installs (may cause issues)
pnpm install --shamefully-hoist
```

## Performance Tips

1. **Exclude node_modules from Windows Defender**
   - Open Windows Security
   - Virus & threat protection > Manage settings
   - Exclusions > Add folder
   - Add your project's node_modules folder

2. **Use Windows Terminal** instead of CMD
   - Better performance and modern features
   - Download from Microsoft Store

3. **Enable Developer Mode**
   - Settings > Update & Security > For developers
   - Turn on "Developer Mode"
   - Allows creating symlinks without admin

## Editor Setup (VS Code)

Recommended extensions:
- ESLint
- Prettier
- Prisma
- TypeScript and JavaScript
- Tailwind CSS IntelliSense
- GitLens

### VS Code Settings

Add to `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Need Help?

- Check [README.md](./README.md) for project overview
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Check [PROJECT_PLAN.md](./PROJECT_PLAN.md) for feature details
- Open an issue on GitHub (when available)

## Next Steps

Once everything is running:

1. Visit http://localhost:3000 to see the web app
2. Check the API docs at http://localhost:4000/api/docs
3. Review the codebase structure in [README.md](./README.md)
4. Start contributing! See [CONTRIBUTING.md](./CONTRIBUTING.md) (when available)

---

*Last Updated: November 16, 2025*
