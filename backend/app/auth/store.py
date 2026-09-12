"""
Student Store and Session Management.
Persists student accounts and learning progress cleanly.
"""
import os
import json
import uuid
import hashlib
import time
from typing import Dict, Optional
from app.auth.models import (
    StudentRecord, StudentProfile, StudentProgress,
    SavedCircuit, QuizResult, ChallengeAttempt
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")
STUDENTS_FILE = os.path.join(DATA_DIR, "students.json")


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


class StudentStore:
    def __init__(self, storage_file: str = STUDENTS_FILE):
        self.storage_file = storage_file
        self.students: Dict[str, StudentRecord] = {}
        self.sessions: Dict[str, str] = {}  # token -> student_id
        self._load()

    def _load(self):
        if not os.path.exists(self.storage_file):
            # Create default demo student account if empty
            demo_profile = StudentProfile(
                student_id="student_demo_1",
                username="demo_student",
                email="student@quantum.edu",
                full_name="Quantum Student",
                level="Beginner"
            )
            demo_record = StudentRecord(
                profile=demo_profile,
                password_hash=_hash_password("quantum123"),
                progress=StudentProgress(
                    completed_lessons=["intro_qubits", "single_qubit_gates"],
                    strong_concepts=["Superposition", "Hadamard"],
                    weak_concepts=["Phase Estimation"],
                    experiments_count=3,
                    backend_usage={"custom_m1": 12, "qiskit_aer": 5}
                )
            )
            self.students[demo_profile.student_id] = demo_record
            self._save()
            return

        try:
            with open(self.storage_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                for sid, sdata in data.items():
                    self.students[sid] = StudentRecord.model_validate(sdata)
        except Exception:
            self.students = {}

    def _save(self):
        os.makedirs(os.path.dirname(self.storage_file), exist_ok=True)
        data = {sid: rec.model_dump() for sid, rec in self.students.items()}
        with open(self.storage_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def create_student(self, username: str, email: str, password: str, full_name: Optional[str] = None, level: str = "Beginner") -> StudentRecord:
        for rec in self.students.values():
            if rec.profile.username.lower() == username.lower():
                raise ValueError("username_exists: Username already taken.")
            if rec.profile.email.lower() == email.lower():
                raise ValueError("email_exists: Email already registered.")

        student_id = f"student_{uuid.uuid4().hex[:8]}"
        profile = StudentProfile(
            student_id=student_id,
            username=username,
            email=email,
            full_name=full_name,
            level=level
        )
        record = StudentRecord(
            profile=profile,
            password_hash=_hash_password(password),
            progress=StudentProgress()
        )
        self.students[student_id] = record
        self._save()
        return record

    def authenticate(self, username: str, password: str) -> Optional[StudentRecord]:
        p_hash = _hash_password(password)
        for rec in self.students.values():
            if rec.profile.username.lower() == username.lower() and rec.password_hash == p_hash:
                return rec
        return None

    def create_session(self, student_id: str) -> str:
        token = f"qtok_{uuid.uuid4().hex}"
        self.sessions[token] = student_id
        return token

    def get_student_by_token(self, token: str) -> Optional[StudentRecord]:
        student_id = self.sessions.get(token)
        if not student_id:
            return None
        return self.students.get(student_id)

    def logout(self, token: str):
        if token in self.sessions:
            del self.sessions[token]

    def save_circuit(self, student_id: str, circuit: SavedCircuit) -> StudentProgress:
        rec = self.students.get(student_id)
        if not rec:
            raise ValueError("Student not found")
        # Prepend to saved_circuits
        rec.progress.saved_circuits = [c for c in rec.progress.saved_circuits if c.circuit_id != circuit.circuit_id]
        rec.progress.saved_circuits.insert(0, circuit)
        self._save()
        return rec.progress

    def update_profile(self, student_id: str, level: Optional[str] = None, full_name: Optional[str] = None) -> StudentProfile:
        rec = self.students.get(student_id)
        if not rec:
            raise ValueError("Student not found")
        if level:
            rec.profile.level = level.capitalize()
        if full_name is not None:
            rec.profile.full_name = full_name
        self._save()
        return rec.profile

    def update_progress(self, student_id: str, lesson_id: Optional[str] = None, backend: Optional[str] = None) -> StudentProgress:
        rec = self.students.get(student_id)
        if not rec:
            raise ValueError("Student not found")
        if lesson_id and lesson_id not in rec.progress.completed_lessons:
            rec.progress.completed_lessons.append(lesson_id)
        if backend:
            rec.progress.backend_usage[backend] = rec.progress.backend_usage.get(backend, 0) + 1
            rec.progress.experiments_count += 1
        self._save()
        return rec.progress


student_store = StudentStore()
