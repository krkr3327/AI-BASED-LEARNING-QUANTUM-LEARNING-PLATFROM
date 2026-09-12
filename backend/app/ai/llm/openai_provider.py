import os
from pathlib import Path
from app.ai.llm.base import LLMProviderInterface

# Load .env from the backend root so OPENAI_API_KEY is always available
try:
    from dotenv import load_dotenv
    _env_path = Path(__file__).resolve().parents[4] / ".env"
    load_dotenv(dotenv_path=_env_path, override=False)
except ImportError:
    pass

class OpenAIProvider(LLMProviderInterface):
    def __init__(self):
        # Read from settings (pydantic-settings already loaded .env)
        try:
            from app.core.config import settings
            self.api_key = settings.openai_api_key.strip()
        except Exception:
            self.api_key = os.getenv("OPENAI_API_KEY", "").strip()

        self.model = os.getenv("LLM_MODEL", "gpt-4o-mini")
        if self.api_key and self.api_key != "dummy":
            try:
                import openai
                self.client = openai.OpenAI(api_key=self.api_key)
            except Exception:
                self.client = None
        else:
            self.client = None

    @property
    def provider_name(self) -> str:
        return "openai"

    def is_configured(self) -> bool:
        return self.client is not None

    def generate_response(self, prompt: str) -> str:
        if not self.client:
            return "llm_not_configured"

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are QuantumTutor, an authoritative quantum computing educational assistant. Ground all explanations in the actual quantum execution results and statevectors provided. Never invent quantum physics or simulate circuits yourself — the backend simulator provides all physical ground truth."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=1000
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"LLM Execution Error: {str(e)}"

