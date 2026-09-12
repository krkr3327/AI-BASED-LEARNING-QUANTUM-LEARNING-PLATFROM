from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("")
def health_check():
    return {
        "service": "running",
        "environment": settings.environment,
        "llm": "not_configured" if settings.llm_provider == "placeholder" else "configured",
        "rag": "not_configured",
        "quantum_engine": "not_connected",
        "database": "not_configured"
    }
