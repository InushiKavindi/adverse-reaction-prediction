from backend.app.routes.auth import router as auth_router
from backend.app.routes.users import router as users_router
from backend.app.routes.predict import router as predict_router
from backend.app.routes.meta import router as meta_router

__all__ = ["auth_router", "users_router", "predict_router", "meta_router"]
