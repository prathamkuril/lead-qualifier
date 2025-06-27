from datetime import datetime
import json

from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from .models import Lead, Event, SessionLocal, init_db

app = FastAPI(title="Lead Qualifier API")


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

    class Config:
        orm_mode = True


class EventIn(BaseModel):
    userId: str = Field(..., alias="userId")
    action: str
    metadata: dict = Field(default_factory=dict)
    timestamp: datetime


@app.get("/api/leads", response_model=list[LeadOut])
def get_leads(industry: str | None = None, size: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Lead)
    if industry:
        query = query.filter(Lead.industry == industry)
    if size:
        query = query.filter(Lead.size >= size)
    leads = query.all()
    return leads


@app.post("/api/events", status_code=201)
def create_event(event: EventIn, db: Session = Depends(get_db)):
    db_event = Event(
        user_id=event.userId,
        action=event.action,
        metadata=json.dumps(event.metadata),
        occurred_at=event.timestamp,
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return {"status": "ok", "id": db_event.id}
