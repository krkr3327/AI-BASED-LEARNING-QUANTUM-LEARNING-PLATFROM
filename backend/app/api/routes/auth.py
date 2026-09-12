"""
Auth and Student Personalization Router.
"""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Header
from app.auth.models import (
    SignupRequest, LoginRequest, AuthResponse,
    StudentProfile, StudentProgress, SavedCircuit
)
from app.auth.store import student_store
from app.learning.store import learning_store

router = APIRouter(prefix="/auth", tags=["auth"])


def _get_current_student(authorization: Optional[str] = Header(None)):
    if not authorization:
        # Fallback to demo account for non-authenticated sessions
        return student_store.students.get("student_demo_1")
    token = authorization.replace("Bearer ", "").strip()
    student = student_store.get_student_by_token(token)
    if not student:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")
    return student


@router.post("/signup", response_model=AuthResponse)
def signup(req: SignupRequest):
    try:
        user_level = req.level or "Beginner"
        record = student_store.create_student(
            username=req.username,
            email=req.email,
            password=req.password,
            full_name=req.full_name,
            level=user_level
        )
        token = student_store.create_session(record.profile.student_id)
        learning_store.set_selected_difficulty(user_level)
        return AuthResponse(token=token, profile=record.profile, progress=record.progress)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    record = student_store.authenticate(req.username, req.password)
    if not record:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = student_store.create_session(record.profile.student_id)
    if record.profile.level:
        learning_store.set_selected_difficulty(record.profile.level)
    return AuthResponse(token=token, profile=record.profile, progress=record.progress)


@router.post("/logout")
def logout(authorization: Optional[str] = Header(None)):
    if authorization:
        token = authorization.replace("Bearer ", "").strip()
        student_store.logout(token)
    return {"status": "success", "message": "Logged out successfully"}


@router.get("/me")
def get_current_profile(authorization: Optional[str] = Header(None)):
    record = _get_current_student(authorization)
    if not record:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if record.profile.level:
        learning_store.set_selected_difficulty(record.profile.level)
    return {
        "profile": record.profile,
        "progress": record.progress
    }


@router.patch("/profile")
def update_profile(payload: Dict[str, Any], authorization: Optional[str] = Header(None)):
    record = _get_current_student(authorization)
    if not record:
        raise HTTPException(status_code=401, detail="Not authenticated")
    level = payload.get("level")
    full_name = payload.get("full_name")
    updated_profile = student_store.update_profile(record.profile.student_id, level=level, full_name=full_name)
    if level:
        learning_store.set_selected_difficulty(level)
    return {"status": "success", "profile": updated_profile}


@router.post("/saved_circuits", response_model=StudentProgress)
def save_circuit(circuit: SavedCircuit, authorization: Optional[str] = Header(None)):
    record = _get_current_student(authorization)
    if not record:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return student_store.save_circuit(record.profile.student_id, circuit)


@router.get("/saved_circuits", response_model=List[SavedCircuit])
def get_saved_circuits(authorization: Optional[str] = Header(None)):
    record = _get_current_student(authorization)
    if not record:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return record.progress.saved_circuits
