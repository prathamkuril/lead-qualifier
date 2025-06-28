from datetime import datetime
import json
import os
import asyncio
from typing import Any, Dict

from fastapi import FastAPI, Depends
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy.orm import Session

from .models import Lead, Event, SessionLocal, init_db

import openai

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai_client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

app = FastAPI(title="Lead Qualifier API")


@app.get("/", include_in_schema=False)
def index() -> RedirectResponse:
    """Redirect the bare root path to the interactive API docs."""
    return RedirectResponse(url="/docs")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    init_db()


class LeadOut(BaseModel):
    id: int
    name: str
    company: str
    industry: str
    size: int
    source: str
    created_at: datetime
    quality: str | None = None
    summary: str | None = None

    model_config = ConfigDict(from_attributes=True)


class EventIn(BaseModel):
    userId: str = Field(..., alias="userId")
    action: str
    metadata: dict = Field(default_factory=dict)
    timestamp: datetime


async def enrich_lead(lead: Lead) -> Dict[str, Any]:
    if not openai_client:
        return {"quality": None, "summary": None}

    prompt = (
        "Classify the quality of this lead as High, Medium, or Low based on "
        "industry and employee size. Provide also one short sentence summary "
        "of the company. Respond in JSON with keys 'quality' and 'summary'.\n"  # noqa
        f"Company: {lead.company}\nIndustry: {lead.industry}\nSize: {lead.size}"
    )

    try:
        resp = await openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            response_format={"type": "json_object"},
        )
        content = resp.choices[0].message.content
        data = json.loads(content)
        return {
            "quality": data.get("quality"),
            "summary": data.get("summary"),
        }
    except Exception:
        return {"quality": None, "summary": None}


@app.get("/api/leads", response_model=list[LeadOut])
async def get_leads(
    industry: str | None = None,
    size: int | None = None,
    enrich: bool = False,
    db: Session = Depends(get_db),
):
    query = db.query(Lead)
    if industry:
        query = query.filter(Lead.industry == industry)
    if size:
        query = query.filter(Lead.size >= size)
    leads = query.all()

    results: list[LeadOut] = []
    if enrich:
        tasks = [enrich_lead(l) for l in leads]
        enrichments = await asyncio.gather(*tasks)
        for lead, info in zip(leads, enrichments):
            lead_data = LeadOut.from_orm(lead)
            lead_data.quality = info["quality"]
            lead_data.summary = info["summary"]
            results.append(lead_data)
    else:
        results = [LeadOut.from_orm(l) for l in leads]

    return results


@app.post("/api/events", status_code=201)
def create_event(event: EventIn, db: Session = Depends(get_db)):
    db_event = Event(
        user_id=event.userId,
        action=event.action,
        meta=json.dumps(event.metadata),
        occurred_at=event.timestamp,
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return {"status": "ok", "id": db_event.id}
