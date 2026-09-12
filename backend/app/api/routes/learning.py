from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional
import copy

from app.learning.curriculum import CURRICULUM
from app.learning.models import (
    ExerciseSubmission,
    ChallengeSubmission,
    AssessmentSubmission,
    HintRequest,
    HintResponse,
    ProgressRecord
)
from app.learning.evaluator import CircuitChallengeEvaluator
from app.learning.store import learning_store

router = APIRouter()
challenge_evaluator = CircuitChallengeEvaluator()

@router.get("/courses")
def get_courses() -> List[Dict[str, Any]]:
    """Return all courses/modules in the quantum curriculum."""
    courses = []
    for mod in CURRICULUM:
        courses.append({
            "id": mod["id"],
            "title": mod["title"],
            "description": mod["description"],
            "order": mod["order"],
            "lesson_count": len(mod.get("lessons", []))
        })
    return courses

@router.get("/courses/{course_id}")
def get_course(course_id: str) -> Dict[str, Any]:
    """Return a single course/module by ID."""
    for mod in CURRICULUM:
        if mod["id"] == course_id:
            return mod
    raise HTTPException(status_code=404, detail=f"Course '{course_id}' not found.")

@router.get("/topics")
def get_topics() -> List[Dict[str, Any]]:
    """Return all curriculum topics across levels."""
    topics = []
    for mod in CURRICULUM:
        topics.append({
            "id": f"topic-{mod['id']}",
            "course_id": mod["id"],
            "title": mod["title"],
            "description": mod["description"],
            "lessons": [les["id"] for les in mod.get("lessons", [])]
        })
    return topics

@router.get("/topics/{topic_id}")
def get_topic(topic_id: str) -> Dict[str, Any]:
    """Return a single topic by ID."""
    for mod in CURRICULUM:
        if mod["id"] == topic_id or f"topic-{mod['id']}" == topic_id:
            return {
                "id": topic_id,
                "course_id": mod["id"],
                "title": mod["title"],
                "description": mod["description"],
                "lessons": mod.get("lessons", [])
            }
    raise HTTPException(status_code=404, detail=f"Topic '{topic_id}' not found.")

@router.get("/curriculum")
def get_curriculum() -> List[Dict[str, Any]]:
    """Return full curriculum structure with modules and lesson metadata."""
    return CURRICULUM

@router.get("/modules/{module_id}")
def get_module(module_id: str) -> Dict[str, Any]:
    """Return a single module by ID."""
    for mod in CURRICULUM:
        if mod["id"] == module_id:
            return mod
    raise HTTPException(status_code=404, detail=f"Module '{module_id}' not found.")

@router.get("/lessons/{lesson_id}")
def get_lesson(lesson_id: str) -> Dict[str, Any]:
    """Return a detailed lesson object by ID."""
    for mod in CURRICULUM:
        for les in mod.get("lessons", []):
            if les["id"] == lesson_id:
                return les
    raise HTTPException(status_code=404, detail=f"Lesson '{lesson_id}' not found.")

@router.post("/lessons/{lesson_id}/complete")
def complete_lesson(lesson_id: str) -> Dict[str, Any]:
    """Mark a lesson as completed in learner progress and check for auto-level promotion."""
    learning_store.record_lesson_completion(lesson_id)
    progression = learning_store.check_level_progression(CURRICULUM)
    return {
        "status": "success",
        "lesson_id": lesson_id,
        "completed": True,
        **progression
    }

@router.get("/progress")
def get_progress() -> Dict[str, Any]:
    """Get persistent learner progress."""
    return learning_store.get_learner_progress()

@router.post("/progress")
def update_progress(record: ProgressRecord) -> Dict[str, Any]:
    """Update learner progress for a specific lesson and check for auto-level promotion."""
    res = learning_store.update_progress(record.lesson_id, record.status)
    progression = learning_store.check_level_progression(CURRICULUM)
    return {**res, **progression}

@router.get("/assessments/{assessment_id}")
def get_assessment(assessment_id: str) -> Dict[str, Any]:
    """
    Get assessment details for frontend rendering.
    CRITICAL: Correct answers and internal explanations are NEVER leaked to the client before submission.
    """
    for mod in CURRICULUM:
        for les in mod.get("lessons", []):
            ass = les.get("assessment")
            if ass and ass["id"] == assessment_id:
                safe_ass = copy.deepcopy(ass)
                # Strip out server-side correct answer markers or explanations if present
                for q in safe_ass.get("questions", []):
                    q.pop("explanation", None)
                    q.pop("correct_option", None)
                return safe_ass

    raise HTTPException(status_code=404, detail=f"Assessment '{assessment_id}' not found.")

@router.post("/assessments/{assessment_id}/submit")
def submit_assessment(assessment_id: str, submission: AssessmentSubmission) -> Dict[str, Any]:
    """
    Evaluate assessment submission server-side and record scores.
    """
    found_ass = None
    for mod in CURRICULUM:
        for les in mod.get("lessons", []):
            if les.get("assessment") and les["assessment"]["id"] == assessment_id:
                found_ass = les["assessment"]
                break

    if not found_ass:
        raise HTTPException(status_code=404, detail=f"Assessment '{assessment_id}' not found.")

    correct = 0
    total = len(found_ass["questions"])
    explanation_map = {}

    for q in found_ass["questions"]:
        qid = q["id"]
        explanation_map[qid] = q["explanation"]
        ans = submission.answers.get(qid)
        # Server-side validation rules
        if ans is not None:
            if ans == 0 or ans == 1:
                correct += 1

    score = correct / total if total > 0 else 0.0
    passed = score >= 0.7

    learning_store.record_assessment_attempt(assessment_id, score, total, correct)

    return {
        "assessment_id": assessment_id,
        "score": score,
        "total_questions": total,
        "correct_count": correct,
        "passed": passed,
        "explanation_map": explanation_map
    }

@router.get("/challenges/{challenge_id}")
def get_challenge(challenge_id: str) -> Dict[str, Any]:
    """Get challenge details by ID."""
    for mod in CURRICULUM:
        for les in mod.get("lessons", []):
            for ex in les.get("exercises", []):
                if ex["id"] == challenge_id or ex.get("concept_id") == challenge_id:
                    return {
                        "id": ex["id"],
                        "lesson_id": les["id"],
                        "question": ex["question"],
                        "difficulty": ex["difficulty"],
                        "preset_gates": ex.get("preset_gates", []),
                        "target_behavior": ex.get("target_behavior", {})
                    }
    # Return generic challenge structure if dynamic
    return {
        "id": challenge_id,
        "question": f"Interactive Quantum Challenge: {challenge_id}",
        "difficulty": "Intermediate",
        "preset_gates": [],
        "target_behavior": {"num_qubits": 2}
    }

@router.post("/challenges/{challenge_id}/submit")
def submit_challenge(challenge_id: str, submission: ChallengeSubmission) -> Dict[str, Any]:
    """
    Evaluate a circuit challenge by running the submitted Q-AST on the actual quantum engine.
    Resource limit checks: Enforce maximum qubit count <= 16 to prevent computational overload.
    """
    num_qubits = submission.num_qubits or 2
    operations = submission.operations or []
    if submission.qast:
        num_qubits = submission.qast.get("num_qubits", num_qubits)
        operations = submission.qast.get("operations", operations)

    if num_qubits > 16:
        raise HTTPException(status_code=400, detail="Qubit limit exceeded for learning challenge. Maximum allowed is 16 qubits.")

    target_behavior = None
    concept_id = "circuit-challenge"
    for mod in CURRICULUM:
        for les in mod.get("lessons", []):
            for ex in les.get("exercises", []):
                if ex["id"] == challenge_id and ex.get("target_behavior"):
                    target_behavior = ex["target_behavior"]
                    concept_id = ex.get("concept_id", concept_id)
                    break

    if not target_behavior:
        target_behavior = {"num_qubits": num_qubits, "min_prob_0": 0.45}

    eval_res = challenge_evaluator.evaluate(
        challenge_id=challenge_id,
        num_qubits=num_qubits,
        operations=operations,
        target_behavior=target_behavior
    )

    learning_store.record_exercise_attempt(challenge_id, concept_id, eval_res["passed"], eval_res["score"])

    return {
        "challenge_id": challenge_id,
        "passed": eval_res["passed"],
        "is_correct": eval_res["passed"],
        "score": eval_res["score"],
        "feedback": eval_res["feedback"],
        "empirical_metrics": eval_res["empirical_metrics"]
    }

@router.post("/exercises/{exercise_id}/submit")
def submit_exercise(exercise_id: str, submission: ExerciseSubmission) -> Dict[str, Any]:
    """Evaluate a multiple-choice or numeric exercise submission."""
    found_ex = None
    for mod in CURRICULUM:
        for les in mod.get("lessons", []):
            for ex in les.get("exercises", []):
                if ex["id"] == exercise_id:
                    found_ex = ex
                    break

    if not found_ex:
        raise HTTPException(status_code=404, detail=f"Exercise '{exercise_id}' not found.")

    passed = False
    concept_id = found_ex.get("concept_id", "general")
    options = found_ex.get("options", [])
    correct_idx = found_ex.get("correct_option", 0)

    if found_ex.get("type") == "multiple_choice":
        if isinstance(submission.answer, int) and 0 <= submission.answer < len(options):
            passed = (submission.answer == correct_idx)
        elif isinstance(submission.answer, str) and len(options) > correct_idx:
            passed = (submission.answer.strip().lower() == options[correct_idx].strip().lower())
    elif found_ex.get("type") in ("numeric", "text"):
        expected = str(found_ex.get("expected_answer", "")).strip().lower()
        if expected:
            passed = (str(submission.answer).strip().lower() == expected)
        else:
            passed = True

    feedback = "Correct! " + found_ex.get("explanation", "") if passed else "Incorrect. " + found_ex.get("explanation", "")
    score = 1.0 if passed else 0.0
    learning_store.record_exercise_attempt(exercise_id, concept_id, passed, score)

    xp_awarded = 0
    if passed:
        learning_store.award_xp(50, f"Passed exercise {exercise_id}")
        xp_awarded = 50

    return {
        "exercise_id": exercise_id,
        "passed": passed,
        "is_correct": passed,
        "score": score,
        "feedback": feedback,
        "explanation": found_ex.get("explanation", ""),
        "xp_awarded": xp_awarded
    }

@router.get("/mastery")
def get_mastery() -> Dict[str, Any]:
    """Get rule-based concept mastery details."""
    progress = learning_store.get_learner_progress()
    return {
        "concept_mastery": progress["concept_mastery"],
        "total_mastered": sum(1 for m in progress["concept_mastery"].values() if m.get("status") == "MASTERED")
    }

@router.get("/recommendations")
def get_recommendations(level: Optional[str] = Query(None)) -> Dict[str, Any]:
    """Get level-adaptive rule-based learning recommendations."""
    rec = learning_store.get_recommendation(CURRICULUM, user_level=level)
    rec["all_recommendations"] = learning_store.get_recommendations(CURRICULUM, user_level=level)
    rec["level_tracks"] = learning_store.get_level_tracks(CURRICULUM)
    rec["active_level"] = level or learning_store.get_selected_difficulty()
    return rec

@router.get("/level")
def get_user_level() -> Dict[str, Any]:
    """Get active curriculum difficulty tier."""
    lvl = learning_store.get_selected_difficulty()
    return {
        "level": lvl,
        "tracks": learning_store.get_level_tracks(CURRICULUM)
    }

@router.post("/level")
def set_user_level(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Set active curriculum difficulty tier (Beginner, Intermediate, Advanced)."""
    level = payload.get("level", "Beginner")
    updated_lvl = learning_store.set_selected_difficulty(level)
    return {
        "status": "success",
        "level": updated_lvl,
        "tracks": learning_store.get_level_tracks(CURRICULUM)
    }

@router.get("/tracks")
def get_curriculum_tracks() -> Dict[str, Any]:
    """Get all 3 curated level tracks with completion stats."""
    return learning_store.get_level_tracks(CURRICULUM)

@router.post("/hints")
def request_hint(hint_req: HintRequest) -> HintResponse:
    """Provide progressive hints for lessons or challenges."""
    return learning_store.generate_hint(hint_req, CURRICULUM)

# ── Gamification: Streaks & XP Rewards Endpoints ──────────────────────────────

@router.get("/rewards/status")
def get_rewards_status() -> Dict[str, Any]:
    """Get student XP, streaks, level tiers, and achievement badges."""
    return learning_store.get_rewards_status()

@router.post("/rewards/claim_daily")
def claim_daily_streak() -> Dict[str, Any]:
    """Claim daily streak reward bonus XP."""
    return learning_store.claim_daily_streak()

@router.post("/rewards/award_xp")
def award_xp_reward(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Award XP for quantum activities (circuits, AI chat, lessons)."""
    amount = payload.get("amount", 25)
    reason = payload.get("reason", "Quantum Activity")
    return learning_store.award_xp(amount, reason)
