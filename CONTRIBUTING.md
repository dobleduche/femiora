# Contributing to Femiora

Thank you for your interest in contributing to Femiora! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Git
- A GitHub account

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/femiora.git
   cd femiora
   ```

3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/dobleduche/femiora.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. **Run the development servers**:
   ```bash
   npm run dev:all
   ```

## Development Workflow

### Creating a Branch

Create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications
- `chore/` - Maintenance tasks

### Making Changes

1. Make your changes in your feature branch
2. Write or update tests as needed
3. Ensure your code follows the project's style guidelines
4. Run tests and type checking:
   ```bash
   npm run test
   npm run type-check
   npm run lint
   ```

### Commit Guidelines

Write clear, descriptive commit messages:

```
type(scope): brief description

Detailed explanation of what changed and why (if needed)

Fixes #issue_number
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes

Example:
```
feat(coach): add real-time coaching feedback

Implement WebSocket connection for live coaching sessions
with real-time feedback delivery

Fixes #123
```

### Submitting a Pull Request

1. **Update your branch** with the latest upstream changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your changes** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub:
   - Navigate to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template with:
     - Clear description of changes
     - Related issue numbers
     - Screenshots (if UI changes)
     - Testing instructions

4. **Wait for review**:
   - Address any feedback from reviewers
   - Make requested changes in new commits
   - Push updates to the same branch

## Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow existing code style
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Avoid `any` types when possible

### React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper prop types

### Code Organization

- Place components in `components/` directory
- Place utilities in `utils/` directory
- Place API services in `services/` directory
- Place server code in `server/` directory

## Testing

- Write tests for new features
- Ensure existing tests pass
- Aim for good test coverage
- Run tests before submitting PR:
  ```bash
  npm run test
  ```

## Documentation

- Update README.md if needed
- Document new features or API changes
- Add inline comments for complex logic
- Update type definitions

## What to Contribute

### Good First Issues

Look for issues labeled:
- `good first issue` - Great for newcomers
- `help wanted` - We need community help
- `bug` - Bug fixes are always welcome

### Areas We Need Help

- Bug fixes
- Feature implementations
- Documentation improvements
- Test coverage
- Performance optimizations
- Accessibility improvements

### Before Starting Major Work

For significant changes:
1. Open an issue to discuss your idea first
2. Wait for maintainer feedback
3. Get agreement on the approach
4. Then start implementation

This prevents wasted effort on changes that might not be accepted.

## Review Process

1. **Initial Review**: Maintainer will review within 3-5 days
2. **Feedback**: Address any requested changes
3. **Approval**: At least one maintainer approval required
4. **Merge**: Maintainer will merge once approved

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue
- **Chat**: [Add your communication channel if any]

## Recognition

Contributors will be:
- Listed in release notes
- Credited in the repository
- Added to CONTRIBUTORS.md (if significant contributions)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (check LICENSE file).

---

Thank you for contributing to Femiora! Your efforts help make this project better for everyone.
