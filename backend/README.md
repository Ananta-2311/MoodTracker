# Mood Tracker Backend API

FastAPI backend for Mood Tracker application.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /api/moods` - Get all mood entries
- `POST /api/moods` - Set all mood entries (replace)
- `POST /api/mood` - Set a single mood entry
- `DELETE /api/moods` - Clear all mood entries

## Data Format

Mood data is stored as JSON with date keys (YYYY-MM-DD format) and mood values:
```json
{
  "2024-01-15": "great",
  "2024-01-16": "good",
  "2024-01-17": "neutral"
}
```

