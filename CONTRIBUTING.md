# 🌟 Contributing to Ciousten

Thank you for your interest in contributing to **Ciousten - Video Insights & Reports**! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

---

## How Can I Contribute?

### 🐛 Reporting Bugs

Found a bug? Please create an issue with:

1. **Clear title** describing the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs **actual behavior**
4. **Environment details** (OS, Docker version, etc.)
5. **Logs** if applicable

**Template**:
```markdown
**Bug Description**: Brief description

**Steps to Reproduce**:
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**: What should happen

**Actual Behavior**: What actually happens

**Environment**:
- OS: Windows/Mac/Linux
- Docker version: X.X.X
- Browser: Chrome/Firefox/etc.

**Logs**:
```
Paste relevant logs here
```
```

### 💡 Suggesting Features

Have an idea? Create an issue with:

1. **Clear description** of the feature
2. **Use case** - why is this needed?
3. **Proposed implementation** (if you have ideas)
4. **Alternatives considered**

### 🔧 Code Contributions

We welcome pull requests! Here's how:

1. **Fork** the repository
2. **Clone** your fork
3. **Create** a feature branch
4. **Make** your changes
5. **Test** thoroughly
6. **Submit** a pull request

---

## Development Setup

### Prerequisites

- **Docker & Docker Compose** (recommended)
- **OR** Python 3.10+ and Node.js 20+
- **Git** for version control
- **OpenRouter API Key** for testing

### Local Development (Without Docker)

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API key

# Run backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Docker Development

```bash
# Build and run
docker compose up --build

# Run in background
docker compose up -d

# View logs
docker compose logs -f
```

---

## Project Structure

```
Ciousten---Video-Insights---Reports/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/        # API endpoints
│   │   ├── core/              # Core business logic
│   │   │   ├── segmentation_engine.py
│   │   │   ├── analysis_engine.py
│   │   │   └── reporting_engine.py
│   │   ├── utils/             # Utilities
│   │   ├── config.py          # Configuration
│   │   ├── db.py              # Database models
│   │   ├── schemas.py         # Pydantic schemas
│   │   └── main.py            # FastAPI app
│   ├── data/                  # Upload directory
│   ├── reports/               # Generated reports
│   ├── sam_models/            # SAM2 models
│   ├── tests/                 # Backend tests
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                   # Next.js Frontend
│   ├── app/                   # App Router pages
│   │   ├── annotate/          # Upload & segmentation
│   │   ├── analyze/           # AI analysis
│   │   ├── reports/           # Report download
│   │   └── dashboard/         # Dashboard
│   ├── components/            # React components
│   │   └── ui/                # shadcn/ui components
│   ├── lib/                   # Utilities
│   ├── public/                # Static assets
│   ├── Dockerfile
│   ├── package.json
│   └── next.config.js
│
├── docker-compose.yml         # Docker orchestration
├── README.md                  # Project readme
├── DEPLOYMENT.md              # Deployment guide
├── CONTRIBUTING.md            # This file
├── LICENSE                    # MIT License
└── CHANGELOG.md               # Version history
```

---

## Coding Standards

### Python (Backend)

- **Style**: Follow PEP 8
- **Docstrings**: Use Google style
- **Type Hints**: Use where appropriate
- **Imports**: Group stdlib, third-party, local

**Example**:
```python
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session

from app.schemas import ProjectResponse
from app.db import get_db


def get_projects(db: Session, skip: int = 0, limit: int = 100) -> List[ProjectResponse]:
    """
    Retrieve projects from database.
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of project objects
    """
    return db.query(Project).offset(skip).limit(limit).all()
```

### TypeScript/React (Frontend)

- **Style**: Use Prettier defaults
- **Components**: Functional components with TypeScript
- **Naming**: PascalCase for components, camelCase for functions
- **Props**: Define interfaces for all props

**Example**:
```typescript
interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  return (
    <div className="card" onClick={() => onSelect(project.id)}>
      <h3>{project.name}</h3>
      <p>{project.description}</p>
    </div>
  );
}
```

### General Guidelines

- **Comments**: Explain "why", not "what"
- **Functions**: Keep small and focused (< 50 lines ideally)
- **Variables**: Use descriptive names
- **Error Handling**: Always handle errors gracefully
- **Security**: Never commit API keys or secrets

---

## Testing

### Backend Tests

```bash
cd backend

# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest

# With coverage
pytest --cov=app tests/
```

### Frontend Tests

```bash
cd frontend

# Run linter
npm run lint

# Build test
npm run build
```

### Manual Testing

After making changes:

1. **Build Docker containers**
   ```bash
   docker compose up --build
   ```

2. **Test core workflows**:
   - Upload a video
   - Run segmentation
   - Perform analysis
   - Generate reports
   - Download results

3. **Check API docs**: http://localhost:8000/docs

---

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] No new warnings introduced
- [ ] Tests added/updated (if applicable)
- [ ] Documentation updated (if needed)
- [ ] Docker build succeeds
- [ ] Manual testing completed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing done

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] Tested locally
- [ ] Documentation updated
```

### Review Process

1. A maintainer will review your PR
2. Address any requested changes
3. Once approved, PR will be merged
4. Your contribution will be credited in CHANGELOG

---

## Commit Message Guidelines

Use conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(analysis): add support for GPT-4 model

fix(upload): resolve file size validation bug

docs(readme): update deployment instructions

refactor(backend): simplify segmentation pipeline
```

---

## Areas for Contribution

### High Priority

- [ ] **GPU Support**: Add CUDA/GPU acceleration for SAM2
- [ ] **Additional Models**: Support for more LLM providers
- [ ] **Batch Processing**: Process multiple videos
- [ ] **User Authentication**: Add user accounts
- [ ] **Cloud Storage**: S3/GCS integration

### Medium Priority

- [ ] **API Rate Limiting**: Protect against abuse
- [ ] **Caching**: Redis caching for analysis results
- [ ] **Websockets**: Real-time progress updates
- [ ] **Export Formats**: Add JSON, CSV exports
- [ ] **Internationalization**: Multi-language support

### Good First Issues

- [ ] **UI Improvements**: Polish existing pages
- [ ] **Error Messages**: Better user-facing errors
- [ ] **Documentation**: Expand guides and tutorials
- [ ] **Examples**: Add sample videos and results
- [ ] **Tests**: Increase test coverage

---

## Development Tips

### Debugging Backend

```bash
# Access backend container
docker compose exec backend bash

# Check logs
docker compose logs -f backend

# Python REPL in container
docker compose exec backend python
```

### Debugging Frontend

```bash
# Access frontend container
docker compose exec frontend sh

# Check build output
docker compose exec frontend npm run build
```

### Database Inspection

```bash
# Access backend and open SQLite
docker compose exec backend bash
sqlite3 ciousten.db

# List tables
.tables

# Query projects
SELECT * FROM projects;
```

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Questions?

- **Email**: Contact through [www.adityacuz.dev](https://www.adityacuz.dev)
- **Issues**: Create a GitHub issue
- **Discussions**: Use GitHub Discussions for general questions

---

## Recognition

Contributors will be:
- Listed in [CHANGELOG.md](CHANGELOG.md)
- Credited in release notes
- Mentioned in the README (for significant contributions)

---

**Thank you for contributing to Ciousten! 🎉**

*Made with ❤️ by Aditya Shenvi @2025*
