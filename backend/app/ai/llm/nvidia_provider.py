import os
import openai
from pathlib import Path
from app.ai.llm.base import LLMProviderInterface, RecoverableProviderError, NonRecoverableProviderError

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

class NvidiaProvider(LLMProviderInterface):
    def __init__(self):
        self.api_key = os.getenv("NVIDIA_API_KEY", "").strip()
        self.model_name = os.getenv("NVIDIA_MODEL", "meta/llama-3.1-8b-instruct").strip()
        self.base_url = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1").strip()
        
        self.client = None
        self._error = ""

        if self.api_key and self.api_key != "nvapi-your-key-here" and self.api_key != "dummy":
            try:
                self.client = openai.OpenAI(
                    api_key=self.api_key,
                    base_url=self.base_url,
                )
            except Exception as e:
                self._error = str(e)
        else:
            self._error = "API key is missing or is the default placeholder."

    @property
    def provider_name(self) -> str:
        return "nvidia"

    def is_configured(self) -> bool:
        return self.client is not None

    def generate_response(self, prompt: str) -> str:
        if not self.client:
            raise NonRecoverableProviderError(f"Configuration Error: NVIDIA provider is not configured properly. {self._error}")

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]

        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.3,
                max_tokens=1024,
            )
            
            if not response.choices:
                raise RecoverableProviderError("Recoverable Error: Empty response from NVIDIA API.")
                
            return response.choices[0].message.content.strip()
            
        except openai.AuthenticationError:
            raise NonRecoverableProviderError("Configuration Error: Invalid NVIDIA API key. Please check NVIDIA_API_KEY.")
        except openai.NotFoundError:
            raise NonRecoverableProviderError(f"Configuration Error: NVIDIA Model '{self.model_name}' not found. Please check NVIDIA_MODEL.")
        except openai.RateLimitError:
            raise RecoverableProviderError("Recoverable Error: NVIDIA API rate limit exceeded.")
        except (openai.APIConnectionError, openai.APITimeoutError):
            raise RecoverableProviderError("Recoverable Error: Network connection or timeout to NVIDIA API.")
        except openai.InternalServerError:
            raise RecoverableProviderError("Recoverable Error: NVIDIA Internal Server Error (5xx).")
        except Exception as e:
            err = str(e)
            if self.api_key in err:
                err = err.replace(self.api_key, "[REDACTED]")
            # Assume other unknown errors are recoverable temporary issues
            raise RecoverableProviderError(f"Recoverable Error: NVIDIA API unknown failure: {err}")
