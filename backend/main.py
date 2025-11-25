from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import json
import os
from datetime import datetime

app = FastAPI(title="Mood Tracker API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data storage file
DATA_FILE = "mood_data.json"

def load_data() -> Dict[str, Any]:
    """Load mood data from file"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {}
    return {}

def save_data(data: Dict[str, Any]) -> None:
    """Save mood data to file"""
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f, indent=2)
    except IOError as e:
        raise HTTPException(status_code=500, detail=f"Failed to save data: {str(e)}")

class MoodData(BaseModel):
    moods: Dict[str, Any]  # date: mood value

class SingleMood(BaseModel):
    date: str  # YYYY-MM-DD format
    mood: Any  # mood value

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Mood Tracker API", "version": "1.0.0"}

@app.get("/api/moods")
async def get_moods():
    """Get all mood entries"""
    data = load_data()
    return {"moods": data}

@app.post("/api/moods")
async def set_moods(mood_data: MoodData):
    """Set multiple mood entries (replace all)"""
    try:
        # Validate date format
        for date_key in mood_data.moods.keys():
            if not validate_date_format(date_key):
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid date format: {date_key}. Expected YYYY-MM-DD"
                )
        
        save_data(mood_data.moods)
        return {"message": "Moods saved successfully", "count": len(mood_data.moods)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save moods: {str(e)}")

@app.post("/api/mood")
async def set_single_mood(mood: SingleMood):
    """Set a single mood entry"""
    try:
        if not validate_date_format(mood.date):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid date format: {mood.date}. Expected YYYY-MM-DD"
            )
        
        data = load_data()
        data[mood.date] = mood.mood
        save_data(data)
        return {"message": "Mood saved successfully", "date": mood.date, "mood": mood.mood}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save mood: {str(e)}")

@app.delete("/api/moods")
async def clear_moods():
    """Clear all mood entries"""
    try:
        if os.path.exists(DATA_FILE):
            os.remove(DATA_FILE)
        return {"message": "All moods cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear moods: {str(e)}")

def validate_date_format(date_str: str) -> bool:
    """Validate date format YYYY-MM-DD"""
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
        return True
    except ValueError:
        return False

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

