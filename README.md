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

## Building the Frontend

To generate a production build and preview it locally:

```bash
cd frontend
npm run build
npm run preview
```

The optimized assets will be written to `frontend/dist/`.

## Regenerating Sample Data

If you want to create a fresh set of synthetic leads, run:

```bash
pip install -r requirements.txt  # installs Faker
python data/generate_data.py
```

This will overwrite `data/leads.csv` with new randomly generated leads used by the API.

## Event Tracking

Every interaction in the dashboard is sent to the `/api/events` endpoint. A
unique `userId` is persisted in `localStorage` so events from the same browser
session can be correlated. Each event record includes:

- `userId` – the session identifier
- `action` – the name of the action (e.g. `refresh`)
- `metadata` – optional JSON payload with context
- `timestamp` – ISO 8601 time of the event

These events are stored in the SQLite database for later analysis.
