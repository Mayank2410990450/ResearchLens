from typing import Dict, Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.models.models import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/settings", tags=["Workspace Settings"])

class SettingsPayload(BaseModel):
    llm_provider: str = "deepseek"
    model_name: str = "deepseek-chat"
    temperature: float = 0.2
    embedding_model: str = "all-MiniLM-L6-v2"
    hybrid_alpha: float = 0.7
    top_k: int = 5
    reranking_enabled: bool = True

CURRENT_SETTINGS = {
    "llm_provider": "deepseek",
    "model_name": "deepseek-chat",
    "temperature": 0.2,
    "embedding_model": "all-MiniLM-L6-v2",
    "hybrid_alpha": 0.7,
    "top_k": 5,
    "reranking_enabled": True
}

@router.get("")
def get_user_settings(current_user: User = Depends(get_current_user)):
    return {
        "user_id": str(current_user.id),
        "settings": CURRENT_SETTINGS
    }

@router.put("")
def update_user_settings(
    payload: SettingsPayload,
    current_user: User = Depends(get_current_user)
):
    global CURRENT_SETTINGS
    CURRENT_SETTINGS.update(payload.model_dump())
    return {
        "status": "success",
        "message": "Settings updated successfully",
        "settings": CURRENT_SETTINGS
    }
