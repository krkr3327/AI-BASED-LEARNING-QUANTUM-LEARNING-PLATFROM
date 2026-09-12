import sys
from app.dependencies import get_ai_service
from app.schemas.ai import AIRequest

def test_ollama():
    ai_service = get_ai_service()
    
    print("Testing AI Service Provider Integration...")
    print(f"Active Provider: {ai_service.llm_provider.provider_name}")
    print(f"Base URL: {ai_service.llm_provider.base_url}")
    print(f"Model: {ai_service.llm_provider.model}")
    
    req = AIRequest(user_question="What is a qubit?")
    
    print("\nSending request to Ollama Cloud...")
    try:
        response = ai_service.query(req)
        print("\n=== RESPONSE ===")
        print(f"Status: {response.status}")
        print(f"Answer:\n{response.answer}")
    except Exception as e:
        print("\n=== UNCAUGHT EXCEPTION (SHOULD NOT HAPPEN) ===")
        print(str(e))

if __name__ == "__main__":
    test_ollama()
