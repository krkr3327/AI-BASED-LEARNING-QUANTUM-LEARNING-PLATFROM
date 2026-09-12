from app.rag.embeddings.embedder import EmbedderInterface
from app.rag.vector_store.store import VectorStoreInterface

class RetrieverAbstraction:
    def __init__(self, embedder: EmbedderInterface, vector_store: VectorStoreInterface):
        self.embedder = embedder
        self.vector_store = vector_store

    def retrieve(self, query: str):
        # Abstraction only
        pass
