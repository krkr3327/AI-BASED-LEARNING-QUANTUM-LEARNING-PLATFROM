from fastapi import APIRouter, Depends
from app.schemas.ai import AIRequest, AIResponse, AIAction
from app.services.ai_service import AIService
from app.ai.action_system import AIActionValidator
from app.dependencies import get_ai_service

router = APIRouter()

@router.post("/query", response_model=AIResponse)
def query_endpoint(request: AIRequest, ai_service: AIService = Depends(get_ai_service)):
    return ai_service.query(request)

@router.post("/chat", response_model=AIResponse)
def chat_endpoint(request: AIRequest, ai_service: AIService = Depends(get_ai_service)):
    return ai_service.chat(request)

@router.post("/validate_action", response_model=AIAction)
def validate_action_endpoint(action: AIAction):
    return AIActionValidator.validate_action(action)
