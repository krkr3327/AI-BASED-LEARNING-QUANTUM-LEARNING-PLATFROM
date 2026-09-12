import os
from typing import List, Dict, Any
from app.rag.ingestion.chunker import MarkdownSemanticChunker
from app.rag.vector_store.store import MetadataVectorStore

class NativeRetriever:
    """
    A minimal native Python retriever.
    Uses MarkdownSemanticChunker for chunking and MetadataVectorStore for retrieval.
    """
    def __init__(self, knowledge_dir: str):
        self.knowledge_dir = knowledge_dir
        self.chunker = MarkdownSemanticChunker(max_chunk_size=1500, min_chunk_size=50)
        self.store = MetadataVectorStore()
        self._load_and_index()

    def _load_and_index(self):
        if not os.path.exists(self.knowledge_dir):
            return
            
        all_chunks = []
        all_metadatas = []

        for filename in os.listdir(self.knowledge_dir):
            if filename.endswith(".md") or filename.endswith(".txt"):
                filepath = os.path.join(self.knowledge_dir, filename)
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                    
                doc_meta = {
                    "document_id": filename,
                    "title": filename.replace(".md", "").replace("_", " ").title(),
                    "source": filepath,
                    "source_url": f"local://{filename}"
                }
                
                chunks = self.chunker.chunk_document(content, doc_meta)
                for chunk in chunks:
                    all_chunks.append(chunk["text"])
                    all_metadatas.append(chunk["metadata"])
                        
        if all_chunks:
            self.store.insert_chunks(all_chunks, all_metadatas)

    def retrieve(self, query: str, top_k: int = 3, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        results = self.store.similarity_search(query, top_k=top_k, filters=filters)
        
        # Map back to the expected output format of pipeline.py / schemas.ai
        mapped_results = []
        for r in results:
            meta = r["metadata"]
            mapped_results.append({
                "text": r["text"],
                "source": {
                    "document_id": meta.get("document_id", "unknown"),
                    "chunk_id": meta.get("chunk_id", "unknown"),
                    "title": meta.get("title"),
                    "topic": meta.get("topic"),
                    "source_url": meta.get("source_url")
                }
            })
            
        return mapped_results
