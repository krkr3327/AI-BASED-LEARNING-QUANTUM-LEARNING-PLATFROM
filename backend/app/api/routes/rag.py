from fastapi import APIRouter, Depends
from app.schemas.rag import RAGQueryRequest, RAGQueryResponse
from app.services.rag_service import RAGService
from app.dependencies import get_rag_service

router = APIRouter()

@router.post("/query", response_model=RAGQueryResponse)
def rag_query(request: RAGQueryRequest, rag_service: RAGService = Depends(get_rag_service)):
    return rag_service.query(request)
