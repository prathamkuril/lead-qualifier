# Lead Qualifier

This repository implements the **Growth AI Engineer take-home challenge**, delivering a minimal full-stack application for qualifying and analyzing demo-request leads. It includes:

- A **FastAPI** backend exposing API endpoints
- A **SQLite** database managed with **SQLAlchemy**
- Automatic data loading from `leads.csv`
- Event tracking of user interactions
- LLM-based lead enrichment

---

# Video Walkthrough : [Click here!](https://drive.google.com/file/d/1OUEb_B1_2B9mkM5hzS7VZDzlEMthFmo8/view?usp=sharing)

## Running the API

1. **Install dependencies:**

   ```bash
   pip install -r backend/requirements.txt
   ```

2. **Start the development server:**

   ```bash
   uvicorn backend.app:app --reload
   ```

   The API will be available at [http://localhost:8000](http://localhost:8000).

---

## Building the Frontend

To build the frontend for production and preview it locally:

```bash
cd frontend
npm install
npm run build
npm run preview
```

The optimized assets will be generated in `frontend/dist/`. The preview server will display the local URL.

---

## Regenerating Sample Data

To create a fresh set of synthetic leads:

```bash
python data/generate_data.py
```

This will overwrite `data/leads.csv` with new randomly generated leads.

---

## Event Tracking

User interactions are logged via POST requests to `/api/events`. Each record includes:

- `userId` – session identifier
- `action` – action name (e.g., `refresh`)
- `metadata` – optional JSON context
- `timestamp` – ISO 8601 time of the event

Tracked actions include:

- `page_load` – app initialization
- `industry_filter` and `size_filter` – filter changes
- `toggle_view` – switching between table and chart views
- `refresh` – manual data refresh
- `reset_filters` – clearing filters
- `sort` – column sorting
- `export_csv` – downloading the current table as CSV

Events are stored in the SQLite database.

---

## LLM Enrichment

If an `OPENAI_API_KEY` environment variable is set, the backend enriches leads on request using OpenAI’s `gpt-4-turbo` model. The prompt used:

```
"Classify the quality of this lead as High, Medium, or Low based on "
        "industry and employee size. Provide also one short sentence summary "
        "of the company. Respond in JSON with keys 'quality' and 'summary'.\n"
        f"Company: {lead.company}\nIndustry: {lead.industry}\nSize: {lead.size}"
```

**Example enriched lead:**

```json
{
  "id": 1,
  "name": "Alice Smith",
  "company": "Acme Corp",
  "industry": "Manufacturing",
  "size": 200,
  "source": "PPC",
  "created_at": "2025-06-01T10:23:00Z",
  "quality": "High",
  "summary": "Acme Corp is a leading manufacturing firm specializing in..."
}
```

If no API key is configured, `quality` and `summary` will remain `null`.

---

## Running SQL Queries

To analyze event data, launch the SQLite shell connected to the application database:

```bash
python -m sqlite3 data/app.db
```

Below are the **exact SQL commands and outputs** executed in the shell:

---

**1. Top industries filtered in the last 7 days**

```sql
SELECT
    COALESCE(NULLIF(json_extract(metadata, '$.industry'), ''), 'All') AS industry,
    COUNT(*) AS uses
FROM events
WHERE action = 'industry_filter'
  AND occurred_at >= datetime('now', '-7 days')
GROUP BY industry
ORDER BY uses DESC
LIMIT 3;
```

**Output:**

```
('Manufacturing', 16)
('Technology', 9)
('All', 7)
```

---

**2. View toggle preference**

```sql
SELECT
    json_extract(metadata, '$.view') AS view,
    ROUND(100.0 * COUNT(*) /
        (SELECT COUNT(*) FROM events WHERE action = 'toggle_view'), 2
    ) AS pct
FROM events
WHERE action = 'toggle_view'
GROUP BY view;
```

**Output:**

```
('chart', 50.93)
('table', 49.07)
```

---

This implementation demonstrates backend API design, frontend data visualization, event instrumentation, and optional AI-based enrichment, fulfilling the requirements of the Growth AI Engineer take-home challenge with a professional, data-driven approach.
