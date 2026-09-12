from abc import ABC, abstractmethod
from typing import List

class EmbedderInterface(ABC):
    @abstractmethod
    def embed_query(self, query: str) -> List[float]:
        pass
    
    @abstractmethod
    def embed_documents(self, documents: List[str]) -> List[List[float]]:
        pass
