"""
Student Account and Personalization Models.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import time


class StudentProfile(BaseModel):
    student_id: str
    username: str
    email: str
    full_name: Optional[str] = None
    level: str = "Beginner"  # Beginner, Intermediate, Advanced
    created_at: float = Field(default_factory=time.time)


class SavedCircuit(BaseModel):
    circuit_id: str
    title: str
    description: Optional[str] = None
    num_qubits: int
    qast: Dict[str, Any]
    code: Optional[str] = None
    created_at: float = Field(default_factory=time.time)


class QuizResult(BaseModel):
    quiz_id: str
    score: float
    passed: bool
    completed_at: float = Field(default_factory=time.time)


class ChallengeAttempt(BaseModel):
    challenge_id: str
    passed: bool
    attempts: int = 1
    completed_at: float = Field(default_factory=time.time)


class StudentProgress(BaseModel):
    completed_lessons: List[str] = Field(default_factory=list)
    quiz_results: List[QuizResult] = Field(default_factory=list)
    challenge_attempts: List[ChallengeAttempt] = Field(default_factory=list)
    saved_circuits: List[SavedCircuit] = Field(default_factory=list)
    experiments_count: int = 0
    backend_usage: Dict[str, int] = Field(default_factory=dict)
    weak_concepts: List[str] = Field(default_factory=list)
    strong_concepts: List[str] = Field(default_factory=list)


class StudentRecord(BaseModel):
    profile: StudentProfile
    password_hash: str
    progress: StudentProgress = Field(default_factory=StudentProgress)


class LoginRequest(BaseModel):
    username: str
    password: str


class SignupRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None
    level: Optional[str] = "Beginner"


class AuthResponse(BaseModel):
    token: str
    profile: StudentProfile
    progress: StudentProgress
