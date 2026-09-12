from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class LLMProviderInterface(ABC):
    @abstractmethod
    def generate_response(self, prompt: str) -> str:
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

class RecoverableProviderError(Exception):
    """Raised when the provider fails but fallback should be attempted (e.g. 429, 500, timeout)."""
    pass

class NonRecoverableProviderError(Exception):
    """Raised when the provider fails and fallback MUST NOT be attempted (e.g. missing API key, 401)."""
    pass
