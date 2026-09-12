import sys
from app.ai.llm.base import LLMProviderInterface, RecoverableProviderError, NonRecoverableProviderError
from app.ai.llm.fallback_provider import FallbackProvider

class MockProvider(LLMProviderInterface):
    def __init__(self, name, behavior):
        self.name = name
        self.behavior = behavior # success, recoverable_error, auth_error

    @property
    def provider_name(self) -> str:
        return self.name

    def is_configured(self) -> bool:
        return True

    def generate_response(self, prompt: str) -> str:
        if self.behavior == "success":
            return f"Success from {self.name}"
        elif self.behavior == "recoverable_error":
            raise RecoverableProviderError(f"Simulated 429/Timeout on {self.name}")
        elif self.behavior == "auth_error":
            raise NonRecoverableProviderError(f"Simulated 401 Invalid Key on {self.name}")

def run_tests():
    print("\n--- A. NVIDIA succeeds ---")
    fb = FallbackProvider(MockProvider("nvidia", "success"), MockProvider("gemini", "success"))
    res = fb.generate_response("test")
    print(f"Result: {res} | Provider used: {fb.last_provider_used}")
    assert fb.last_provider_used == "nvidia"

    print("\n--- B. NVIDIA returns 429 (Recoverable) ---")
    fb = FallbackProvider(MockProvider("nvidia", "recoverable_error"), MockProvider("gemini", "success"))
    res = fb.generate_response("test")
    print(f"Result: {res} | Provider used: {fb.last_provider_used}")
    assert fb.last_provider_used == "gemini_fallback"

    print("\n--- E. NVIDIA authentication failure (Non-recoverable) ---")
    fb = FallbackProvider(MockProvider("nvidia", "auth_error"), MockProvider("gemini", "success"))
    res = fb.generate_response("test")
    print(f"Result: {res} | Provider used: {fb.last_provider_used}")
    assert fb.last_provider_used == "error_non_recoverable"
    assert "401" in res

    print("\n--- F. Both providers fail (Recoverable) ---")
    fb = FallbackProvider(MockProvider("nvidia", "recoverable_error"), MockProvider("gemini", "recoverable_error"))
    res = fb.generate_response("test")
    print(f"Result: {res} | Provider used: {fb.last_provider_used}")
    assert fb.last_provider_used == "error_all_failed"
    assert "temporarily unavailable" in res
    
    print("\n✅ All fallback logic tests passed perfectly!")

if __name__ == "__main__":
    run_tests()
