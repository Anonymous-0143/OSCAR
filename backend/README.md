# OSCREC Backend API

Smart Open-Source Contribution Recommendation System - Backend API built with FastAPI.

## Features

- 🔍 **GitHub Profile Analysis** - Extract skills from user repositories, commits, and activity
- 🎯 **Smart Recommendations** - TF-IDF + cosine similarity ranking with weighted scoring
- 💡 **Explainability** - Clear explanations for why each repository/issue was recommended
- 🚀 **Fast & Async** - Built with FastAPI for high performance
- 📊 **ML Pipeline** - scikit-learn for vectorization and similarity matching
- 🔄 **Cold-Start Handling** - Fallback strategies for new users

## Quick Start

### Prerequisites

- Python 3.11+
- GitHub Personal Access Token ([create one](https://github.com/settings/tokens))

### Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. **Install dependencies**
   ```powershell
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```

4. **Configure environment**
   ```powershell
   copy .env.example .env
   ```
   
   Edit `.env` and add your GitHub token:
   ```env
   GITHUB_TOKEN=ghp_your_token_here
   ```

5. **Run the server**
   ```powershell
   uvicorn app.main:app --reload
   ```

6. **Access API docs**
   - Swagger UI: http://localhost:8000/api/v1/docs
   - ReDoc: http://localhost:8000/api/v1/redoc

## API Endpoints

### Health Check
```http
GET /api/v1/health
```

### Analyze User
```http
POST /api/v1/analyze-user
Content-Type: application/json

{
  "github_username": "octocat"
}
```

### Get Skill Profile
```http
GET /api/v1/skill-profile/{username}
```

### Recommend Repositories
```http
POST /api/v1/recommend-repos
Content-Type: application/json

{
  "github_username": "octocat",
  "limit": 10,
  "min_stars": 100,
  "languages": ["Python", "JavaScript"]
}
```

### Recommend Issues
```http
POST /api/v1/recommend-issues
Content-Type: application/json

{
  "github_username": "octocat",
  "limit": 20,
  "difficulty": "beginner",
  "labels": ["good first issue"]
}
```

## Architecture

```
app/
├── api/              # API routes
│   └── routes/
│       ├── health.py
│       ├── user.py
│       └── recommendations.py
├── services/         # Business logic
│   ├── github_service.py
│   ├── profiling_service.py
│   ├── recommendation_service.py
│   └── explainability_service.py
├── ml/              # Machine learning
│   ├── vectorizers.py
│   ├── scorers.py
│   └── cold_start.py
├── schemas/         # Pydantic models
├── utils/           # Utilities
├── config.py        # Configuration
└── main.py          # Entry point
```

## Docker

### Run with Docker Compose
```powershell
docker-compose up -d
```

This starts:
- FastAPI backend on port 8000
- PostgreSQL database on port 5432

### Build Docker image
```powershell
docker build -t oscrec-backend .
```

### Run container
```powershell
docker run -p 8000:8000 --env-file .env oscrec-backend
```

## How It Works

### 1. Skill Profiling
- Fetches user's GitHub data (repos, commits, events)
- Extracts languages from repository statistics
- Analyzes commit messages using TF-IDF
- Parses README files and topics
- Generates weighted skill profile

### 2. Recommendation Engine
- Searches GitHub for candidate repositories
- Calculates multiple scores:
  - **Skill Match** (40%): TF-IDF + cosine similarity
  - **Activity Score** (20%): Stars, recency, commits
  - **Beginner Friendliness** (20%): Labels, documentation
  - **Growth Potential** (20%): Forks, topics, community
- Ranks by weighted final score

### 3. Explainability
- Identifies matching skills
- Highlights learning opportunities
- Generates human-readable explanations
- Provides confidence scores

## Development

### Run tests
```powershell
pytest tests/
```

### Format code
```powershell
black app/
```

### Lint code
```powershell
flake8 app/
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `GITHUB_TOKEN` | GitHub API token | Required |
| `DEBUG` | Debug mode | `False` |
| `ALLOWED_ORIGINS` | CORS origins | `http://localhost:3000` |
| `TFIDF_MAX_FEATURES` | Max TF-IDF features | `500` |
| `RECOMMENDATION_LIMIT` | Max recommendations | `50` |

## Tech Stack

- **Framework**: FastAPI 0.109+
- **ML**: scikit-learn, spaCy
- **HTTP Client**: httpx (async)
- **Validation**: Pydantic
- **Database**: PostgreSQL (optional)
- **Server**: Uvicorn + Gunicorn

## License

MIT

## Author

Built as a placement-ready ML + full-stack project demonstrating:
- Clean architecture
- Explainable AI
- Production-ready design
- Interview-defensible decisions
