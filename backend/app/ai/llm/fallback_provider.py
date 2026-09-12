from app.ai.llm.base import LLMProviderInterface, RecoverableProviderError, NonRecoverableProviderError
import logging

logger = logging.getLogger(__name__)

class FallbackProvider(LLMProviderInterface):
    def __init__(self, primary: LLMProviderInterface, secondary: LLMProviderInterface):
        self.primary = primary
        self.secondary = secondary
        # Keep track of which provider succeeded (for testing/reporting)
        self.last_provider_used = None

    @property
    def provider_name(self) -> str:
        return "fallback_manager"

    def is_configured(self) -> bool:
        # Considered configured if at least the primary is configured
        return self.primary.is_configured()

    def generate_response(self, prompt: str) -> str:
        self.last_provider_used = None
        
        # 1. Try Primary
        try:
            response = self.primary.generate_response(prompt)
            self.last_provider_used = self.primary.provider_name
            return response
        except NonRecoverableProviderError as e:
            # Primary failed with a hard configuration error (e.g. invalid auth).
            # Do NOT fallback. Bubble this up directly.
            self.last_provider_used = "error_non_recoverable"
            return str(e)
        except RecoverableProviderError as e:
            logger.warning(f"Primary provider '{self.primary.provider_name}' failed with recoverable error: {e}. Falling back to secondary...")
            pass # Fallthrough to secondary
        except Exception as e:
            logger.warning(f"Primary provider '{self.primary.provider_name}' failed with unknown error: {e}. Falling back to secondary...")
            pass # Fallthrough to secondary

        # 2. Try Secondary
        try:
            response = self.secondary.generate_response(prompt)
            self.last_provider_used = f"{self.secondary.provider_name}_fallback"
            return response
        except NonRecoverableProviderError as e:
            self.last_provider_used = "error_non_recoverable"
            return str(e)
        except RecoverableProviderError as e:
            logger.error(f"Secondary provider '{self.secondary.provider_name}' also failed with recoverable error: {e}")
            pass
        except Exception as e:
            logger.error(f"Secondary provider '{self.secondary.provider_name}' also failed with unknown error: {e}")
            pass

        # 3. Both failed with recoverable errors
        self.last_provider_used = "error_all_failed"
        return "AI Tutor is temporarily unavailable. Both primary and backup systems are currently unreachable. Please try again in a moment."
