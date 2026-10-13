from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from contextlib import asynccontextmanager

from backend.app.config import settings
from backend.app.database import init_db
from backend.app.services.ml_service import ml_service
from backend.app.routes import auth_router, users_router, predict_router, meta_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and pre-load ML models
    print(f"[{settings.PROJECT_NAME}] Initializing database tables...")
    init_db()
    print(f"[{settings.PROJECT_NAME}] Preloading machine learning models...")
    if not ml_service.is_ready():
        ml_service.load_models()
    yield
    # Shutdown logic (if any)
    print(f"[{settings.PROJECT_NAME}] Shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="RESTful API for Machine Learning Adverse Vaccine Reaction and Onset Time Prediction with User Management.",
    lifespan=lifespan
)

# Setup CORS for web app frontend (React/Vite/Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(meta_router, prefix=settings.API_V1_PREFIX)
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(users_router, prefix=settings.API_V1_PREFIX)
app.include_router(predict_router, prefix=settings.API_V1_PREFIX)

@app.get("/", include_in_schema=False)
def root():
    """Redirect root path to interactive Swagger API documentation."""
    return RedirectResponse(url="/docs")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
