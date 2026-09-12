import sys
from pathlib import Path

# Ensure the backend directory is in the path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

from app.ai.llm.ollama_provider import OllamaProvider

def run_test():
    print("Testing Ollama Cloud Provider...")
    provider = OllamaProvider()
    
    if not provider.is_configured():
        print("Provider is NOT configured. Check environment variables.")
        return

    print("Provider configured correctly.")
    print(f"Base URL: {provider.base_url}")
    print(f"Model: {provider.model}")
    print(f"Timeout: {provider.timeout}")
    print("API Key loaded: YES (value hidden)")
    
    print("\nSending query to Ollama Cloud: 'What is a qubit? Explain in two sentences.'")
    response = provider.generate_response("What is a qubit? Explain in two sentences.")
    
    print("\n--- Response ---")
    print(response)
    print("----------------")

if __name__ == "__main__":
    run_test()
