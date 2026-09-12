import sys
from app.dependencies import get_ai_service
from app.schemas.ai import AIRequest

def test_full_flow():
    ai_service = get_ai_service()
    
    print("Testing End-to-End Fallback Architecture...")
    print(f"Active Provider: {ai_service.llm_provider.provider_name}")
    
    req = AIRequest(user_question="What is a qubit?")
    
    try:
        response = ai_service.query(req)
        print("\n=== E2E RESPONSE ===")
        print(f"Status: {response.status}")
        print(f"Provider Used (Metadata): {response.provider}")
        print(f"Answer:\n{response.answer}")
    except Exception as e:
        print("\n=== UNCAUGHT EXCEPTION ===")
        print(str(e))

if __name__ == "__main__":
    test_full_flow()
