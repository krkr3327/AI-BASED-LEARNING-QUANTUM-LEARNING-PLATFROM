from fastapi import APIRouter
from app.api.routes import health, ai, rag, simulation, learning, algorithms, backends, experiments, auth, platform

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(rag.router, prefix="/rag", tags=["rag"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["simulation"])
api_router.include_router(experiments.router, prefix="/simulation", tags=["experiments"])
api_router.include_router(learning.router, prefix="/learning", tags=["learning"])
api_router.include_router(algorithms.router, prefix="/algorithms", tags=["algorithms"])
api_router.include_router(backends.router, prefix="/backends", tags=["backends"])
api_router.include_router(auth.router)
api_router.include_router(platform.router)



