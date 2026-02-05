# Activate virtual environment
.\venv\Scripts\activate

# Set Python path
$env:PYTHONPATH = "."

# Start server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
