# Contributing to NIRIKSHAN

Thank you for your interest in contributing to NIRIKSHAN! This document provides guidelines and instructions for contributing to the project.

## 🤝 How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- **Title**: Clear and descriptive
- **Description**: Detailed explanation of the bug
- **Steps to Reproduce**: Clear steps to reproduce the issue
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Environment**: OS, Python/Node version, browser version
- **Screenshots**: If applicable

### Suggesting Enhancements

Enhancement suggestions are welcome! Please include:

- **Title**: Clear and descriptive
- **Description**: Detailed explanation of the enhancement
- **Motivation**: Why this enhancement would be useful
- **Alternatives**: Any alternative solutions you've considered
- **Additional Context**: Any other relevant information

## 🛠️ Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ (optional for development)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python main.py
```

### Frontend Setup

```bash
cd nirikshan-frontend
npm install
npm run dev
```

## 📝 Coding Standards

### Python (Backend)

- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Write docstrings for functions and classes
- Keep functions focused and concise
- Use meaningful variable names

### TypeScript (Frontend)

- Follow TypeScript best practices
- Use functional components with hooks
- Use proper TypeScript types
- Follow React best practices
- Keep components small and focused

### Git Commit Messages

Follow conventional commit format:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
- `feat(auth): add JWT token refresh`
- `fix(dashboard): resolve memory leak in stats component`
- `docs(readme): update installation instructions`

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd nirikshan-frontend
npm test
```

### ML Integration Tests

```bash
cd backend
python test_ml_integration.py
```

## 📋 Pull Request Process

1. **Fork the repository** and create a branch from `main`
2. **Make your changes** following the coding standards
3. **Write tests** for new functionality
4. **Update documentation** if needed
5. **Run tests** to ensure nothing is broken
6. **Commit your changes** with clear commit messages
7. **Push to your fork** and create a pull request

### Pull Request Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added/updated for new functionality
- [ ] Documentation updated if needed
- [ ] All tests pass
- [ ] Commit messages follow conventional format
- [ ] PR description clearly explains changes

## 🏗️ Project Structure

### Backend

- `routers/` - API endpoints
- `services/` - Business logic
- `database/` - Database models and migrations
- `ml_integration.py` - ML model integration
- `ml_bridge.py` - ML API bridge

### Frontend

- `src/components/` - Reusable components
- `src/pages/` - Page components
- `src/services/` - API services
- `src/context/` - React contexts
- `src/hooks/` - Custom hooks

## 🎯 Development Guidelines

### Backend

- Use FastAPI for all API endpoints
- Implement proper error handling
- Validate input using Pydantic schemas
- Use dependency injection for services
- Follow RESTful API design principles

### Frontend

- Use functional components with hooks
- Implement proper error boundaries
- Use TypeScript for type safety
- Follow React best practices
- Implement proper loading states

### ML Integration

- Document ML model changes
- Test ML endpoints thoroughly
- Implement fallback mechanisms
- Monitor ML model performance
- Keep ML models versioned

## 🚨 Security Guidelines

- Never commit sensitive data (API keys, passwords)
- Use environment variables for configuration
- Implement proper authentication and authorization
- Validate all user inputs
- Keep dependencies updated
- Follow OWASP security guidelines

## 📖 Documentation

- Update README.md for major changes
- Add inline comments for complex logic
- Update API documentation for endpoint changes
- Document ML model changes and performance
- Keep configuration files well-documented

## 🤔 Questions?

If you have questions about contributing, please:

1. Check existing documentation
2. Search existing issues and discussions
3. Create a new issue with your question
4. Contact the maintainers

## 📜 Code of Conduct

Be respectful and inclusive:
- Use welcoming language
- Be constructive in feedback
- Focus on what is best for the community
- Show empathy toward other community members

## 🎉 Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to NIRIKSHAN!