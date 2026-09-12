from app.rag.retrieval.native_retriever import NativeRetriever
import os

class RAGPipeline:
    def __init__(self, knowledge_dir: str = None):
        if not knowledge_dir:
            knowledge_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'knowledge')
        self.retriever = NativeRetriever(knowledge_dir)

    def process_query(self, query: str) -> dict:
        results = self.retriever.retrieve(query)
        if not results:
            return {"answer": "No relevant quantum knowledge found.", "sources": []}
        
        texts = [doc["text"] for doc in results]
        sources = [doc["source"] for doc in results]
        return {"answer": "\n\n".join(texts), "sources": sources}
