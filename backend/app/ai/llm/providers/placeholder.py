from app.ai.llm.base import LLMProviderInterface

class PlaceholderLLMProvider(LLMProviderInterface):
    def generate_response(self, prompt: str) -> str:
        return "This is a controlled placeholder response. LLM not configured."
