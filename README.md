# MoodTracker
A MoodTracking app with full-stack capabilities

## Features

- 📊 Mood tracking with visual heatmap
- 📈 Statistics and analytics
- 🌓 Light/Dark theme support
- 💾 Local storage persistence
- 📤 Data export/import
- 🔄 Backend sync (optional)
- ✨ Smooth animations

## Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Backend Setup (Optional)

The backend is optional and provides cloud sync functionality.

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the FastAPI server:
```bash
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### Backend API Endpoints

- `GET /api/moods` - Get all mood entries
- `POST /api/moods` - Set all mood entries (replace)
- `POST /api/mood` - Set a single mood entry
- `DELETE /api/moods` - Clear all mood entries

### Environment Variables

You can set the backend URL using an environment variable:
```bash
VITE_API_URL=http://localhost:8000 npm run dev
```

Or create a `.env` file:
```
VITE_API_URL=http://localhost:8000
```

## Usage

1. **Track Your Mood**: Click "Select Mood" to record how you're feeling
2. **View History**: Browse your mood history in the interactive heatmap
3. **Year Navigation**: Use the previous/next buttons to view different years
4. **Statistics**: Check the Stats page for insights about your mood patterns
5. **Export/Import**: Backup your data or restore from a backup file
6. **Backend Sync**: Sync your data with the backend server (if running)

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: FastAPI, Python
- **Storage**: LocalStorage (frontend), JSON file (backend)
