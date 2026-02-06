# OSCAR - Open-Source Contribution and Recommendation 

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-blue.svg)
![React](https://img.shields.io/badge/react-18.2+-61dafb.svg)
![FastAPI](https://img.shields.io/badge/fastapi-0.109+-009688.svg)

An AI-powered platform that analyzes GitHub profiles and recommends relevant open-source repositories and beginner-friendly issues based on your skills and experience.

## 🎯 Key Features

- **Smart Skill Profiling** - Analyzes your GitHub activity to extract language and technical skills
- **Intelligent Matching** - Uses TF-IDF and cosine similarity for precise recommendation matching
- **Explainable AI** - Every recommendation comes with clear explanations
- **Beginner-Friendly** - Curates issues perfect for your skill level
- **Beautiful UI** - Modern React dashboard with charts and visualizations
- **Production-Ready** - Clean architecture, error handling, and deployment-ready setup

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │
│  (Vite + Charts)│
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  FastAPI Backend│
│  + ML Pipeline  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GitHub REST API│
└─────────────────┘
```

### Tech Stack

**Backend:**
- FastAPI (async REST API)
- scikit-learn (TF-IDF, cosine similarity)
- spaCy (NLP)
- PostgreSQL (optional caching)
- Docker

**Frontend:**
- React 18
- Vite
- Recharts (data visualization)
- Axios

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- GitHub Personal Access Token ([create one](https://github.com/settings/tokens))

### Backend Setup

```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Configure environment
copy .env.example .env
# Edit .env and add your GITHUB_TOKEN

# Run server
uvicorn app.main:app --reload
```

Backend will be available at: http://localhost:8000

API Documentation: http://localhost:8000/api/v1/docs

### Frontend Setup

```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Configure environment (optional)
copy .env.example .env

# Run development server
npm run dev
```

Frontend will be available at: http://localhost:5173

## 📊 How It Works

### 1. Skill Profiling

Analyzes multiple data sources to build your skill profile:
- **Languages** (40%): From repository statistics
- **Commit Messages** (30%): TF-IDF keyword extraction
- **README Files** (20%): spaCy NLP analysis
- **Issue Activity** (10%): Contribution patterns

### 2. Recommendation Algorithm

Uses weighted scoring to rank repositories:

```
Final Score = (Skill Match × 0.4) + 
              (Activity Score × 0.2) + 
              (Beginner Friendliness × 0.2) + 
              (Growth Potential × 0.2)
```

**Components:**
- **Skill Match**: TF-IDF vectors + cosine similarity
- **Activity Score**: log(stars) × recency boost
- **Beginner Friendliness**: labels, documentation, contributing guide
- **Growth Potential**: forks, watchers, community activity

### 3. Explainability

Every recommendation includes:
- ✅ **Matching Skills**: Which of your skills align
- 💡 **Learning Opportunities**: New technologies to explore
- 📈 **Confidence Score**: How well it matches
- ⏱️ **Time Estimate**: Expected effort for issues

## 📸 Screenshots

### Landing Page
![Landing Page](docs/screenshots/landing.png)

### Skill Profile Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Repository Recommendations
![Repositories](docs/screenshots/repos.png)

## 🐳 Docker Deployment

### Using Docker Compose

```powershell
# Set environment variables
$env:GITHUB_TOKEN="your_token_here"

# Start services
docker-compose up -d
```

This starts:
- Backend API on port 8000
- PostgreSQL database on port 5432

### Manual Docker Build

```powershell
# Build backend image
cd backend
docker build -t oscrec-backend .

# Run container
docker run -p 8000:8000 --env-file .env oscrec-backend
```

## 🌐 Deployment

### Backend (Render/Railway)

1. Push code to GitHub
2. Create new Web Service on Render
3. Set environment variables (`GITHUB_TOKEN`, etc.)
4. Deploy command: `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker`

### Frontend (Netlify)

1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Environment variable: `VITE_API_URL`

## 📁 Project Structure

```
OSCREC/
├── backend/
│   ├── app/
│   │   ├── api/              # REST API routes
│   │   ├── services/         # Business logic
│   │   ├── ml/               # ML pipeline
│   │   ├── schemas/          # Pydantic models
│   │   ├── utils/            # Utilities
│   │   ├── config.py         # Configuration
│   │   └── main.py           # Entry point
│   ├── Dockerfile
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API layer
│   │   ├── App.jsx           # Main app
│   │   └── index.css         # Design system
│   ├── package.json
│   └── README.md
│
└── README.md                 # This file
```

## 🎓 Interview Talking Points

**For ML Interviews:**
- Explainable recommendation system (not black-box)
- TF-IDF + cosine similarity for skill matching
- Transparent weighted scoring with clear components
- Cold-start handling for new users

**For Backend Interviews:**
- Clean architecture (services, schemas, routes separation)
- Async FastAPI for high performance
- Repository pattern for data access
- Comprehensive error handling

**For Full-Stack Interviews:**
- End-to-end system design
- RESTful API design with OpenAPI docs
- Modern React with hooks and state management
- Responsive UI with professional design system

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built as a placement-ready project demonstrating:
- Industry-standard architecture
- ML/AI implementation
- Full-stack development
- Production deployment

## 🔗 Links

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Implementation Plan](docs/implementation_plan.md)
- [API Documentation](http://localhost:8000/api/v1/docs) (when running locally)

---

**Built with ❤️ using FastAPI, React, and Machine Learning**
