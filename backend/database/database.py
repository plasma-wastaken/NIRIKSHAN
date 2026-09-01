"""
Database configuration and session management for NIRIKSHAN.
Provides SQLAlchemy engine, session factory, and dependency injection.
"""
import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Read DATABASE_URL from environment variable
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://username:password@localhost:5432/nirikshan"
)

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL query logging during development
    pool_pre_ping=True,  # Verify connections before using them
    pool_size=10,
    max_overflow=20
)

# Create SessionLocal class for session management
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create declarative base for models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function that provides a database session.
    
    Yields:
        Session: SQLAlchemy session for database operations
        
    Usage in FastAPI:
        @app.get("/inspections")
        def get_inspections(db: Session = Depends(get_db)):
            return db.query(Inspection).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize database by creating all tables.
    Note: In production, use Alembic migrations instead.
    """
    Base.metadata.create_all(bind=engine)


def drop_db() -> None:
    """
    Drop all tables from the database.
    WARNING: This will delete all data. Use only in development/testing.
    """
    Base.metadata.drop_all(bind=engine)
