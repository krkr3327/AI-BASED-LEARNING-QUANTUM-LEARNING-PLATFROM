from app.schemas.rag import RAGQueryRequest, RAGQueryResponse
from app.rag.pipeline import RAGPipeline

class RAGService:
    def __init__(self, pipeline: RAGPipeline = None):
        self.pipeline = pipeline or RAGPipeline()

    def query(self, request: RAGQueryRequest) -> RAGQueryResponse:
        res = self.pipeline.process_query(request.query)
        return RAGQueryResponse(answer=res["answer"], sources=res["sources"])
