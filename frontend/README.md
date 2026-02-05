# OSCREC Frontend

Modern React dashboard for the Smart Open-Source Contribution Recommendation System.

## Features

- 🎨 **Modern UI** - Dark theme with gradient effects and smooth animations
- 📊 **Data Visualization** - Radar and bar charts using Recharts
- 💫 **Responsive Design** - Works perfectly on all devices
- ⚡ **Fast** - Built with Vite for lightning-fast development
- 🎯 **Detailed Explanations** - Understand why each recommendation was made

## Quick Start

### Prerequisites

- Node.js 18+
- Backend API running (see `../backend/README.md`)

### Installation

1. **Install dependencies**
   ```powershell
   cd frontend
   npm install
   ```

2. **Configure environment**
   ```powershell
   copy .env.example .env
   ```
   
   Update `.env` if your backend is running on a different URL:
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   ```

3. **Run development server**
   ```powershell
   npm run dev
   ```

4. **Open browser**
   Navigate to: http://localhost:5173

## Building for Production

```powershell
npm run build
```

The optimized build will be in the `dist/` directory.

### Preview production build
```powershell
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── LandingPage.jsx      # Landing page with gradient effects
│   ├── SkillProfile.jsx     # User skill visualization
│   ├── RepositoryCard.jsx   # Repository recommendation card
│   └── IssueCard.jsx        # Issue recommendation card
├── services/
│   └── api.js               # API service layer
├── App.jsx                  # Main application component
├── App.css                  # App layout styles
├── index.css                # Global styles & design system
└── main.jsx                 # Application entry point
```

## Technologies

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Charts**: Recharts 2
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Design System

The app uses a comprehensive design system with:
- CSS variables for theming
- Reusable component styles
- Smooth transitions and animations
- Responsive breakpoints

### Color Palette

- **Primary**: `#6366f1` (Indigo)
- **Secondary**: `#8b5cf6` (Purple)
- **Accent**: `#ec4899` (Pink)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Amber)

## Key Components

### LandingPage
- Animated gradient background
- GitHub username input
- Feature cards showcase

### SkillProfile
- Radar chart for language proficiency
- Bar chart for language distribution
- Stats cards for user metrics
- Technical skills tags

### RepositoryCard
- Visual score indicator
- Matching skills badges
- Learning opportunities
- Repository stats
- Beginner-friendly issue count

### IssueCard
- Difficulty indicator
- Label tags
- Comment count and time estimate
- Explanation with skills match

## Deployment

### Netlify

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Set environment variable: `VITE_API_URL`
5. Deploy!

### Vercel

```powershell
npm install -g vercel
vercel
```

## Development

### Code Style
```powershell
npm run lint
```

### Hot Module Replacement
Vite provides instant HMR - changes reflect immediately!

## License

MIT
