from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.quantum_engine.registry import BACKEND_REGISTRY, BackendCapability, get_backend_capabilities

router = APIRouter()

@router.get("/capabilities", response_model=List[BackendCapability])
def list_capabilities():
    return list(BACKEND_REGISTRY.values())

@router.get("/capabilities/{backend_id}", response_model=BackendCapability)
def get_capability(backend_id: str):
    try:
        return get_backend_capabilities(backend_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
