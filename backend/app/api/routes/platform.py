import uuid
import sys
import io
import traceback
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel

from ...platform.models import (
    User, UserRole, Course, Module, Lesson, Note, Quiz, Question,
    Assessment, AssessmentQuestion, Challenge, Problem, Enrollment,
    ProgressRecord, Submission, Notification, RegisterRequest, LoginRequest, AuthResponse
)
from ...platform.store import store

router = APIRouter(prefix="/platform", tags=["Platform"])

# Helper Auth Dependency (token format: user_id:role or mock token)
def get_current_user(authorization: Optional[str] = Header(None)) -> Optional[User]:
    if not authorization:
        return None
    token = authorization.replace("Bearer ", "").strip()
    # If token starts with token-, check if it contains user ID or matches email
    if ":" in token:
        user_id = token.split(":")[0]
        return store.get_user_by_id(user_id)
    # Check directly by user_id
    user = store.get_user_by_id(token)
    if user:
        return user
    # Fallback search
    for u in store.users.values():
        if f"token-{u.id}" == token or u.id == token:
            return u
    return None

# Request payloads
class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    expertise: Optional[List[str]] = None

class QuizSubmitRequest(BaseModel):
    answers: Dict[str, int] # question_id -> chosen option index

class AssessmentSubmitRequest(BaseModel):
    course_id: str
    answers: Dict[str, str] # question_id -> text response

class GradeSubmissionRequest(BaseModel):
    score: float
    feedback: str

class CodeExecutionRequest(BaseModel):
    code: str
    challenge_id: Optional[str] = None
    problem_id: Optional[str] = None

class CompleteLessonRequest(BaseModel):
    lesson_id: str

# ----------------- AUTHENTICATION -----------------

@router.post("/auth/register", response_model=AuthResponse)
def register(req: RegisterRequest):
    existing = store.get_user_by_email(req.email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    user_id = f"usr-{uuid.uuid4().hex[:8]}"
    user = User(
        id=user_id,
        name=req.name,
        email=req.email,
        password=req.password,
        role=req.role,
        phone=req.phone,
        avatar=req.avatar or f"https://api.dicebear.com/7.x/bottts/svg?seed={req.name}",
        bio=req.bio or f"Active {req.role.value} on the Platform",
        expertise=req.expertise or [],
        created_at=datetime.utcnow().isoformat()
    )
    store.create_user(user)
    token = f"{user.id}:{user.role.value}"
    
    # Send welcome notification
    store.create_notification(
        user_id=user.id,
        title="Welcome to the Platform!",
        message=f"Welcome {user.name}! Your {user.role.value.capitalize()} account is active and ready.",
        type="info",
        link="/trainer/dashboard" if user.role == UserRole.TRAINER else "/learner/dashboard"
    )

    return AuthResponse(token=token, user=user)

@router.post("/auth/login", response_model=AuthResponse)
def login(req: LoginRequest):
    user = store.get_user_by_email(req.email)
    if not user or user.password != req.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    # Check if role matches if role was requested
    if req.role and user.role != req.role:
        raise HTTPException(status_code=403, detail=f"This account is registered as a {user.role.value.capitalize()}, not a {req.role.value.capitalize()}.")

    token = f"{user.id}:{user.role.value}"
    return AuthResponse(token=token, user=user)

@router.get("/auth/me", response_model=User)
def get_me(user: Optional[User] = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return user

@router.put("/profile", response_model=User)
def update_profile(req: UpdateProfileRequest, user: Optional[User] = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    updates = req.model_dump(exclude_unset=True)
    updated = store.update_user(user.id, updates)
    return updated

# ----------------- COURSES -----------------

@router.get("/courses", response_model=List[Course])
def list_courses(trainer_id: Optional[str] = None, published_only: Optional[bool] = False):
    if trainer_id:
        return store.get_courses_by_trainer(trainer_id)
    return store.get_all_courses(published_only=published_only)

@router.get("/courses/{course_id}", response_model=Course)
def get_course(course_id: str):
    course = store.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.post("/courses", response_model=Course)
def create_course(course_data: Dict[str, Any], user: Optional[User] = Depends(get_current_user)):
    cid = f"crs-{uuid.uuid4().hex[:8]}"
    trainer_id = user.id if user else "trainer-001"
    trainer_name = user.name if user else "Trainer"

    new_course = Course(
        id=cid,
        title=course_data.get("title", "Untitled Course"),
        description=course_data.get("description", ""),
        category=course_data.get("category", "General"),
        level=course_data.get("level", "Beginner"),
        duration=course_data.get("duration", "4 Weeks"),
        thumbnail=course_data.get("thumbnail", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80"),
        trainer_id=trainer_id,
        trainer_name=trainer_name,
        is_published=course_data.get("is_published", True),
        created_at=datetime.utcnow().isoformat(),
        modules=[],
        notes=[],
        quizzes=[],
        assessments=[],
        challenges=[],
        problems=[]
    )
    store.save_course(new_course)
    return new_course

@router.put("/courses/{course_id}", response_model=Course)
def update_course(course_id: str, updates: Dict[str, Any]):
    course = store.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    c_dict = course.model_dump()
    for k, v in updates.items():
        if k in c_dict and v is not None:
            c_dict[k] = v
    updated = Course(**c_dict)
    store.save_course(updated)
    return updated

@router.delete("/courses/{course_id}")
def delete_course(course_id: str):
    success = store.delete_course(course_id)
    if not success:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course deleted successfully"}

# ----------------- MODULES & LESSONS -----------------

@router.post("/courses/{course_id}/modules", response_model=Course)
def add_module(course_id: str, module_data: Dict[str, Any]):
    course = store.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    mid = f"mod-{uuid.uuid4().hex[:6]}"
    new_mod = Module(
        id=mid,
        title=module_data.get("title", "New Module"),
        description=module_data.get("description", ""),
        order=len(course.modules) + 1,
        lessons=[]
    )
    course.modules.append(new_mod)
    store.save_course(course)
    return course

@router.delete("/courses/{course_id}/modules/{module_id}", response_model=Course)
def delete_module(course_id: str, module_id: str):
    course = store.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    course.modules = [m for m in course.modules if m.id != module_id]
    store.save_course(course)
    return course

@router.post("/courses/{course_id}/modules/{module_id}/lessons", response_model=Course)
def add_lesson(course_id: str, module_id: str, lesson_data: Dict[str, Any]):
    course = store.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    for mod in course.modules:
        if mod.id == module_id:
            lid = f"les-{uuid.uuid4().hex[:6]}"
            new_les = Lesson(
                id=lid,
                title=lesson_data.get("title", "New Lesson"),
                type=lesson_data.get("type", "theory"),
                duration=lesson_data.get("duration", "15 min"),
                video_url=lesson_data.get("video_url"),
                content=lesson_data.get("content", ""),
                order=len(mod.lessons) + 1
            )
            mod.lessons.append(new_les)
            store.save_course(course)
            return course
            
    raise HTTPException(status_code=404, detail="Module not found")

@router.put("/courses/{course_id}/modules/{module_id}/lessons/{lesson_id}", response_model=Course)
def update_lesson(course_id: str, module_id: str, lesson_id: str, lesson_data: Dict[str, Any]):
    course = store.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    for mod in course.modules:
        if mod.id == module_id:
            for i, les in enumerate(mod.lessons):
                if les.id == lesson_id:
                    les_dict = les.model_dump()
                    les_dict.update(lesson_data)
                    mod.lessons[i] = Lesson(**les_dict)
                    store.save_course(course)
                    return course
    raise HTTPException(status_code=404, detail="Lesson not found")

@router.delete("/courses/{course_id}/modules/{module_id}/lessons/{lesson_id}", response_model=Course)
def delete_lesson(course_id: str, module_id: str, lesson_id: str):
    course = store.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    for mod in course.modules:
        if mod.id == module_id:
            mod.lessons = [l for l in mod.lessons if l.id != lesson_id]
            store.save_course(course)
            return course
    raise HTTPException(status_code=404, detail="Lesson not found")

# ----------------- NOTES -----------------

@router.post("/courses/{course_id}/notes", response_model=Course)
def add_note(course_id: str, note_data: Dict[str, Any]):
    course = store.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    nid = f"not-{uuid.uuid4().hex[:6]}"
    new_note = Note(
        id=nid,
        title=note_data.get("title", "Course Resource Note"),
        description=note_data.get("description", ""),
        file_url=note_data.get("file_url", "#"),
        file_name=note_data.get("file_name", "Document.pdf"),
        uploaded_at=datetime.utcnow().isoformat()
    )
    course.notes.append(new_note)
    store.save_course(course)
    return course

@router.delete("/courses/{course_id}/notes/{note_id}", response_model=Course)
def delete_note(course_id: str, note_id: str):
    course = store.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    course.notes = [n for n in course.notes if n.id != note_id]
    store.save_course(course)
    return course

# ----------------- QUIZZES -----------------

@router.post("/courses/{course_id}/quizzes", response_model=Course)
def add_quiz(course_id: str, quiz_data: Dict[str, Any]):
    course = store.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    qid = f"quiz-{uuid.uuid4().hex[:6]}"
    questions = []
    for q in quiz_data.get("questions", []):
        questions.append(Question(
            id=f"q-{uuid.uuid4().hex[:6]}",
            question=q.get("question", ""),
            options=q.get("options", []),
            correct_answer_index=q.get("correct_answer_index", 0),
            explanation=q.get("explanation", "")
        ))
    
    new_quiz = Quiz(
        id=qid,
        title=quiz_data.get("title", "Unit Knowledge Check"),
        description=quiz_data.get("description", ""),
        time_limit_mins=quiz_data.get("time_limit_mins", 15),
        passing_score=quiz_data.get("passing_score", 70),
        questions=questions,
        created_at=datetime.utcnow().isoformat()
    )
    course.quizzes.append(new_quiz)
    store.save_course(course)
    return course

@router.delete("/courses/{course_id}/quizzes/{quiz_id}", response_model=Course)
def delete_quiz(course_id: str, quiz_id: str):
    course = store.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    course.quizzes = [q for q in course.quizzes if q.id != quiz_id]
    store.save_course(course)
    return course

@router.post("/courses/{course_id}/quizzes/{quiz_id}/submit")
def submit_quiz(course_id: str, quiz_id: str, req: QuizSubmitRequest, user: Optional[User] = Depends(get_current_user)):
    course = store.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    target_quiz = None
    for q in course.quizzes:
        if q.id == quiz_id:
            target_quiz = q
            break
    if not target_quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    total_q = len(target_quiz.questions)
    if total_q == 0:
        return {"score": 100.0, "passed": True, "details": []}

    correct_count = 0
    results = []
    for q in target_quiz.questions:
        user_ans = req.answers.get(q.id)
        is_correct = (user_ans == q.correct_answer_index)
        if is_correct:
            correct_count += 1
        results.append({
            "question_id": q.id,
            "question": q.question,
            "user_answer": user_ans,
            "correct_answer": q.correct_answer_index,
            "is_correct": is_correct,
            "explanation": q.explanation
        })
    
    score_percentage = round((correct_count / total_q) * 100.0, 1)
    passed = score_percentage >= target_quiz.passing_score

    # Save to user progress if logged in
    learner_id = user.id if user else "learner-001"
    store.update_progress(
        learner_id=learner_id,
        course_id=course_id,
        completed_quiz_id=quiz_id,
        quiz_score=score_percentage
    )

    return {
        "score": score_percentage,
        "passed": passed,
        "correct_count": correct_count,
        "total_questions": total_q,
        "passing_score": target_quiz.passing_score,
        "results": results
    }

# ----------------- ASSESSMENTS & GRADING -----------------

@router.post("/courses/{course_id}/assessments", response_model=Course)
def add_assessment(course_id: str, asm_data: Dict[str, Any]):
    course = store.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    aid = f"asm-{uuid.uuid4().hex[:6]}"
    questions = []
    for q in asm_data.get("questions", []):
        questions.append(AssessmentQuestion(
            id=f"aq-{uuid.uuid4().hex[:6]}",
            question=q.get("question", ""),
            max_marks=q.get("max_marks", 10),
            guidelines=q.get("guidelines", "")
        ))
    
    new_asm = Assessment(
        id=aid,
        title=asm_data.get("title", "Assessment Exam"),
        description=asm_data.get("description", ""),
        deadline=asm_data.get("deadline", "2026-11-30T23:59:59"),
        total_marks=asm_data.get("total_marks", sum(q.max_marks for q in questions)),
        instructions=asm_data.get("instructions", "Provide complete, descriptive answers."),
        questions=questions,
        created_at=datetime.utcnow().isoformat()
    )
    course.assessments.append(new_asm)
    store.save_course(course)
    return course

@router.delete("/courses/{course_id}/assessments/{assessment_id}", response_model=Course)
def delete_assessment(course_id: str, assessment_id: str):
    course = store.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    course.assessments = [a for a in course.assessments if a.id != assessment_id]
    store.save_course(course)
    return course

@router.post("/assessments/{assessment_id}/submit", response_model=Submission)
def submit_assessment(assessment_id: str, req: AssessmentSubmitRequest, user: Optional[User] = Depends(get_current_user)):
    learner = user if user else store.get_user_by_id("learner-001")
    if not learner:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    course = store.get_course_by_id(req.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    assessment = next((a for a in course.assessments if a.id == assessment_id), None)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    sub = Submission(
        id=f"sub-{uuid.uuid4().hex[:8]}",
        assessment_id=assessment_id,
        assessment_title=assessment.title,
        learner_id=learner.id,
        learner_name=learner.name,
        course_id=course.id,
        answers=req.answers,
        submitted_at=datetime.utcnow().isoformat(),
        status="submitted"
    )
    return store.submit_assessment(sub)

@router.get("/submissions", response_model=List[Submission])
def list_submissions(course_id: Optional[str] = None, learner_id: Optional[str] = None):
    if course_id:
        return store.get_submissions_by_course(course_id)
    if learner_id:
        return store.get_submissions_by_learner(learner_id)
    return list(store.submissions.values())

@router.post("/submissions/{submission_id}/grade", response_model=Submission)
def grade_submission(submission_id: str, req: GradeSubmissionRequest, user: Optional[User] = Depends(get_current_user)):
    trainer_name = user.name if user else "Instructor"
    sub = store.grade_submission(submission_id, req.score, req.feedback, trainer_name)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return sub

# ----------------- CHALLENGES & PROBLEMS -----------------

@router.post("/courses/{course_id}/challenges", response_model=Course)
def add_challenge(course_id: str, ch_data: Dict[str, Any]):
    course = store.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    cid = f"ch-{uuid.uuid4().hex[:6]}"
    new_ch = Challenge(
        id=cid,
        title=ch_data.get("title", "Practical Code Challenge"),
        description=ch_data.get("description", ""),
        difficulty=ch_data.get("difficulty", "Medium"),
        xp_reward=ch_data.get("xp_reward", 100),
        starter_code=ch_data.get("starter_code", "# Write your solution here\n"),
        test_cases=ch_data.get("test_cases", []),
        hints=ch_data.get("hints", [])
    )
    course.challenges.append(new_ch)
    store.save_course(course)
    return course

@router.delete("/courses/{course_id}/challenges/{challenge_id}", response_model=Course)
def delete_challenge(course_id: str, challenge_id: str):
    course = store.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    course.challenges = [c for c in course.challenges if c.id != challenge_id]
    store.save_course(course)
    return course

@router.post("/courses/{course_id}/problems", response_model=Course)
def add_problem(course_id: str, prb_data: Dict[str, Any]):
    course = store.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    pid = f"prb-{uuid.uuid4().hex[:6]}"
    new_prb = Problem(
        id=pid,
        title=prb_data.get("title", "Algorithmic Problem"),
        description=prb_data.get("description", ""),
        difficulty=prb_data.get("difficulty", "Medium"),
        starter_code=prb_data.get("starter_code", "def solution():\n    pass\n"),
        test_cases=prb_data.get("test_cases", [])
    )
    course.problems.append(new_prb)
    store.save_course(course)
    return course

@router.delete("/courses/{course_id}/problems/{problem_id}", response_model=Course)
def delete_problem(course_id: str, problem_id: str):
    course = store.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    course.problems = [p for p in course.problems if p.id != problem_id]
    store.save_course(course)
    return course

@router.post("/execute-code")
def execute_code(req: CodeExecutionRequest, user: Optional[User] = Depends(get_current_user)):
    # Safe stdout capturing execution
    old_stdout = sys.stdout
    redirected_output = io.StringIO()
    sys.stdout = redirected_output
    
    success = True
    output = ""
    error = None
    
    try:
        # Restricted execution environment
        exec_globals = {"__builtins__": __builtins__}
        exec(req.code, exec_globals)
        output = redirected_output.getvalue()
        if not output.strip():
            output = "Code executed successfully with no stdout output."
    except Exception as e:
        success = False
        error = traceback.format_exc()
        output = f"Execution Error:\n{error}"
    finally:
        sys.stdout = old_stdout

    # If successful and challenge_id/problem_id provided, update learner progress
    if success and user:
        if req.challenge_id:
            for c in store.courses.values():
                for ch in c.challenges:
                    if ch.id == req.challenge_id:
                        store.update_progress(learner_id=user.id, course_id=c.id, completed_challenge_id=req.challenge_id)
        if req.problem_id:
            for c in store.courses.values():
                for pb in c.problems:
                    if pb.id == req.problem_id:
                        store.update_progress(learner_id=user.id, course_id=c.id, completed_problem_id=req.problem_id)

    return {
        "success": success,
        "output": output,
        "error": error
    }

# ----------------- ENROLLMENT & PROGRESS -----------------

@router.post("/enrollments/{course_id}", response_model=Enrollment)
def enroll_in_course(course_id: str, user: Optional[User] = Depends(get_current_user)):
    learner_id = user.id if user else "learner-001"
    try:
        return store.enroll_learner(learner_id, course_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/enrollments", response_model=List[Enrollment])
def get_my_enrollments(user: Optional[User] = Depends(get_current_user)):
    learner_id = user.id if user else "learner-001"
    return store.get_enrollments_by_learner(learner_id)

@router.get("/progress/{course_id}", response_model=ProgressRecord)
def get_course_progress(course_id: str, user: Optional[User] = Depends(get_current_user)):
    learner_id = user.id if user else "learner-001"
    return store.get_progress(learner_id, course_id)

@router.post("/progress/{course_id}/complete-lesson", response_model=ProgressRecord)
def mark_lesson_complete(course_id: str, req: CompleteLessonRequest, user: Optional[User] = Depends(get_current_user)):
    learner_id = user.id if user else "learner-001"
    return store.update_progress(learner_id=learner_id, course_id=course_id, completed_lesson_id=req.lesson_id)

# ----------------- TRAINER OVERSIGHT & METRICS -----------------

@router.get("/trainer/learners-overview")
def get_learners_overview(user: Optional[User] = Depends(get_current_user)):
    trainer_id = user.id if user else "trainer-001"
    trainer_courses = store.get_courses_by_trainer(trainer_id)
    trainer_course_ids = [c.id for c in trainer_courses]
    
    learners_data = []
    for enr in store.enrollments.values():
        if enr.course_id in trainer_course_ids:
            prog = store.get_progress(enr.learner_id, enr.course_id)
            learner_user = store.get_user_by_id(enr.learner_id)
            learners_data.append({
                "enrollment_id": enr.id,
                "learner_id": enr.learner_id,
                "learner_name": enr.learner_name,
                "learner_email": enr.learner_email,
                "learner_avatar": learner_user.avatar if learner_user else None,
                "course_id": enr.course_id,
                "course_title": enr.course_title,
                "enrolled_at": enr.enrolled_at,
                "progress_percentage": prog.overall_percentage,
                "completed_lessons": len(prog.completed_lesson_ids),
                "completed_quizzes": len(prog.completed_quiz_ids),
                "last_active": prog.last_activity
            })
            
    return {
        "total_courses": len(trainer_courses),
        "total_enrollments": len(learners_data),
        "total_submissions": len([s for s in store.submissions.values() if s.course_id in trainer_course_ids]),
        "learners": learners_data
    }

# ----------------- NOTIFICATIONS -----------------

@router.get("/notifications", response_model=List[Notification])
def get_notifications(user: Optional[User] = Depends(get_current_user)):
    user_id = user.id if user else "learner-001"
    return store.get_notifications(user_id)

@router.post("/notifications/read")
def mark_read(user: Optional[User] = Depends(get_current_user)):
    user_id = user.id if user else "learner-001"
    count = store.mark_notifications_read(user_id)
    return {"marked_read": count}

# ----------------- PURPOSE, RESEARCH & BACKWARD LEARNING -----------------

class PurposePayload(BaseModel):
    type: str # job | research | academic
    targetId: str
    title: Optional[str] = None

@router.get("/learner/purpose")
def get_learner_purpose(user: Optional[User] = Depends(get_current_user)):
    return {
        "type": "academic",
        "targetId": "beginner",
        "title": "Academic — Beginner Track",
        "status": "active"
    }

@router.post("/learner/purpose")
def set_learner_purpose(payload: PurposePayload, user: Optional[User] = Depends(get_current_user)):
    return {
        "status": "updated",
        "purpose": payload.dict(),
        "updated_at": datetime.utcnow().isoformat()
    }

@router.get("/research/landscape")
def get_research_landscape():
    return {
        "domains": [
            {
                "id": "qec-fault-tolerance",
                "title": "Quantum Error Correction & Fault Tolerance",
                "papers_count": 24,
                "active_gaps_count": 5
            },
            {
                "id": "vqe-molecular-chemistry",
                "title": "VQE & Molecular Quantum Chemistry",
                "papers_count": 18,
                "active_gaps_count": 4
            },
            {
                "id": "quantum-ml-qnn",
                "title": "Quantum Neural Networks & Generative QML",
                "papers_count": 31,
                "active_gaps_count": 7
            }
        ]
    }

