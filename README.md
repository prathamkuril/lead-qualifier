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

## Running the Frontend

The React dashboard lives in the `frontend/` directory. Make sure the API is
running (see above), then in a separate terminal start the Vite dev server:

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Launch the app:

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173` and API requests to
`/api` will automatically proxy to the backend.
