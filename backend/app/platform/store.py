import os
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from .models import (
    User, UserRole, Course, Module, Lesson, Note, Quiz, Question,
    Assessment, AssessmentQuestion, Challenge, Problem, Enrollment,
    ProgressRecord, Submission, Notification
)

DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "platform_store.json")

class PlatformStore:
    def __init__(self, data_path: str = DATA_FILE):
        self.data_path = data_path
        self.users: Dict[str, User] = {}
        self.courses: Dict[str, Course] = {}
        self.enrollments: Dict[str, Enrollment] = {}
        self.progress: Dict[str, ProgressRecord] = {}
        self.submissions: Dict[str, Submission] = {}
        self.notifications: List[Notification] = []
        self._load()

    def _load(self):
        if os.path.exists(self.data_path):
            try:
                with open(self.data_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.users = {k: User(**v) for k, v in data.get("users", {}).items()}
                    self.courses = {k: Course(**v) for k, v in data.get("courses", {}).items()}
                    self.enrollments = {k: Enrollment(**v) for k, v in data.get("enrollments", {}).items()}
                    self.progress = {k: ProgressRecord(**v) for k, v in data.get("progress", {}).items()}
                    self.submissions = {k: Submission(**v) for k, v in data.get("submissions", {}).items()}
                    self.notifications = [Notification(**n) for n in data.get("notifications", [])]
                    return
            except Exception as e:
                print(f"[PlatformStore] Error loading data: {e}. Seeding fresh store.")
        self._seed_default_data()
        self.save()

    def save(self):
        os.makedirs(os.path.dirname(self.data_path), exist_ok=True)
        users_dict = {k: v.model_dump() for k, v in self.users.items()}
        courses_dict = {k: v.model_dump() for k, v in self.courses.items()}
        enrollments_dict = {k: v.model_dump() for k, v in self.enrollments.items()}
        progress_dict = {k: v.model_dump() for k, v in self.progress.items()}
        submissions_dict = {k: v.model_dump() for k, v in self.submissions.items()}
        notifications_list = [n.model_dump() for n in self.notifications]

        data = {
            "users": users_dict,
            "courses": courses_dict,
            "enrollments": enrollments_dict,
            "progress": progress_dict,
            "submissions": submissions_dict,
            "notifications": notifications_list
        }
        with open(self.data_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

        # Synchronize directly to php_backend/data JSON files
        try:
            php_data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "php_backend", "data")
            if os.path.exists(php_data_dir):
                with open(os.path.join(php_data_dir, "users.json"), "w", encoding="utf-8") as f:
                    json.dump(list(users_dict.values()), f, indent=2)
                with open(os.path.join(php_data_dir, "courses.json"), "w", encoding="utf-8") as f:
                    json.dump(list(courses_dict.values()), f, indent=2)
                with open(os.path.join(php_data_dir, "progress.json"), "w", encoding="utf-8") as f:
                    json.dump(list(progress_dict.values()), f, indent=2)
                with open(os.path.join(php_data_dir, "submissions.json"), "w", encoding="utf-8") as f:
                    json.dump(list(submissions_dict.values()), f, indent=2)
                with open(os.path.join(php_data_dir, "notifications.json"), "w", encoding="utf-8") as f:
                    json.dump(notifications_list, f, indent=2)
        except Exception:
            pass

    def _seed_default_data(self):
        # Default Trainer
        trainer_id = "trainer-001"
        trainer = User(
            id=trainer_id,
            name="Prof. Sarah Jenkins",
            email="trainer@platform.edu",
            password="trainer123",
            role=UserRole.TRAINER,
            phone="+1 (555) 234-5678",
            avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            bio="Lead Senior Quantum & AI Systems Instructor with 12+ years of research and curriculum development experience.",
            expertise=["Quantum Computing", "Python Data Science", "Algorithm Optimization", "Cloud Architectures"],
            created_at=datetime.utcnow().isoformat()
        )
        self.users[trainer_id] = trainer

        # Default Learner
        learner_id = "learner-001"
        learner = User(
            id=learner_id,
            name="Alex Rivera",
            email="student@platform.edu",
            password="student123",
            role=UserRole.LEARNER,
            phone="+1 (555) 987-6543",
            avatar="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
            bio="Aspiring Quantum Software Engineer & Machine Learning enthusiast.",
            created_at=datetime.utcnow().isoformat()
        )
        self.users[learner_id] = learner

        # Sample Course 1: Quantum Foundations & Algorithms
        course_1_id = "crs-qnt-101"
        c1 = Course(
            id=course_1_id,
            title="Quantum Computing Foundations & Qiskit Algorithms",
            description="Master the fundamental mechanics of quantum states, superposition, entanglement, and build executable quantum circuits.",
            category="Quantum Computing",
            level="Beginner to Intermediate",
            duration="6 Weeks (24 Hours)",
            thumbnail="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
            trainer_id=trainer_id,
            trainer_name=trainer.name,
            is_published=True,
            created_at=datetime.utcnow().isoformat(),
            modules=[
                Module(
                    id="mod-1",
                    title="Module 1: Superposition and Quantum Bits (Qubits)",
                    description="Mathematical representations of state vectors and single-qubit rotations.",
                    order=1,
                    lessons=[
                        Lesson(
                            id="les-1-1",
                            title="Introduction to Qubits & The Bloch Sphere",
                            type="theory",
                            duration="18 min",
                            content="""# Introduction to Qubits & The Bloch Sphere

In classical computation, the fundamental unit of information is the **bit**, which holds a deterministic state of either `0` or `1`.

In **quantum computing**, the fundamental unit is the **qubit** (quantum bit). A qubit can exist in a linear superposition of the computational basis states $|0\\rangle$ and $|1\\rangle$:

$$|\\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle$$

Where $\\alpha$ and $\\beta$ are complex probability amplitudes satisfying the normalization condition:
$$|\\alpha|^2 + |\\beta|^2 = 1$$

### Key Concepts:
1. **Superposition:** The ability of a quantum system to occupy multiple basis states simultaneously until measurement.
2. **Measurement Collapse:** Upon measurement in the computational basis, the state collapses to $|0\\rangle$ with probability $|\\alpha|^2$ or $|1\\rangle$ with probability $|\\beta|^2$.
3. **Bloch Sphere Representation:** A geometric visualization on the surface of a 3-dimensional unit sphere where any single-qubit pure state can be expressed as:
$$|\\psi\\rangle = \\cos\\left(\\frac{\\theta}{2}\\right)|0\\rangle + e^{i\\phi}\\sin\\left(\\frac{\\theta}{2}\\right)|1\\rangle$$
""",
                            order=1
                        ),
                        Lesson(
                            id="les-1-2",
                            title="Quantum Gates & State Rotations Walkthrough",
                            type="video",
                            duration="24 min",
                            video_url="https://www.youtube.com/embed/QuRna36xnwk",
                            content="Watch Prof. Jenkins demonstrate Pauli-X, Hadamard (H), and Phase (S, T) gate applications on IBM Qiskit quantum simulators.",
                            order=2
                        )
                    ]
                ),
                Module(
                    id="mod-2",
                    title="Module 2: Entanglement & Bell State Circuits",
                    description="Two-qubit interactions, CNOT gates, and EPR pair creation.",
                    order=2,
                    lessons=[
                        Lesson(
                            id="les-2-1",
                            title="Constructing Bell States with Hadamard & CNOT",
                            type="theory",
                            duration="22 min",
                            content="""# Constructing Bell States with Hadamard and CNOT

Quantum entanglement is a phenomenon where the quantum states of two or more particles become inseparable, regardless of the spatial distance separating them.

### The Canonical $\\Phi^+$ Bell State:
Starting from ground state $|00\\rangle$:
1. Apply **Hadamard Gate** on Qubit 0:
$$H|0\\rangle_0 \\otimes |0\\rangle_1 = \\frac{1}{\\sqrt{2}}(|0\\rangle + |1\\rangle) \\otimes |0\\rangle = \\frac{1}{\\sqrt{2}}(|00\\rangle + |10\\rangle)$$
2. Apply **Controlled-NOT (CNOT)** gate with Qubit 0 as control and Qubit 1 as target:
$$\\text{CNOT}\\left(\\frac{1}{\\sqrt{2}}(|00\\rangle + |10\\rangle)\\right) = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}} = |\\Phi^+\\rangle$$

This creates maximal entanglement: measuring qubit 0 immediately determines qubit 1!
""",
                            order=1
                        )
                    ]
                )
            ],
            notes=[
                Note(
                    id="not-1",
                    title="Complete Quantum Gates Matrix Cheatsheet & Dirac Notation",
                    description="Comprehensive reference PDF summary containing unitary matrices for H, X, Y, Z, CNOT, SWAP, and Toffoli gates.",
                    file_url="https://raw.githubusercontent.com/qiskit-community/qiskit-translations/master/docs/cheatsheet/cheatsheet.pdf",
                    file_name="Quantum_Gates_Cheatsheet.pdf",
                    uploaded_at=datetime.utcnow().isoformat()
                ),
                Note(
                    id="not-2",
                    title="Mathematical Foundations: Linear Algebra for Quantum Mechanics",
                    description="Eigenvalues, Hermiticity, inner/outer products, tensor products and Hilbert spaces summarized for computer scientists.",
                    file_url="#",
                    file_name="Linear_Algebra_Quantum_Foundations.pdf",
                    uploaded_at=datetime.utcnow().isoformat()
                )
            ],
            quizzes=[
                Quiz(
                    id="quiz-1",
                    title="Qubit Superposition & Gate Algebra Knowledge Check",
                    description="Test your conceptual understanding of normalization, Bloch coordinates, and unitary transformations.",
                    time_limit_mins=15,
                    passing_score=70,
                    created_at=datetime.utcnow().isoformat(),
                    questions=[
                        Question(
                            id="q1-1",
                            question="If a normalized state is given by $|\\psi\\rangle = \\frac{1}{2}|0\\rangle + c|1\\rangle$, what is the magnitude $|c|^2$?",
                            options=["0.25", "0.50", "0.75", "1.00"],
                            correct_answer_index=2,
                            explanation="Because $|\\alpha|^2 + |\\beta|^2 = 1$, we have $(1/2)^2 + |c|^2 = 1/4 + |c|^2 = 1 \\Rightarrow |c|^2 = 3/4 = 0.75$."
                        ),
                        Question(
                            id="q1-2",
                            question="Which quantum logic gate transforms the basis state $|0\\rangle$ into the equal superposition $(|0\\rangle + |1\\rangle)/\\sqrt{2}$?",
                            options=["Pauli-X Gate", "Hadamard (H) Gate", "Phase (S) Gate", "Controlled-Z Gate"],
                            correct_answer_index=1,
                            explanation="The Hadamard gate creates an equal superposition of $|0\\rangle$ and $|1\\rangle$."
                        ),
                        Question(
                            id="q1-3",
                            question="What is the matrix representation of the single-qubit Pauli-X gate?",
                            options=["[[1, 0], [0, 1]]", "[[0, 1], [1, 0]]", "[[1, 0], [0, -1]]", "[[0, -i], [i, 0]]"],
                            correct_answer_index=1,
                            explanation="Pauli-X acts like a quantum NOT gate, represented by [[0, 1], [1, 0]]."
                        )
                    ]
                )
            ],
            assessments=[
                Assessment(
                    id="asm-1",
                    title="Mid-Term Theoretical Assessment: Circuit Depth & Quantum Entanglement",
                    description="Formal assessment evaluating circuit synthesis, gate decompositions, and Bell state analysis.",
                    deadline="2026-10-30T23:59:59",
                    total_marks=50,
                    instructions="Answer all descriptive and calculation questions clearly. Provide mathematical steps where appropriate.",
                    created_at=datetime.utcnow().isoformat(),
                    questions=[
                        AssessmentQuestion(
                            id="aq-1",
                            question="Derive the output state vector when applying a Hadamard gate followed by a Pauli-Z gate to the initial state $|0\\rangle$. Explain why phase kickback occurs in multi-qubit systems.",
                            max_marks=20,
                            guidelines="1. Write initial state. 2. Show Hadamard transformation. 3. Apply Z gate matrix. 4. Explain the resulting state $(|0> - |1>)/sqrt(2)$."
                        ),
                        AssessmentQuestion(
                            id="aq-2",
                            question="Explain how the No-Cloning Theorem prevents the exact duplication of an unknown quantum state, and discuss its implications on quantum cryptography and error correction.",
                            max_marks=30,
                            guidelines="Mention linearity of unitary operations, state vectors, and comparison with classical information fan-out."
                        )
                    ]
                )
            ],
            challenges=[
                Challenge(
                    id="ch-1",
                    title="Hands-On Challenge: Construct Quantum Teleportation Protocol",
                    description="Implement the full 3-qubit Quantum Teleportation circuit in Python using Qiskit or Cirq logic. Teleport an unknown state $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$ from Alice to Bob using an EPR pair.",
                    difficulty="Intermediate",
                    xp_reward=250,
                    starter_code="""import numpy as np

def quantum_teleportation_circuit(alpha, beta):
    \"\"\"
    Construct and simulate quantum teleportation of state [alpha, beta].
    Returns: reconstructed state at Bob's qubit.
    \"\"\"
    # TODO: Step 1. Prepare Alice's secret qubit
    # TODO: Step 2. Create Bell state between Alice (q1) and Bob (q2)
    # TODO: Step 3. Alice applies CNOT(q0, q1) and H(q0)
    # TODO: Step 4. Alice measures q0 and q1
    # TODO: Step 5. Bob applies conditional X and Z gates
    pass
""",
                    test_cases=[
                        {"input": "alpha=0.6, beta=0.8", "expected": "Bob state fidelity > 0.99"},
                        {"input": "alpha=1.0, beta=0.0", "expected": "Bob state fidelity = 1.0"}
                    ],
                    hints=[
                        "Use an entangled pair between Qubit 1 and Qubit 2: H on q1, CX(q1, q2).",
                        "Alice entangles secret Qubit 0 with Qubit 1 using CX(q0, q1) then H(q0).",
                        "Bob applies X if Alice's q1 is 1, and Z if Alice's q0 is 1."
                    ]
                )
            ],
            problems=[
                Problem(
                    id="prb-1",
                    title="Problem #101: Quantum Superposition Probability Engine",
                    description="Given two complex numbers representing alpha and beta of a quantum state, calculate the probabilities P(0) and P(1), verify normalization within tolerance 1e-5, and return the Bloch angles (theta, phi) in radians.",
                    difficulty="Medium",
                    starter_code="""import cmath
import math

def calculate_bloch_coordinates(alpha_real, alpha_imag, beta_real, beta_imag):
    alpha = complex(alpha_real, alpha_imag)
    beta = complex(beta_real, beta_imag)
    
    # Calculate probabilities
    p0 = abs(alpha)**2
    p1 = abs(beta)**2
    
    # Calculate theta and phi
    theta = 2 * math.acos(min(1.0, abs(alpha)))
    phi = cmath.phase(beta) - cmath.phase(alpha)
    
    return {
        "p0": round(p0, 4),
        "p1": round(p1, 4),
        "theta": round(theta, 4),
        "phi": round(phi, 4),
        "is_normalized": abs(p0 + p1 - 1.0) < 1e-5
    }
""",
                    test_cases=[
                        {"input": "1.0, 0.0, 0.0, 0.0", "output": '{"p0": 1.0, "p1": 0.0, "theta": 0.0, "phi": 0.0, "is_normalized": true}'},
                        {"input": "0.7071, 0.0, 0.7071, 0.0", "output": '{"p0": 0.5, "p1": 0.5, "theta": 1.5708, "phi": 0.0, "is_normalized": true}'}
                    ]
                )
            ]
        )
        self.courses[course_1_id] = c1

        # Sample Course 2: Advanced Python & AI Algorithm Optimization
        course_2_id = "crs-py-201"
        c2 = Course(
            id=course_2_id,
            title="Applied Python for AI, Data Structures & High-Performance Computing",
            description="Deep dive into algorithmic complexity, NumPy vectorization, GPU tensor acceleration, and scalable machine learning pipelines.",
            category="Artificial Intelligence & Python",
            level="Advanced",
            duration="8 Weeks (32 Hours)",
            thumbnail="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
            trainer_id=trainer_id,
            trainer_name=trainer.name,
            is_published=True,
            created_at=datetime.utcnow().isoformat(),
            modules=[
                Module(
                    id="py-mod-1",
                    title="Module 1: Vectorized Computations and Memory Profiling",
                    description="Mastering SIMD operations, memory contiguous arrays, and memory profiling in Python.",
                    order=1,
                    lessons=[
                        Lesson(
                            id="py-les-1-1",
                            title="NumPy Broadcasting & Cache Locality Mechanics",
                            type="theory",
                            duration="20 min",
                            content="""# NumPy Broadcasting & Cache Locality

Python list operations incur significant overhead due to dynamic pointer indirection. NumPy arrays leverage contiguous memory blocks in C, facilitating CPU cache locality and SIMD vector instruction pipelines.

### Key Rules of Broadcasting:
1. If the two arrays differ in their number of dimensions, the shape of the one with fewer dimensions is padded with ones on its leading (left) side.
2. If the shape of the two arrays does not match in any dimension, the array with shape equal to 1 in that dimension is stretched to match the other shape.
3. If in any dimension the sizes disagree and neither is equal to 1, a `ValueError` is raised.
""",
                            order=1
                        ),
                        Lesson(
                            id="py-les-1-2",
                            title="Profiling Algorithms with cProfile and Memory-Profiler",
                            type="video",
                            duration="30 min",
                            video_url="https://www.youtube.com/embed/dQw4w9WgXcQ",
                            content="Walkthrough of memory bottlenecks and flame graphs in performance-critical codebases.",
                            order=2
                        )
                    ]
                )
            ],
            notes=[
                Note(
                    id="py-not-1",
                    title="High-Performance Python Architecture Playbook",
                    description="Curated best practices covering Cython, Numba JIT, multi-threading GIL bypass, and multiprocessing patterns.",
                    file_url="#",
                    file_name="HP_Python_Architecture.pdf",
                    uploaded_at=datetime.utcnow().isoformat()
                )
            ],
            quizzes=[
                Quiz(
                    id="py-quiz-1",
                    title="Python Memory Management & Asynchronous Event Loop Quiz",
                    description="Evaluate mastery over GIL, reference counting, weak references, and asyncio event loops.",
                    time_limit_mins=10,
                    passing_score=75,
                    created_at=datetime.utcnow().isoformat(),
                    questions=[
                        Question(
                            id="pq-1",
                            question="How does Python's Global Interpreter Lock (GIL) affect multi-threaded CPU-bound execution?",
                            options=[
                                "It speeds up execution by parallelizing bytecode interpretation across all CPU cores.",
                                "It ensures only one native thread executes Python bytecode at any given moment, bottlenecking pure CPU parallelization.",
                                "It disables garbage collection during thread execution.",
                                "It forces all variables to be stored in global memory."
                            ],
                            correct_answer_index=1,
                            explanation="The GIL serializes bytecode execution on CPython, which means multi-threaded CPU-bound programs do not scale linearly on multiple cores without multiprocessing or native C extensions."
                        )
                    ]
                )
            ],
            assessments=[],
            challenges=[],
            problems=[]
        )
        self.courses[course_2_id] = c2

        # Auto-enroll default student into Course 1
        enroll_id = f"enr-{learner_id}-{course_1_id}"
        self.enrollments[enroll_id] = Enrollment(
            id=enroll_id,
            learner_id=learner_id,
            learner_name=learner.name,
            learner_email=learner.email,
            course_id=course_1_id,
            course_title=c1.title,
            enrolled_at=datetime.utcnow().isoformat(),
            status="active"
        )

        # Sample initial progress record
        prog_id = f"prog-{learner_id}-{course_1_id}"
        self.progress[prog_id] = ProgressRecord(
            id=prog_id,
            learner_id=learner_id,
            course_id=course_1_id,
            completed_lesson_ids=["les-1-1"],
            completed_quiz_ids=[],
            completed_assessment_ids=[],
            completed_challenge_ids=[],
            completed_problem_ids=[],
            quiz_scores={},
            assessment_scores={},
            overall_percentage=25.0,
            last_activity=datetime.utcnow().isoformat()
        )

        # Sample seed notification
        self.notifications.append(
            Notification(
                id="notif-001",
                user_id=learner_id,
                title="Welcome to the Platform!",
                message="You have been automatically enrolled in 'Quantum Computing Foundations & Qiskit Algorithms'. Explore your lessons and complete your first quiz.",
                type="info",
                link=f"/learner/course/{course_1_id}",
                created_at=datetime.utcnow().isoformat()
            )
        )
        self.notifications.append(
            Notification(
                id="notif-002",
                user_id=trainer_id,
                title="New Student Enrolled",
                message="Alex Rivera has enrolled in 'Quantum Computing Foundations & Qiskit Algorithms'.",
                type="success",
                link="/trainer/learners",
                created_at=datetime.utcnow().isoformat()
            )
        )

    # User Methods
    def get_user_by_email(self, email: str) -> Optional[User]:
        for u in self.users.values():
            if u.email.lower().strip() == email.lower().strip():
                return u
        return None

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        return self.users.get(user_id)

    def create_user(self, user: User) -> User:
        self.users[user.id] = user
        self.save()
        return user

    def update_user(self, user_id: str, updates: Dict[str, Any]) -> Optional[User]:
        if user_id in self.users:
            u_dict = self.users[user_id].model_dump()
            u_dict.update(updates)
            self.users[user_id] = User(**u_dict)
            self.save()
            return self.users[user_id]
        return None

    # Course Methods
    def get_all_courses(self, published_only: bool = False) -> List[Course]:
        courses = list(self.courses.values())
        if published_only:
            return [c for c in courses if c.is_published]
        return courses

    def get_courses_by_trainer(self, trainer_id: str) -> List[Course]:
        return [c for c in self.courses.values() if c.trainer_id == trainer_id]

    def get_course_by_id(self, course_id: str) -> Optional[Course]:
        return self.courses.get(course_id)

    def save_course(self, course: Course) -> Course:
        self.courses[course.id] = course
        self.save()
        return course

    def delete_course(self, course_id: str) -> bool:
        if course_id in self.courses:
            del self.courses[course_id]
            self.save()
            return True
        return False

    # Enrollment & Progress
    def get_enrollments_by_learner(self, learner_id: str) -> List[Enrollment]:
        return [e for e in self.enrollments.values() if e.learner_id == learner_id]

    def get_enrollments_by_course(self, course_id: str) -> List[Enrollment]:
        return [e for e in self.enrollments.values() if e.course_id == course_id]

    def get_enrollment(self, learner_id: str, course_id: str) -> Optional[Enrollment]:
        for e in self.enrollments.values():
            if e.learner_id == learner_id and e.course_id == course_id:
                return e
        return None

    def enroll_learner(self, learner_id: str, course_id: str) -> Enrollment:
        existing = self.get_enrollment(learner_id, course_id)
        if existing:
            return existing
        learner = self.get_user_by_id(learner_id)
        course = self.get_course_by_id(course_id)
        if not learner or not course:
            raise ValueError("Invalid learner or course ID")
        
        eid = f"enr-{learner_id}-{course_id}"
        enr = Enrollment(
            id=eid,
            learner_id=learner_id,
            learner_name=learner.name,
            learner_email=learner.email,
            course_id=course_id,
            course_title=course.title,
            enrolled_at=datetime.utcnow().isoformat(),
            status="active"
        )
        self.enrollments[eid] = enr

        # Init progress if not exists
        prog_id = f"prog-{learner_id}-{course_id}"
        if prog_id not in self.progress:
            self.progress[prog_id] = ProgressRecord(
                id=prog_id,
                learner_id=learner_id,
                course_id=course_id,
                completed_lesson_ids=[],
                completed_quiz_ids=[],
                completed_assessment_ids=[],
                completed_challenge_ids=[],
                completed_problem_ids=[],
                quiz_scores={},
                assessment_scores={},
                overall_percentage=0.0,
                last_activity=datetime.utcnow().isoformat()
            )

        # Notify Trainer
        self.create_notification(
            user_id=course.trainer_id,
            title="New Student Enrolled",
            message=f"{learner.name} just enrolled in '{course.title}'.",
            type="success",
            link="/trainer/learners"
        )
        # Notify Student
        self.create_notification(
            user_id=learner.id,
            title="Course Enrollment Confirmed",
            message=f"You have successfully enrolled in '{course.title}'. Start your learning journey now!",
            type="info",
            link=f"/learner/course/{course_id}"
        )

        self.save()
        return enr

    def get_progress(self, learner_id: str, course_id: str) -> ProgressRecord:
        prog_id = f"prog-{learner_id}-{course_id}"
        if prog_id in self.progress:
            return self.progress[prog_id]
        rec = ProgressRecord(
            id=prog_id,
            learner_id=learner_id,
            course_id=course_id,
            completed_lesson_ids=[],
            completed_quiz_ids=[],
            completed_assessment_ids=[],
            completed_challenge_ids=[],
            completed_problem_ids=[],
            quiz_scores={},
            assessment_scores={},
            overall_percentage=0.0,
            last_activity=datetime.utcnow().isoformat()
        )
        self.progress[prog_id] = rec
        self.save()
        return rec

    def update_progress(self, learner_id: str, course_id: str, completed_lesson_id: Optional[str] = None,
                        completed_quiz_id: Optional[str] = None, quiz_score: Optional[float] = None,
                        completed_assessment_id: Optional[str] = None, assessment_score: Optional[float] = None,
                        completed_challenge_id: Optional[str] = None, completed_problem_id: Optional[str] = None) -> ProgressRecord:
        rec = self.get_progress(learner_id, course_id)
        course = self.get_course_by_id(course_id)
        
        if completed_lesson_id and completed_lesson_id not in rec.completed_lesson_ids:
            rec.completed_lesson_ids.append(completed_lesson_id)
        
        if completed_quiz_id:
            if completed_quiz_id not in rec.completed_quiz_ids:
                rec.completed_quiz_ids.append(completed_quiz_id)
            if quiz_score is not None:
                rec.quiz_scores[completed_quiz_id] = quiz_score

        if completed_assessment_id:
            if completed_assessment_id not in rec.completed_assessment_ids:
                rec.completed_assessment_ids.append(completed_assessment_id)
            if assessment_score is not None:
                rec.assessment_scores[completed_assessment_id] = assessment_score

        if completed_challenge_id and completed_challenge_id not in rec.completed_challenge_ids:
            rec.completed_challenge_ids.append(completed_challenge_id)

        if completed_problem_id and completed_problem_id not in rec.completed_problem_ids:
            rec.completed_problem_ids.append(completed_problem_id)

        # Calculate percentage
        if course:
            total_items = 0
            for m in course.modules:
                total_items += len(m.lessons)
            total_items += len(course.quizzes)
            total_items += len(course.assessments)
            total_items += len(course.challenges)
            total_items += len(course.problems)

            completed_items = (
                len(rec.completed_lesson_ids) +
                len(rec.completed_quiz_ids) +
                len(rec.completed_assessment_ids) +
                len(rec.completed_challenge_ids) +
                len(rec.completed_problem_ids)
            )
            rec.overall_percentage = round(min(100.0, (completed_items / max(1, total_items)) * 100.0), 1)

        rec.last_activity = datetime.utcnow().isoformat()
        self.progress[rec.id] = rec
        self.save()
        return rec

    # Submissions
    def submit_assessment(self, submission: Submission) -> Submission:
        self.submissions[submission.id] = submission
        self.save()

        # Notify Trainer of submission
        course = self.get_course_by_id(submission.course_id)
        if course:
            self.create_notification(
                user_id=course.trainer_id,
                title="New Assessment Submission",
                message=f"{submission.learner_name} submitted answers for assessment '{submission.assessment_title}'. Ready for grading.",
                type="info",
                link="/trainer/assessments"
            )
        return submission

    def get_submissions_by_course(self, course_id: str) -> List[Submission]:
        return [s for s in self.submissions.values() if s.course_id == course_id]

    def get_submissions_by_learner(self, learner_id: str) -> List[Submission]:
        return [s for s in self.submissions.values() if s.learner_id == learner_id]

    def get_submission_by_id(self, submission_id: str) -> Optional[Submission]:
        return self.submissions.get(submission_id)

    def grade_submission(self, submission_id: str, score: float, feedback: str, graded_by: str) -> Optional[Submission]:
        sub = self.submissions.get(submission_id)
        if sub:
            sub.score = score
            sub.feedback = feedback
            sub.graded_by = graded_by
            sub.graded_at = datetime.utcnow().isoformat()
            sub.status = "graded"
            self.save()

            # Update learner's progress
            self.update_progress(
                learner_id=sub.learner_id,
                course_id=sub.course_id,
                completed_assessment_id=sub.assessment_id,
                assessment_score=score
            )

            # Notify learner
            self.create_notification(
                user_id=sub.learner_id,
                title="Assessment Graded",
                message=f"Your submission for '{sub.assessment_title}' has been graded! Score: {score}. Feedback: {feedback}",
                type="success",
                link=f"/learner/course/{sub.course_id}"
            )
            return sub
        return None

    # Notifications
    def create_notification(self, user_id: str, title: str, message: str, type: str = "info", link: Optional[str] = None) -> Notification:
        notif = Notification(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            link=link,
            is_read=False,
            created_at=datetime.utcnow().isoformat()
        )
        self.notifications.insert(0, notif)
        self.save()
        return notif

    def get_notifications(self, user_id: str) -> List[Notification]:
        return [n for n in self.notifications if n.user_id == user_id]

    def mark_notifications_read(self, user_id: str) -> int:
        count = 0
        for n in self.notifications:
            if n.user_id == user_id and not n.is_read:
                n.is_read = True
                count += 1
        if count > 0:
            self.save()
        return count


# Singleton instance
store = PlatformStore()
