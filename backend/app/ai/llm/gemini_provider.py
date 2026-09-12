import os
import warnings
from pathlib import Path
from app.ai.llm.base import LLMProviderInterface, RecoverableProviderError, NonRecoverableProviderError

# Suppress Python 3.9 deprecation warnings from google libraries
warnings.filterwarnings("ignore", category=FutureWarning)

# Load .env
try:
    from dotenv import load_dotenv
    _env_path = Path(__file__).resolve().parents[3] / ".env"
    load_dotenv(dotenv_path=_env_path, override=True)
except ImportError:
    pass

SYSTEM_PROMPT = (
    "You are QuantumTutor, an elite quantum computing educational assistant embedded in an interactive quantum learning platform.\n\n"
    "RESPONSE STYLE RULES:\n"
    "1. Answer naturally and directly like a conversational AI. DO NOT use a rigid format.\n"
    "2. Do NOT force every answer into sections like 'Accurate Explanation', 'Simple Visual Diagram', or 'Related Questions'.\n"
    "3. Do NOT automatically generate diagrams unless it genuinely helps explain the question (e.g., for showing how a CNOT works, or explaining the Bloch sphere).\n"
    "4. DO NOT automatically append related questions. Only provide them if the user explicitly asks for them.\n"
    "5. Do NOT mention 'provided knowledge context', 'according to the retrieved context', or describe what you are doing (e.g., 'Here is a response'). Silently incorporate the retrieved RAG information naturally.\n"
    "6. Keep normal answers concise (100-250 words maximum for simple questions), and scale detail appropriately for complex ones.\n"
    "7. Never invent Qiskit simulation results. The supplied Qiskit execution results are the source of truth.\n"
    "8. Use clean Markdown naturally (headings, bold, inline code, python code blocks).\n\n"
    "Topics: Qubits, Bloch Sphere, Gates (H, X, Y, Z, CNOT, S, T), Entanglement, Bell States, Teleportation, Grover, Shor, QFT, VQE, QAOA, Error Correction, Cryostats.\n"
    "Never fabricate physics. Keep explanations crystal clear, pedagogical, and perfectly aligned with the user's level."
)

class GeminiProvider(LLMProviderInterface):
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
        self.client = None
        self._error = ""

        if self.api_key and self.api_key != "dummy":
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                self._error = str(e)
        else:
            self._error = "API key is missing or is the default placeholder."

    @property
    def provider_name(self) -> str:
        return "gemini"

    def is_configured(self) -> bool:
        return self.client is not None

    def generate_response(self, prompt: str) -> str:
        if not self.client:
            raise NonRecoverableProviderError(f"Configuration Error: Gemini provider is not configured properly. {self._error}")

        full_prompt = SYSTEM_PROMPT + "\n\nUser: " + prompt

        try:
            from google.genai import types
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    temperature=0.3,
                    max_output_tokens=1024,
                )
            )
            
            if not response or not response.text:
                raise RecoverableProviderError("Recoverable Error: Empty response from Gemini API.")
                
            return response.text.strip()

        except Exception as e:
            err = str(e).lower()
            if "429" in err or "quota" in err or "rate" in err:
                raise RecoverableProviderError("Recoverable Error: Gemini API rate limit exceeded.")
            elif "401" in err or "403" in err or "api_key" in err or "invalid_grant" in err:
                raise NonRecoverableProviderError("Configuration Error: Invalid Gemini API key. Please check GEMINI_API_KEY.")
            elif "404" in err or "not found" in err:
                raise NonRecoverableProviderError(f"Configuration Error: Gemini Model '{self.model_name}' not found. Please check GEMINI_MODEL.")
            elif "500" in err or "503" in err or "timeout" in err or "network" in err or "connection" in err:
                raise RecoverableProviderError("Recoverable Error: Network connection, timeout, or server error to Gemini API.")
            else:
                err_clean = str(e)
                if self.api_key in err_clean:
                    err_clean = err_clean.replace(self.api_key, "[REDACTED]")
                raise RecoverableProviderError(f"Recoverable Error: Gemini API unknown failure: {err_clean}")
