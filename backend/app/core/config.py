from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    environment: str = "development"
    llm_provider: str = "gemini"
    llm_api_key: str = ""
    llm_model: str = "gemini-2.5-flash"
    vector_store_path: str = "./data/vector_store"
    # OpenAI (paid)
    openai_api_key: str = ""
    # Google Gemini (free tier)
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    # Ollama
    ollama_api_key: str = ""
    ollama_base_url: str = "https://api.ollama.com/v1"
    ollama_model: str = "nemotron-3-nano:30b"
    ollama_timeout: int = 120

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
