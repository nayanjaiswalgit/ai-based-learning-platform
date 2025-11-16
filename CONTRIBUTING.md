# Contributing to AI-Based Learning Platform

## Git Workflow & Branching Strategy

### Branch Naming Convention

We follow a structured branching strategy:

#### Main Branches
- `main` - Production-ready code
- `develop` - Integration branch for features
- `staging` - Pre-production testing

#### Supporting Branches

**Feature Branches**
```
feature/<issue-number>-<short-description>
Example: feature/123-add-user-authentication
```

**Bugfix Branches**
```
bugfix/<issue-number>-<short-description>
Example: bugfix/456-fix-login-error
```

**Hotfix Branches**
```
hotfix/<issue-number>-<short-description>
Example: hotfix/789-critical-security-patch
```

**Release Branches**
```
release/v<version-number>
Example: release/v1.2.0
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes

#### Examples
```
feat(auth): Add Google OAuth integration

- Implement Google OAuth 2.0 flow
- Add user account linking
- Update authentication documentation

Closes #123
```

```
fix(api): Resolve race condition in code execution

The code runner was not properly cleaning up containers,
causing resource exhaustion under high load.

Fixes #456
```

### Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/123-your-feature
   ```

2. **Make Your Changes**
   - Write clean, documented code
   - Follow the project's coding standards
   - Add tests for new features

3. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat(scope): your message"
   ```

4. **Push to Remote**
   ```bash
   git push -u origin feature/123-your-feature
   ```

5. **Create Pull Request**
   - Target: `develop` branch (not `main`)
   - Fill in the PR template
   - Request review from team members
   - Ensure all CI checks pass

6. **Code Review**
   - Address reviewer feedback
   - Make requested changes
   - Push updates to the same branch

7. **Merge**
   - Squash and merge for feature branches
   - Regular merge for release branches
   - Delete branch after merge

### Git Hooks

We use Husky for Git hooks:

#### Pre-commit
- Runs ESLint on staged files
- Formats code with Prettier
- Runs type checking

#### Pre-push
- Runs all tests
- Ensures build passes

#### Commit-msg
- Validates commit message format
- Ensures conventional commit style

### Development Workflow

```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/123-new-feature

# 3. Make changes and commit
git add .
git commit -m "feat(scope): add new feature"

# 4. Keep branch up to date
git fetch origin
git rebase origin/develop

# 5. Push to remote
git push -u origin feature/123-new-feature

# 6. Create PR on GitHub
# Target: develop branch

# 7. After PR approval and merge
git checkout develop
git pull origin develop
git branch -d feature/123-new-feature
```

### Release Workflow

```bash
# 1. Create release branch from develop
git checkout develop
git checkout -b release/v1.2.0

# 2. Update version numbers
# Update package.json, CHANGELOG.md

# 3. Commit release prep
git commit -m "chore(release): prepare v1.2.0"

# 4. Merge to main
git checkout main
git merge --no-ff release/v1.2.0

# 5. Tag release
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin main --tags

# 6. Merge back to develop
git checkout develop
git merge --no-ff release/v1.2.0

# 7. Delete release branch
git branch -d release/v1.2.0
```

### Hotfix Workflow

```bash
# 1. Create hotfix from main
git checkout main
git checkout -b hotfix/789-critical-fix

# 2. Make the fix
git commit -m "fix(critical): resolve security vulnerability"

# 3. Merge to main
git checkout main
git merge --no-ff hotfix/789-critical-fix
git tag -a v1.2.1 -m "Hotfix v1.2.1"
git push origin main --tags

# 4. Merge to develop
git checkout develop
git merge --no-ff hotfix/789-critical-fix

# 5. Delete hotfix branch
git branch -d hotfix/789-critical-fix
```

## Code Review Guidelines

### For Authors
- Keep PRs small and focused
- Write descriptive PR descriptions
- Add screenshots/videos for UI changes
- Respond to feedback promptly
- Update based on reviewer comments

### For Reviewers
- Review within 24 hours
- Be constructive and specific
- Test the changes locally if needed
- Approve only when all concerns are addressed
- Use GitHub's review features (approve/request changes)

## Testing Requirements

- All new features must have tests
- Maintain >80% code coverage
- Tests must pass before merging
- Include unit, integration, and e2e tests where applicable

## Documentation

- Update relevant documentation
- Add JSDoc comments for functions
- Update README if needed
- Document breaking changes in CHANGELOG
