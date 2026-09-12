import os
from pathlib import Path
from app.ai.llm.base import LLMProviderInterface

# Load .env from the backend root
try:
    from dotenv import load_dotenv
    _env_path = Path(__file__).resolve().parents[3] / ".env"
    load_dotenv(dotenv_path=_env_path, override=True)
except ImportError:
    pass

class OllamaProvider(LLMProviderInterface):
    def __init__(self):
        self.api_key = os.getenv("OLLAMA_API_KEY", "").strip()
        self.base_url = os.getenv("OLLAMA_BASE_URL", "https://api.ollama.com/v1").strip()
        self.model = os.getenv("OLLAMA_MODEL", "nemotron-3-nano:30b").strip()
        self.timeout = int(os.getenv("OLLAMA_TIMEOUT", "120"))

        try:
            import openai
            self.client = openai.OpenAI(
                api_key=self.api_key if self.api_key else "ollama", 
                base_url=self.base_url,
                timeout=self.timeout
            )
        except Exception:
            self.client = None

    @property
    def provider_name(self) -> str:
        return "ollama"

    def is_configured(self) -> bool:
        return self.client is not None

    def generate_response(self, prompt: str) -> str:
        if not self.client:
            return "Error: Ollama Cloud provider is not configured properly."

        system_prompt = (
            "You are a quantum computing educational tutor. "
            "Explain concepts according to the student level provided in the prompt. "
            "Use retrieved knowledge context when available to ground your answer, distinguishing it from uncertain information. "
            "Explain Qiskit simulation results using ONLY the supplied results. "
            "Never invent circuit measurements, physical ground truths, or pretend to simulate circuits yourself. "
            "Provide concise educational answers, and use examples when useful."
        )

        try:
            import openai
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=1024
            )
            
            if not response.choices or not response.choices[0].message.content:
                return "Error: Received empty response from Ollama Cloud."
                
            return response.choices[0].message.content.strip()
            
        except openai.AuthenticationError:
            return "AI Tutor is temporarily unavailable (Authentication Error). Please check your configuration."
        except openai.RateLimitError:
            return "AI Tutor is temporarily unavailable (Rate Limited). Please try again in a moment."
        except openai.InternalServerError:
            return "AI Tutor is temporarily unavailable (Cloud Service Error). Please try again later."
        except openai.NotFoundError:
            return "AI Tutor is temporarily unavailable (Model Not Found). Please check the configured OLLAMA_MODEL."
        except (openai.APIConnectionError, openai.APITimeoutError):
            return "AI Tutor is temporarily unavailable (Network/Timeout). Please try again in a moment."
        except Exception:
            # Generic catch-all without exposing any stack traces or keys
            return "AI Tutor is temporarily unavailable. Please try again in a moment."
