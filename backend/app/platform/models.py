from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class UserRole(str, Enum):
    TRAINER = "trainer"
    LEARNER = "learner"

class User(BaseModel):
    id: str
    name: str
    email: str
    password: str
    role: UserRole
    phone: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    expertise: Optional[List[str]] = Field(default_factory=list)
    created_at: str

class Lesson(BaseModel):
    id: str
    title: str
    type: str  # "theory" | "video"
    duration: str = "15 min"
    video_url: Optional[str] = None
    content: Optional[str] = None
    order: int = 1

class Module(BaseModel):
    id: str
    title: str
    description: Optional[str] = ""
    order: int = 1
    lessons: List[Lesson] = Field(default_factory=list)

class Note(BaseModel):
    id: str
    title: str
    description: Optional[str] = ""
    file_url: str = "#"
    file_name: str = "Document.pdf"
    uploaded_at: str

class Question(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_answer_index: int
    explanation: Optional[str] = ""

class Quiz(BaseModel):
    id: str
    title: str
    description: Optional[str] = ""
    time_limit_mins: int = 15
    passing_score: float = 70.0
    questions: List[Question] = Field(default_factory=list)
    created_at: str

class AssessmentQuestion(BaseModel):
    id: str
    question: str
    max_marks: float = 10.0
    guidelines: Optional[str] = ""

class Assessment(BaseModel):
    id: str
    title: str
    description: Optional[str] = ""
    deadline: Optional[str] = None
    total_marks: float = 100.0
    instructions: Optional[str] = ""
    questions: List[AssessmentQuestion] = Field(default_factory=list)
    created_at: str

class Challenge(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str = "Intermediate"  # Beginner, Intermediate, Advanced
    xp_reward: int = 100
    starter_code: str = ""
    test_cases: List[Dict[str, Any]] = Field(default_factory=list)
    hints: List[str] = Field(default_factory=list)

class Problem(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str = "Medium"
    starter_code: str = ""
    test_cases: List[Dict[str, Any]] = Field(default_factory=list)

class Course(BaseModel):
    id: str
    title: str
    description: str
    category: str = "General"
    level: str = "Beginner"
    duration: str = "4 Weeks"
    thumbnail: str = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600"
    trainer_id: str
    trainer_name: str
    is_published: bool = True
    created_at: str
    modules: List[Module] = Field(default_factory=list)
    notes: List[Note] = Field(default_factory=list)
    quizzes: List[Quiz] = Field(default_factory=list)
    assessments: List[Assessment] = Field(default_factory=list)
    challenges: List[Challenge] = Field(default_factory=list)
    problems: List[Problem] = Field(default_factory=list)

class Enrollment(BaseModel):
    id: str
    learner_id: str
    learner_name: str
    learner_email: str
    course_id: str
    course_title: str
    enrolled_at: str
    status: str = "active"

class ProgressRecord(BaseModel):
    id: str
    learner_id: str
    course_id: str
    completed_lesson_ids: List[str] = Field(default_factory=list)
    completed_quiz_ids: List[str] = Field(default_factory=list)
    completed_assessment_ids: List[str] = Field(default_factory=list)
    completed_challenge_ids: List[str] = Field(default_factory=list)
    completed_problem_ids: List[str] = Field(default_factory=list)
    quiz_scores: Dict[str, float] = Field(default_factory=dict)
    assessment_scores: Dict[str, float] = Field(default_factory=dict)
    overall_percentage: float = 0.0
    last_activity: str

class Submission(BaseModel):
    id: str
    assessment_id: str
    assessment_title: str
    learner_id: str
    learner_name: str
    course_id: str
    answers: Dict[str, str]  # question_id -> answer text
    score: Optional[float] = None
    feedback: Optional[str] = None
    graded_by: Optional[str] = None
    graded_at: Optional[str] = None
    submitted_at: str
    status: str = "submitted"  # "submitted" | "graded"

class Notification(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str = "info"  # "info", "success", "warning", "danger"
    link: Optional[str] = None
    is_read: bool = False
    created_at: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: UserRole
    phone: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    expertise: Optional[List[str]] = None

class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[UserRole] = None

class AuthResponse(BaseModel):
    token: str
    user: User
