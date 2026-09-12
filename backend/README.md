# AI-Based Interactive Quantum Algorithm Learning Platform - Backend

This project contains the backend architecture for the Quantum Algorithm Learning Platform.

## Purpose
The purpose of this project is to provide the required endpoints for quantum learning modules, circuit validation, quantum simulations, and personalized AI tutoring through a RAG pipeline.

## Backend Architecture
The backend is structured using a service-oriented FastAPI architecture.
* **API Routing**: Cleanly separates concerns into health, simulation, ai, rag, and learning routes.
* **Dependency Injection**: Centralized in `dependencies.py` to decouple endpoints from concrete implementations.
* **LLM Abstraction**: A provider-independent LLM layer.
* **RAG Abstraction**: An extensible retrieval-augmented generation layer decoupled from the specific LLM.

## Quantum Mathematics and Headless Simulation Engine
We have implemented a custom, lightweight quantum mathematical engine to serve as the core simulator.
* **Purpose**: Provide a fast, backend-independent mechanism for tracking states and verifying basic operations without heavy external dependencies.
* **State-Vector Representation**: Represents an n-qubit pure quantum state as a $2^n$ complex NumPy array using Big-endian convention (Qubit 0 is the most significant bit).
* **Supported Gates**: $X, Y, Z, H, CNOT$.
* **Measurement**: Generates normalized probability distributions and performs computational-basis measurements according to the calculated probabilities.
* **Current Limitations**: It operates on temporary simple instruction schemas and currently only supports a small core set of gates. Matrix tensor scaling is limited to small simulation regimes standard for educational statevectors.
* **Strict Boundary**: We have explicitly avoided introducing external quantum SDKs such as Qiskit, PennyLane, Cirq, or qBraid in this milestone. The mathematical engine uses pure NumPy linear algebra.

## Setup & Dependencies
1. Create a virtual environment: `python -m venv venv`
2. Activate it: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Unix)
3. Install dependencies: `pip install -r requirements.txt` (Includes `numpy`).
4. Copy `.env.example` to `.env` and fill in any required variables.

## Running the Application
Use `uvicorn` to run the FastAPI application:
`uvicorn app.main:app --reload`

### Available Endpoints
* `GET /api/health`
* `POST /api/ai/chat`
* `POST /api/rag/query`
* `POST /api/simulation/run`

## Current Implementation Status

**IMPLEMENTED**
* FastAPI Application Foundation & Dependency Injection
* Core Configuration & Exception Handling
* Abstract Interfaces for LLM, Embeddings, Vector Store
* Custom Headless Quantum Simulation Engine (NumPy Statevector)

**SCAFFOLDED / PLACEHOLDER**
* AI Chat Endpoint (returns controlled unconfigured string)
* RAG Query Endpoint (returns controlled unconfigured string)

**NOT YET STARTED**
* Qiskit Integration / Advanced Gate Sets
* OpenQASM compilation & final Q-AST schema
* Real LLM logic and embedding models
* Learning/Recommendation System
* Frontend Development
