from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from typing import Generator, Optional
from backend.app.config import settings
import os

# Create parent directory for sqlite DB if it doesn't exist
if settings.DATABASE_URL.startswith("sqlite"):
    db_file_path = settings.DATABASE_URL.replace("sqlite:///", "")
    db_dir = os.path.dirname(os.path.abspath(db_file_path))
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
    connect_args = {"check_same_thread": False}
else:
    connect_args = {}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator[Optional[Session], None, None]:
    """
    FastAPI Dependency for SQLite database session management.
    Yields None when MongoDB is the active database engine.
    """
    if settings.DB_TYPE != "sqlite":
        yield None
        return

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db() -> None:
    """Initialize SQLite database tables when DB_TYPE is sqlite."""
    if settings.DB_TYPE != "sqlite":
        return

    # Import all models to ensure they are registered with Base metadata
    import backend.app.models.user # noqa: F401
    import backend.app.models.prediction # noqa: F401
    import backend.app.models.child # noqa: F401
    Base.metadata.create_all(bind=engine)

    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        if "children" in inspector.get_table_names():
            columns = [col["name"] for col in inspector.get_columns("children")]
            with engine.connect() as conn:
                if "current_illness" not in columns:
                    conn.execute(text("ALTER TABLE children ADD COLUMN current_illness VARCHAR(500) DEFAULT ''"))
                if "current_medication" not in columns:
                    conn.execute(text("ALTER TABLE children ADD COLUMN current_medication VARCHAR(500) DEFAULT ''"))
                conn.commit()
    except Exception as e:
        print(f"SQLite migration check warning: {e}")
