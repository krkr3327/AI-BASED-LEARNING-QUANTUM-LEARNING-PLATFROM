from abc import ABC, abstractmethod
from typing import List, Dict, Any
import collections
import math
import re

class VectorStoreInterface(ABC):
    @abstractmethod
    def insert_chunks(self, chunks: List[str], metadatas: List[Dict[str, Any]]):
        pass

    @abstractmethod
    def similarity_search(self, query: str, top_k: int = 5, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        pass

class MetadataVectorStore(VectorStoreInterface):
    """
    A metadata-aware TF-IDF in-memory store. 
    Implements the vector store architectural layer without heavy dependencies.
    """
    def __init__(self):
        self.documents = []
        self.idf = {}
        self.doc_count = 0

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r'\b\w+\b', text.lower())

    def _compute_tf(self, words: List[str]) -> Dict[str, float]:
        tf = collections.Counter(words)
        total = len(words)
        if total == 0:
            return {}
        for k in tf:
            tf[k] = tf[k] / total
        return tf

    def insert_chunks(self, chunks: List[str], metadatas: List[Dict[str, Any]]):
        df = collections.Counter()
        
        for text, meta in zip(chunks, metadatas):
            words = self._tokenize(text)
            tf = self._compute_tf(words)
            self.documents.append({
                "text": text,
                "metadata": meta,
                "tf": tf,
                "words": words
            })
            for word in set(words):
                df[word] += 1
            self.doc_count += 1
            
        # Recompute IDF
        for word, count in df.items():
            self.idf[word] = math.log((self.doc_count + 1) / (count + 1)) + 1

    def similarity_search(self, query: str, top_k: int = 5, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        if not self.documents:
            return []
            
        query_words = self._tokenize(query)
        query_tf = self._compute_tf(query_words)
        
        scores = []
        for doc in self.documents:
            # Apply filters
            if filters:
                match = True
                for k, v in filters.items():
                    if doc["metadata"].get(k) != v:
                        match = False
                        break
                if not match:
                    continue
                    
            score = 0.0
            for word, q_tf in query_tf.items():
                if word in doc["tf"] and word in self.idf:
                    score += (q_tf * self.idf[word]) * (doc["tf"][word] * self.idf[word])
            scores.append((score, doc))
            
        scores.sort(key=lambda x: x[0], reverse=True)
        
        results = []
        for score, doc in scores[:top_k]:
            if score > 0:
                results.append({
                    "text": doc["text"],
                    "metadata": doc["metadata"],
                    "score": score
                })
                
        return results
