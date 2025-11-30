# Contributing to Ciousten

First off, thank you for considering contributing to Ciousten! It's people like you that make Ciousten such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs** if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior** and **explain which behavior you expected to see instead**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Follow the TypeScript/Python styleguides
* Include thoughtfully-worded, well-structured tests
* Document new code
* End all files with a newline

## Development Setup

### Prerequisites

* Node.js 18+ and npm
* Python 3.10 or 3.11
* Docker (optional, recommended)

### Setup Steps

1. Fork and clone the repository
```bash
git clone https://github.com/yourusername/ciousten.git
cd ciousten
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

4. Set up environment variables
```bash
cp backend/.env.example backend/.env
# Edit .env with your API keys
```

5. Run development servers
```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
python -m uvicorn app.main:app --reload
```

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### TypeScript Styleguide

* Use TypeScript for all new code
* Follow the existing code style
* Use meaningful variable names
* Add JSDoc comments for public APIs

### Python Styleguide

* Follow PEP 8
* Use type hints
* Write docstrings for all public functions
* Keep functions focused and small

## Testing

### Frontend Tests
```bash
cd frontend
npm run test
npm run test:e2e
```

### Backend Tests
```bash
cd backend
pytest tests/
pytest --cov=app tests/
```

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

Thank you for contributing! 🎉
