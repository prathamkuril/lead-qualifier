# Lead Qualifier

This repository contains a minimal backend implementation for the Growth AI Engineer take-home challenge. It exposes API endpoints using **FastAPI**, stores data in **SQLite** via **SQLAlchemy**, and loads the provided `leads.csv` into the database on startup.

## Running the API

1. Install dependencies:

```bash
pip install -r backend/requirements.txt
```

2. Start the development server:

```bash
uvicorn backend.app:app --reload
```

The API will be available at `http://localhost:8000`.
