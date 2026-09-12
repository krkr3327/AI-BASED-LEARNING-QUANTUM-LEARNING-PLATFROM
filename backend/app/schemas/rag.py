from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class RAGQueryRequest(BaseModel):
    query: str

class RAGQueryResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]] = []
