# OSCREC - Quick Start Guide

## Starting the Application

### Terminal 1 - Backend Server

```powershell
# Navigate to backend directory
cd D:\CODING\OSCREC\backend

# Activate virtual environment
.\venv\Scripts\activate

# Start the server
python -m uvicorn app.main:app --reload
```

Server will run on: **http://localhost:8000**
API Docs: **http://localhost:8000/api/v1/docs**

---

### Terminal 2 - Frontend Server

```powershell
# Navigate to frontend directory
cd D:\CODING\OSCREC\frontend

# Start the development server
npm run dev
```

App will run on: **http://localhost:5173**

---

## Important Notes

- **Backend**: Must use `python -m uvicorn` (not just `uvicorn`) to ensure proper module loading
- **Frontend**: Will automatically detect backend at `http://localhost:8000/api/v1`
- **GitHub Token**: Make sure you've added your token to `backend/.env`

## Testing

1. Open http://localhost:5173 in your browser
2. Enter a GitHub username (try "octocat")
3. Click "Analyze Profile"
4. View the recommendations!

## Troubleshooting

**Backend won't start:**
- Make sure you're in the `backend` directory
- Activate the virtual environment first
- Use `python -m uvicorn` instead of just `uvicorn`

**Frontend won't start:**
- Make sure you ran `npm install` first
- Check that all `.jsx` files exist in `src/`

**422 Validation Error:**
- Check browser console (F12) for detailed error
- Verify GitHub username is valid (alphanumeric and hyphens only)
- Ensure backend is running on port 8000
