from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union

class LearningObjective(BaseModel):
    id: str
    description: str

class ExerciseOption(BaseModel):
    id: int
    text: str

class Activity(BaseModel):
    id: str
    title: str
    type: str  # "READ" | "CONCEPT_EXPLANATION" | "CIRCUIT_BUILD" | "SIMULATION" | "PREDICTION" | "QUIZ" | "CHALLENGE" | "EXPERIMENT" | "REFLECTION"
    content: Optional[str] = None
    completion_condition: Dict[str, Any] = Field(default_factory=dict)
    completed: bool = False

class Exercise(BaseModel):
    id: str
    concept_id: str
    type: str  # "multiple_choice" | "numeric" | "circuit_challenge"
    difficulty: str  # "Beginner" | "Intermediate" | "Advanced"
    question: str
    options: Optional[List[str]] = None
    explanation: str
    hint: Optional[str] = None
    target_behavior: Optional[Dict[str, Any]] = None  # for circuit challenges
    preset_gates: Optional[List[Dict[str, Any]]] = None

class Question(BaseModel):
    id: str
    question: str
    options: List[str]
    explanation: str
    learning_objective_id: Optional[str] = None

class AssessmentQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    explanation: str

class Assessment(BaseModel):
    id: str
    title: str
    description: str
    questions: List[AssessmentQuestion]

class LessonSection(BaseModel):
    title: str
    type: str  # "concept" | "intuition" | "math" | "example"
    content: str
    latex_math: Optional[str] = None

class Lesson(BaseModel):
    id: str
    module_id: str
    title: str
    description: str
    difficulty: str
    time_minutes: int
    prerequisites: List[str] = Field(default_factory=list)
    objectives: List[str] = Field(default_factory=list)
    sections: List[LessonSection] = Field(default_factory=list)
    takeaway: str
    preset_circuit: Optional[List[Dict[str, Any]]] = None
    exercises: List[Exercise] = Field(default_factory=list)
    activities: List[Activity] = Field(default_factory=list)
    assessment: Optional[Assessment] = None

class Topic(BaseModel):
    id: str
    title: str
    description: str
    level: int
    prerequisites: List[str] = Field(default_factory=list)
    lessons: List[Lesson] = Field(default_factory=list)

class Course(BaseModel):
    id: str
    title: str
    description: str
    level: str  # "LEVEL_1" to "LEVEL_7"
    order: int
    topics: List[Topic] = Field(default_factory=list)
    lessons: List[Lesson] = Field(default_factory=list)

class ExerciseSubmission(BaseModel):
    exercise_id: Optional[str] = None
    answer: Union[int, float, str, Dict[str, Any]]

class ChallengeSubmission(BaseModel):
    challenge_id: Optional[str] = None
    num_qubits: Optional[int] = 2
    operations: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    qast: Optional[Dict[str, Any]] = None

class SubmissionResult(BaseModel):
    exercise_id: str
    passed: bool
    score: float
    feedback: str
    explanation: str
    empirical_metrics: Optional[Dict[str, Any]] = None

class AssessmentSubmission(BaseModel):
    assessment_id: Optional[str] = None
    answers: Dict[str, int]  # question_id -> selected option index

class AssessmentResult(BaseModel):
    assessment_id: str
    score: float
    total_questions: int
    correct_count: int
    passed: bool
    explanation_map: Dict[str, str]

class ProgressRecord(BaseModel):
    lesson_id: str
    status: str  # "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "MASTERED"
    completed_at: Optional[float] = None
    score: Optional[float] = None

class MasteryRecord(BaseModel):
    concept_id: str
    concept_name: str
    status: str  # "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "MASTERED"
    mastery_score: float  # 0.0 to 1.0
    evidence_count: int
    attempts_count: int
    last_evaluated_at: Optional[float] = None

class ConceptMastery(BaseModel):
    concept_id: str
    concept_name: str
    status: str  # "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "MASTERED"
    mastery_score: float  # 0.0 to 1.0
    evidence_count: int
    attempts_count: int
    last_evaluated_at: Optional[float] = None

class LearnerProgress(BaseModel):
    learner_id: str = "default_learner"
    completed_lessons: List[str] = Field(default_factory=list)
    exercise_attempts: List[Dict[str, Any]] = Field(default_factory=list)
    assessment_attempts: List[Dict[str, Any]] = Field(default_factory=list)
    concept_mastery: Dict[str, ConceptMastery] = Field(default_factory=dict)
    last_active_lesson: Optional[str] = None
    hints_requested_count: int = 0
    mistakes_count: int = 0
    # Gamification: XP, Streaks & Achievements
    xp: int = 450
    streak_days: int = 3
    last_active_date: Optional[str] = None
    level: int = 2
    level_title: str = "Qubit Apprentice"
    badges: List[str] = Field(default_factory=lambda: ["FIRST_QUBIT", "SUPERPOSITION_EXPLORER"])
    today_xp: int = 150
    daily_goal_xp: int = 200

class HintRequest(BaseModel):
    lesson_id: str
    challenge_id: Optional[str] = None
    hint_level: int = 1  # 1 to 4

class HintResponse(BaseModel):
    lesson_id: str
    challenge_id: Optional[str] = None
    hint_level: int
    title: str
    content: str
    next_level_available: bool

class Recommendation(BaseModel):
    recommendation_type: str  # REVIEW_TOPIC, RETRY_LESSON, PRACTICE_CHALLENGE, TAKE_ASSESSMENT, ADVANCE_TOPIC, INCREASE_DIFFICULTY
    target_id: str
    title: str
    reason: str
    difficulty: str = "Beginner"
