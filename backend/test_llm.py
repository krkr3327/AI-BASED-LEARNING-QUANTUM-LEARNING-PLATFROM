import sys
import os
from pathlib import Path

# Add the backend directory to sys.path so we can import app modules
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

from app.ai.llm.ollama_provider import OllamaProvider

def test():
    print("Testing Ollama Provider...")
    provider = OllamaProvider()
    print(f"Provider configured: {provider.is_configured()}")
    if provider.is_configured():
        print(f"Base URL: {provider.base_url}")
        print(f"Model: {provider.model}")
        print("Generating response...")
        response = provider.generate_response("Hello, this is a test. Please reply with 'Working!'.")
        print(f"Response: {response}")

if __name__ == "__main__":
    test()
