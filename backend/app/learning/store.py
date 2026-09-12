"""
Learning System Persistence & Rule-Based Mastery Store.

Manages learner progress, exercise attempts, assessment scores, concept mastery,
hints, and deterministic adaptive recommendations for QuantumLearning.
"""
import time
import json
import os
from typing import Dict, Any, List, Optional
from app.learning.models import LearnerProgress, ConceptMastery, HintRequest, HintResponse, Recommendation

DATA_FILE = os.path.join(os.path.dirname(__file__), "store_data.json")

class LearningStore:
    def __init__(self):
        self._data: Dict[str, Any] = self._load()

    def _load(self) -> Dict[str, Any]:
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, "r") as f:
                    data = json.load(f)
                    data.setdefault("completed_lessons", [])
                    data.setdefault("exercise_attempts", [])
                    data.setdefault("assessment_attempts", [])
                    data.setdefault("concept_mastery", {})
                    data.setdefault("last_active_lesson", None)
                    data.setdefault("hints_requested_count", 0)
                    data.setdefault("mistakes_count", 0)
                    return data
            except Exception:
                pass
        return {
            "completed_lessons": [],
            "exercise_attempts": [],
            "assessment_attempts": [],
            "concept_mastery": {},
            "last_active_lesson": None,
            "hints_requested_count": 0,
            "mistakes_count": 0
        }

    def _save(self):
        try:
            with open(DATA_FILE, "w") as f:
                json.dump(self._data, f, indent=2)
        except Exception:
            pass

    def record_lesson_completion(self, lesson_id: str):
        if lesson_id not in self._data["completed_lessons"]:
            self._data["completed_lessons"].append(lesson_id)
        self._data["last_active_lesson"] = lesson_id
        self._save()

    def check_level_progression(self, curriculum: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Checks if the learner has completed all lessons for their active difficulty level.
        If all lessons in the current tier are completed, automatically advances to the next level!
        """
        current_level = self.get_selected_difficulty()
        completed = set(self._data.get("completed_lessons", []))

        if current_level == "Beginner":
            beginner_lessons = []
            for mod in curriculum:
                if mod.get("order", 1) <= 4:
                    for les in mod.get("lessons", []):
                        beginner_lessons.append(les["id"])
            if beginner_lessons and all(lid in completed for lid in beginner_lessons):
                self.set_selected_difficulty("Intermediate")
                return {
                    "level_up": True,
                    "previous_level": "Beginner",
                    "new_level": "Intermediate",
                    "completed_count": len(beginner_lessons),
                    "message": "🎉 Congratulations! You have completed all Beginner Foundations coursework (Pillars 1–4) and advanced to the Intermediate Track!"
                }
        elif current_level == "Intermediate":
            intermediate_lessons = []
            for mod in curriculum:
                if 5 <= mod.get("order", 1) <= 9:
                    for les in mod.get("lessons", []):
                        intermediate_lessons.append(les["id"])
            if intermediate_lessons and all(lid in completed for lid in intermediate_lessons):
                self.set_selected_difficulty("Advanced")
                return {
                    "level_up": True,
                    "previous_level": "Intermediate",
                    "new_level": "Advanced",
                    "completed_count": len(intermediate_lessons),
                    "message": "🚀 Outstanding work! You have completed all Intermediate Circuit & Algorithm coursework (Pillars 5–9) and advanced to the Advanced Track!"
                }
        return {
            "level_up": False,
            "current_level": current_level
        }

    def update_progress(self, lesson_id: str, status: str) -> Dict[str, Any]:
        valid_statuses = {"NOT_STARTED", "IN_PROGRESS", "COMPLETED", "MASTERED"}
        st = status.upper()
        if st not in valid_statuses:
            st = "IN_PROGRESS"

        if st in ("COMPLETED", "MASTERED") and lesson_id not in self._data["completed_lessons"]:
            self._data["completed_lessons"].append(lesson_id)

        self._data["last_active_lesson"] = lesson_id
        self._save()

        return {
            "lesson_id": lesson_id,
            "status": st,
            "completed_lessons_count": len(self._data["completed_lessons"])
        }

    def record_exercise_attempt(self, exercise_id: str, concept_id: str, passed: bool, score: float):
        now = time.time()
        if not passed:
            self._data["mistakes_count"] += 1

        self._data["exercise_attempts"].append({
            "exercise_id": exercise_id,
            "concept_id": concept_id,
            "passed": passed,
            "score": score,
            "timestamp": now
        })
        self._update_concept_mastery(concept_id)
        self._save()

    def record_assessment_attempt(self, assessment_id: str, score: float, total: int, correct: int):
        now = time.time()
        if correct < total:
            self._data["mistakes_count"] += (total - correct)

        self._data["assessment_attempts"].append({
            "assessment_id": assessment_id,
            "score": score,
            "total": total,
            "correct": correct,
            "timestamp": now
        })
        self._save()

    def _update_concept_mastery(self, concept_id: str):
        attempts = [a for a in self._data["exercise_attempts"] if a.get("concept_id") == concept_id]
        if not attempts:
            return

        total_attempts = len(attempts)
        passed_attempts = sum(1 for a in attempts if a.get("passed"))
        accuracy = passed_attempts / total_attempts if total_attempts > 0 else 0.0

        # Weighted calculation combining evidence count and accuracy
        weighted_score = min(1.0, (accuracy * 0.7) + (min(passed_attempts, 5) / 5.0 * 0.3))

        if passed_attempts >= 3 and weighted_score >= 0.8:
            status = "MASTERED"
        elif passed_attempts >= 1:
            status = "COMPLETED"
        else:
            status = "IN_PROGRESS"

        self._data["concept_mastery"][concept_id] = {
            "concept_id": concept_id,
            "concept_name": concept_id.replace("-", " ").title(),
            "status": status,
            "mastery_score": round(weighted_score, 2),
            "evidence_count": passed_attempts,
            "attempts_count": total_attempts,
            "last_evaluated_at": time.time()
        }

    def get_progress(self) -> Dict[str, Any]:
        return self.get_learner_progress()

    def get_learner_progress(self) -> Dict[str, Any]:
        return {
            "learner_id": "default_learner",
            "completed_lessons": self._data["completed_lessons"],
            "exercise_attempts_count": len(self._data["exercise_attempts"]),
            "assessment_attempts_count": len(self._data["assessment_attempts"]),
            "concept_mastery": self._data["concept_mastery"],
            "last_active_lesson": self._data["last_active_lesson"],
            "hints_requested_count": self._data["hints_requested_count"],
            "mistakes_count": self._data["mistakes_count"]
        }

    def generate_hint(self, request: HintRequest, curriculum: List[Dict[str, Any]]) -> HintResponse:
        self._data["hints_requested_count"] += 1
        self._save()

        level = max(1, min(4, request.hint_level))
        lesson_id = request.lesson_id

        # Find target lesson title or concept
        title = "Quantum Concept Hint"
        for mod in curriculum:
            for les in mod.get("lessons", []):
                if les["id"] == lesson_id:
                    title = les["title"]
                    break

        if level == 1:
            content = f"Conceptual Guidance: Think about how quantum state vectors evolve under unitary transformations in {title}."
        elif level == 2:
            content = f"Gate/Operation Focus: Inspect gate matrix definitions and probability amplitudes for {title}."
        elif level == 3:
            content = f"Direct Execution Guidance: Check target qubit indices and statevector normalization (|α|² + |β|² = 1)."
        else: # level 4 (Final Explanation)
            content = f"Final Solution Explanation: Apply standard quantum circuit construction, measure qubits, and analyze pre-measurement probability distributions."

        return HintResponse(
            lesson_id=lesson_id,
            challenge_id=request.challenge_id,
            hint_level=level,
            title=f"Hint Level {level} — {title}",
            content=content,
            next_level_available=(level < 4)
        )

    def get_selected_difficulty(self) -> str:
        return self._data.get("selected_difficulty", "Beginner")

    def set_selected_difficulty(self, difficulty: str) -> str:
        diff = difficulty.capitalize()
        if diff not in {"Beginner", "Intermediate", "Advanced"}:
            diff = "Beginner"
        self._data["selected_difficulty"] = diff
        self._save()
        return diff

    def get_level_tracks(self, curriculum: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Group curriculum modules into 3 structured level tracks:
        - Beginner: Modules 1-4 (Foundations, Principles, Qubits, Gates)
        - Intermediate: Modules 5-9 (Circuits, Multi-qubit, Algorithms, NISQ)
        - Advanced: Modules 10-20 (QEC, Hardware, Software, Advantages, Frontier)
        """
        completed = set(self._data.get("completed_lessons", []))

        tracks = {
            "Beginner": {
                "level": "Beginner",
                "title": "Quantum Foundations Track",
                "badge": "⚛️ Qubit Foundations",
                "description": "Physical qubits, single-qubit rotations, Bloch sphere representation, and foundational mechanics.",
                "module_ids": ["mod-1", "mod-2", "mod-3", "mod-4"],
                "modules": [],
                "total_lessons": 0,
                "completed_lessons": 0,
                "recommended_focus": "Master statevector superposition |+⟩ and single-qubit gates (X, Y, Z, H, Phase)."
            },
            "Intermediate": {
                "level": "Intermediate",
                "title": "Circuits & Algorithms Track",
                "badge": "🔗 Circuits & Algorithms",
                "description": "Entanglement, Bell States, Deutsch-Jozsa, Grover's Search, and Teleportation circuits.",
                "module_ids": ["mod-5", "mod-6", "mod-7", "mod-8", "mod-9"],
                "modules": [],
                "total_lessons": 0,
                "completed_lessons": 0,
                "recommended_focus": "Construct 2-to-4 qubit entangled states, phase kickback, and quantum oracles."
            },
            "Advanced": {
                "level": "Advanced",
                "title": "Fault Tolerance & Frontier Track",
                "badge": "🛡️ Fault Tolerance & QEC",
                "description": "Shor's factoring, Quantum Phase Estimation, Surface Code QEC, VQE, and Quantum Machine Learning.",
                "module_ids": ["mod-10", "mod-11", "mod-12", "mod-13", "mod-14", "mod-15", "mod-16", "mod-17", "mod-18", "mod-19", "mod-20"],
                "modules": [],
                "total_lessons": 0,
                "completed_lessons": 0,
                "recommended_focus": "Simulate quantum error correction syndromes, Variational Quantum Eigensolvers, and QFT."
            }
        }

        for mod in curriculum:
            order = mod.get("order", 1)
            target_track = "Beginner" if order <= 4 else ("Intermediate" if order <= 9 else "Advanced")
            tracks[target_track]["modules"].append({
                "id": mod["id"],
                "title": mod["title"],
                "description": mod.get("description", ""),
                "order": order,
                "lesson_count": len(mod.get("lessons", []))
            })
            for les in mod.get("lessons", []):
                tracks[target_track]["total_lessons"] += 1
                if les["id"] in completed:
                    tracks[target_track]["completed_lessons"] += 1

        for track in tracks.values():
            t_total = track["total_lessons"]
            t_comp = track["completed_lessons"]
            track["progress_percent"] = round((t_comp / t_total * 100)) if t_total > 0 else 0

        return tracks

    def get_recommendations(self, curriculum: List[Dict[str, Any]], user_level: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Deterministic, explainable adaptive recommendation engine.
        Filters and prioritizes next steps based on active user level (Beginner/Intermediate/Advanced),
        actual progress, recent scores, and mastery.
        """
        completed = set(self._data["completed_lessons"])
        mastery = self._data["concept_mastery"]
        recent_assessments = self._data["assessment_attempts"]
        active_level = (user_level or self.get_selected_difficulty()).capitalize()
        if active_level not in {"Beginner", "Intermediate", "Advanced"}:
            active_level = "Beginner"

        recs: List[Dict[str, Any]] = []

        # Rule 1: Check for weak concepts / low assessment scores -> RETRY_LESSON or REVIEW_TOPIC
        if recent_assessments and recent_assessments[-1].get("score", 1.0) < 0.7:
            recs.append({
                "recommendation_type": "RETRY_LESSON",
                "target_id": self._data.get("last_active_lesson") or "les-1-1",
                "title": "Review Recent Concept",
                "reason": "Recommended because your recent assessment score was below 70%. Reviewing previous material will strengthen understanding.",
                "difficulty": active_level,
                "level": active_level
            })

        # Rule 2: Check for low mastery concepts -> REVIEW_TOPIC
        for cid, mrecord in mastery.items():
            if mrecord.get("mastery_score", 1.0) < 0.6:
                recs.append({
                    "recommendation_type": "REVIEW_TOPIC",
                    "target_id": cid,
                    "title": f"Review {mrecord.get('concept_name', cid)}",
                    "reason": f"Recommended because concept mastery for '{cid}' is currently below threshold ({mrecord.get('mastery_score')}).",
                    "difficulty": active_level,
                    "level": active_level
                })
                break

        # Rule 3: Level-filtered lesson recommendations
        # Determine module order ranges for the active level
        if active_level == "Beginner":
            order_min, order_max = 1, 4
        elif active_level == "Intermediate":
            order_min, order_max = 5, 9
        else:
            order_min, order_max = 10, 20

        # Prioritize lessons in active level tier first
        level_lessons = []
        other_lessons = []
        for mod in curriculum:
            order = mod.get("order", 1)
            for les in mod.get("lessons", []):
                if order_min <= order <= order_max:
                    level_lessons.append(les)
                else:
                    other_lessons.append(les)

        # Look in active level track
        for les in level_lessons:
            prereqs = set(les.get("prerequisites", []))
            if les["id"] not in completed and prereqs.issubset(completed):
                recs.append({
                    "recommendation_type": "ADVANCE_TOPIC",
                    "target_id": les["id"],
                    "title": les["title"],
                    "reason": f"Recommended for your active {active_level} track. All prerequisites are met.",
                    "difficulty": les.get("difficulty", active_level),
                    "level": active_level
                })
                break

        # If all level lessons are done or blocked, search general curriculum
        if not recs:
            for les in other_lessons:
                prereqs = set(les.get("prerequisites", []))
                if les["id"] not in completed and prereqs.issubset(completed):
                    recs.append({
                        "recommendation_type": "ADVANCE_TOPIC",
                        "target_id": les["id"],
                        "title": les["title"],
                        "reason": "Recommended next available topic in the comprehensive curriculum.",
                        "difficulty": les.get("difficulty", active_level),
                        "level": active_level
                    })
                    break

        # Rule 4: Fallback practice challenge tailored to level
        if not recs:
            challenge_targets = {
                "Beginner": ("les-1-2", "Introductory Superposition Practice", "Beginner"),
                "Intermediate": ("les-5-1", "Bell State Entanglement Challenge", "Intermediate"),
                "Advanced": ("les-11-1", "Surface Code Error Correction Challenge", "Advanced")
            }
            target_id, title, diff = challenge_targets.get(active_level, ("les-1-2", "Quantum Practice Challenge", "Beginner"))
            recs.append({
                "recommendation_type": "PRACTICE_CHALLENGE",
                "target_id": target_id,
                "title": title,
                "reason": f"Deepen problem-solving skills with {active_level} challenges in the Quantum Lab.",
                "difficulty": diff,
                "level": active_level
            })

        return recs

    def get_recommendation(self, curriculum: List[Dict[str, Any]], user_level: Optional[str] = None) -> Dict[str, Any]:
        recs = self.get_recommendations(curriculum, user_level)
        if recs:
            rec = recs[0]
            return {
                "recommended_lesson_id": rec["target_id"],
                "recommendation_type": rec["recommendation_type"],
                "title": rec["title"],
                "reason": rec["reason"],
                "difficulty": rec.get("difficulty", "Beginner"),
                "level": rec.get("level", "Beginner")
            }
        return {
            "recommended_lesson_id": None,
            "recommendation_type": "COMPLETE",
            "title": "Curriculum Complete",
            "reason": "Curriculum completed! Practice in the Quantum Lab.",
            "difficulty": "Advanced",
            "level": "Advanced"
        }

    # ── Gamification: XP, Streaks & Achievements ─────────────────────────────

    def _get_level_info(self, xp: int) -> Dict[str, Any]:
        tiers = [
            (0, 200, 1, "Quantum Novice", "⚛️"),
            (200, 500, 2, "Qubit Apprentice", "🔬"),
            (500, 1000, 3, "Superposition Adept", "🌀"),
            (1000, 2000, 4, "Entanglement Master", "🔗"),
            (2000, 5000, 5, "Quantum Architect", "🚀")
        ]
        for min_xp, max_xp, lvl, title, icon in tiers:
            if xp < max_xp:
                progress_pct = int(((xp - min_xp) / (max_xp - min_xp)) * 100)
                return {
                    "level": lvl,
                    "level_title": title,
                    "level_icon": icon,
                    "current_level_min": min_xp,
                    "next_level_xp": max_xp,
                    "xp_in_level": xp - min_xp,
                    "xp_needed": max_xp - xp,
                    "progress_pct": max(0, min(100, progress_pct))
                }
        return {
            "level": 5,
            "level_title": "Quantum Architect",
            "level_icon": "🚀",
            "current_level_min": 2000,
            "next_level_xp": 5000,
            "xp_in_level": xp - 2000,
            "xp_needed": 0,
            "progress_pct": 100
        }

    def get_rewards_status(self) -> Dict[str, Any]:
        xp = self._data.setdefault("xp", 450)
        streak_days = self._data.setdefault("streak_days", 3)
        today_xp = self._data.setdefault("today_xp", 150)
        daily_goal_xp = self._data.setdefault("daily_goal_xp", 200)
        badges = self._data.setdefault("badges", ["FIRST_QUBIT", "SUPERPOSITION_EXPLORER"])

        lvl_info = self._get_level_info(xp)

        all_badges = [
            {"id": "FIRST_QUBIT", "title": "First Qubit", "icon": "⚛️", "desc": "Created and simulated your first quantum circuit", "unlocked": "FIRST_QUBIT" in badges},
            {"id": "SUPERPOSITION_EXPLORER", "title": "Superposition Explorer", "icon": "🌀", "desc": "Prepared a Hadamard equal superposition state", "unlocked": "SUPERPOSITION_EXPLORER" in badges},
            {"id": "BELL_ENTANGLER", "title": "Bell Entangler", "icon": "🔗", "desc": "Created a maximally entangled Bell pair |Φ+⟩", "unlocked": "BELL_ENTANGLER" in badges or len(self._data.get("completed_lessons", [])) >= 2},
            {"id": "GROVER_SEARCHER", "title": "Oracle Hunter", "icon": "🎯", "desc": "Executed 3D Grover Search amplitude amplification", "unlocked": "GROVER_SEARCHER" in badges or len(self._data.get("completed_lessons", [])) >= 4},
            {"id": "QEC_DEFENDER", "title": "QEC Guardian", "icon": "🛡️", "desc": "Protected a logical qubit with surface code error correction", "unlocked": "QEC_DEFENDER" in badges},
            {"id": "STREAK_FLAME", "title": "Consistency Master", "icon": "🔥", "desc": "Maintained a 3+ day continuous learning streak", "unlocked": streak_days >= 3},
        ]

        return {
            "xp": xp,
            "streak_days": streak_days,
            "streak_multiplier": 1.5 if streak_days >= 3 else 1.0,
            "today_xp": today_xp,
            "daily_goal_xp": daily_goal_xp,
            "daily_goal_pct": min(100, int((today_xp / max(1, daily_goal_xp)) * 100)),
            **lvl_info,
            "badges": all_badges,
            "streak_calendar": [
                {"day": "Mon", "active": True},
                {"day": "Tue", "active": True},
                {"day": "Wed", "active": True},
                {"day": "Thu", "active": False},
                {"day": "Fri", "active": False},
                {"day": "Sat", "active": False},
                {"day": "Sun", "active": False}
            ]
        }

    def award_xp(self, amount: int, reason: str = "Learning Activity") -> Dict[str, Any]:
        curr_xp = self._data.setdefault("xp", 450)
        new_xp = curr_xp + amount
        self._data["xp"] = new_xp
        self._data["today_xp"] = self._data.setdefault("today_xp", 0) + amount

        # Auto-award badges based on progress
        badges = set(self._data.setdefault("badges", ["FIRST_QUBIT", "SUPERPOSITION_EXPLORER"]))
        if new_xp >= 500:
            badges.add("BELL_ENTANGLER")
        if new_xp >= 1000:
            badges.add("GROVER_SEARCHER")
        self._data["badges"] = list(badges)

        self._save()
        status = self.get_rewards_status()
        status["awarded"] = amount
        status["reason"] = reason
        return status

    def claim_daily_streak(self) -> Dict[str, Any]:
        streak = self._data.setdefault("streak_days", 3) + 1
        self._data["streak_days"] = streak
        bonus_xp = 50 * streak
        self._data["xp"] = self._data.setdefault("xp", 450) + bonus_xp
        self._data["today_xp"] = self._data.setdefault("today_xp", 0) + bonus_xp
        self._save()
        return self.get_rewards_status()

# Global singleton store
learning_store = LearningStore()
