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

The `frontend` directory contains a small React application. To install its
dependencies and start the development server:

```bash
cd frontend
npm install
npm run dev # or `npm start` if using Create React App
```

The app will be available at `http://localhost:3000` by default.

## SQL Queries

Analytics data is stored in the `events` table. Two example queries are shown
below using SQLite syntax.

### Top 3 filters

```sql
SELECT json_extract(meta, '$.filter') AS filter,
       COUNT(*) AS uses
FROM events
WHERE action = 'apply_filter'
GROUP BY filter
ORDER BY uses DESC
LIMIT 3;
```

Example result:

```
filter              | uses
--------------------+-----
industry=Technology | 18
size>=100           | 10
industry=Finance    |  7
```

### Pie vs. Bar preference

```sql
SELECT json_extract(meta, '$.type') AS chart_type,
       COUNT(*) AS views
FROM events
WHERE action = 'chart_type'
GROUP BY chart_type;
```

Example result:

```
chart_type | views
-----------+-----
pie        | 30
bar        | 20
```
