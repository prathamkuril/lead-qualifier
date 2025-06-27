from datetime import datetime
import csv
import os
from typing import Optional

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'data', 'app.db')
CSV_PATH = os.path.join(BASE_DIR, 'data', 'leads.csv')

DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Lead(Base):
    __tablename__ = 'leads'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    company = Column(String)
    industry = Column(String)
    size = Column(Integer)
    source = Column(String)
    created_at = Column(DateTime)


class Event(Base):
    __tablename__ = 'events'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String)
    action = Column(String)
    # ``metadata`` is reserved by SQLAlchemy's declarative API, so we map the
    # database column named ``metadata`` to the ``meta`` attribute instead.
    meta = Column("metadata", Text)
    occurred_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    """Create tables and load leads from CSV on first run."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        has_leads = db.query(Lead).first() is not None
        if not has_leads and os.path.exists(CSV_PATH):
            with open(CSV_PATH, newline='') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    created = datetime.fromisoformat(row['created_at'].replace('Z', ''))
                    db_lead = Lead(
                        id=int(row['id']),
                        name=row['name'],
                        company=row['company'],
                        industry=row['industry'],
                        size=int(row['size']),
                        source=row['source'],
                        created_at=created,
                    )
                    db.add(db_lead)
            db.commit()
    finally:
        db.close()
