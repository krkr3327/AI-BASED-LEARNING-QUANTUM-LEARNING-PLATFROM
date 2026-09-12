# Backend Architecture Document

This document outlines the architectural boundaries and abstractions for the backend of the Interactive Quantum Algorithm Learning Platform.

## Request Flow
The architecture strictly follows dependency injection to separate concerns:
`Frontend (future) -> FastAPI Route -> Dependency Injection -> Service -> Domain Abstraction -> Implementation`

## Design Principles

### LLM is Provider-Independent
The system uses an abstract `LLMProviderInterface`. The application logic (in `AIService`) never directly calls a specific provider (like OpenAI or Anthropic). Providers are configured through adapters injected via `dependencies.py`.

### RAG is Independent from the LLM
The Retrieval-Augmented Generation pipeline separates the document retrieval (`RetrieverAbstraction`) from the text generation (`LLMProviderInterface`).

### Vector Store is Replaceable
Document chunk embeddings and the vector store use abstract base classes (`EmbedderInterface`, `VectorStoreInterface`), allowing us to swap a local store for a production database later without modifying `RAGService`.

### Quantum Engine is Intentionally Deferred
The `SimulationService` currently acts as a boundary. The real quantum engine logic, states, matrix operations, and quantum algorithms are intentionally not implemented yet.

### Q-AST is Postponed
The quantum abstract syntax tree will be designed after the headless quantum simulation engine is completed (Milestone 1).
