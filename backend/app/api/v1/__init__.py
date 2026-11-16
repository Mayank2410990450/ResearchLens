from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.projects import router as projects_router
from app.api.v1.papers import router as papers_router
from app.api.v1.collections import router as collections_router
from app.api.v1.notes import router as notes_router
from app.api.v1.chat import router as chat_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.comparison import router as comparison_router
from app.api.v1.gaps import router as gaps_router
from app.api.v1.review import router as review_router
from app.api.v1.settings import router as settings_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(projects_router)
api_v1_router.include_router(papers_router)
api_v1_router.include_router(collections_router)
api_v1_router.include_router(notes_router)
api_v1_router.include_router(chat_router)
api_v1_router.include_router(dashboard_router)
api_v1_router.include_router(comparison_router)
api_v1_router.include_router(gaps_router)
api_v1_router.include_router(review_router)
api_v1_router.include_router(settings_router)
