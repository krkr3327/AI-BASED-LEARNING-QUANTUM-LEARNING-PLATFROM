<?php
/**
 * Database Schema Initializer & Data Seeder
 */

require_once __DIR__ . '/../../config/database.php';

class Schema {
    public static function initialize(): void {
        $pdo = Database::getConnection();

        // 1. Users Table
        $pdo->exec("CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(32) NOT NULL,
            phone VARCHAR(64) DEFAULT '',
            avatar TEXT DEFAULT '',
            bio TEXT DEFAULT '',
            expertise TEXT DEFAULT '[]',
            created_at VARCHAR(64) NOT NULL
        );");

        // 2. Courses Table
        $pdo->exec("CREATE TABLE IF NOT EXISTS courses (
            id VARCHAR(64) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT DEFAULT '',
            category VARCHAR(128) DEFAULT 'Quantum Computing',
            level VARCHAR(64) DEFAULT 'Beginner',
            duration VARCHAR(64) DEFAULT '4 Weeks',
            thumbnail TEXT DEFAULT '',
            trainer_id VARCHAR(64) NOT NULL,
            trainer_name VARCHAR(255) NOT NULL,
            is_published INTEGER DEFAULT 1,
            created_at VARCHAR(64) NOT NULL
        );");

        // 3. Modules Table
        $pdo->exec("CREATE TABLE IF NOT EXISTS modules (
            id VARCHAR(64) PRIMARY KEY,
            course_id VARCHAR(64) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT DEFAULT '',
            order_num INTEGER DEFAULT 1
        );");

        // 4. Lessons Table
        $pdo->exec("CREATE TABLE IF NOT EXISTS lessons (
            id VARCHAR(64) PRIMARY KEY,
            module_id VARCHAR(64) NOT NULL,
            course_id VARCHAR(64) NOT NULL,
            title VARCHAR(255) NOT NULL,
            type VARCHAR(32) DEFAULT 'theory',
            duration VARCHAR(64) DEFAULT '15 min',
            video_url TEXT DEFAULT '',
            content TEXT DEFAULT '',
            order_num INTEGER DEFAULT 1
        );");

        // 5. Notes Table
        $pdo->exec("CREATE TABLE IF NOT EXISTS notes (
            id VARCHAR(64) PRIMARY KEY,
            course_id VARCHAR(64) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT DEFAULT '',
            file_url TEXT DEFAULT '#',
            file_name VARCHAR(255) DEFAULT 'Document.pdf',
            uploaded_at VARCHAR(64) NOT NULL
        );");

        // 6. Quizzes Table
        $pdo->exec("CREATE TABLE IF NOT EXISTS quizzes (
            id VARCHAR(64) PRIMARY KEY,
            course_id VARCHAR(64) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT DEFAULT '',
            time_limit_mins INTEGER DEFAULT 15,
            passing_score REAL DEFAULT 70.0,
            questions_json TEXT DEFAULT '[]',
            created_at VARCHAR(64) NOT NULL
        );");

        // 7. Assessments Table
        $pdo->exec("CREATE TABLE IF NOT EXISTS assessments (
            id VARCHAR(64) PRIMARY KEY,
            course_id VARCHAR(64) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT DEFAULT '',
            deadline VARCHAR(64) DEFAULT '',
            total_marks REAL DEFAULT 100.0,
            instructions TEXT DEFAULT '',
            questions_json TEXT DEFAULT '[]',
            created_at VARCHAR(64) NOT NULL
        );");

        // 8. Challenges Table
        $pdo->exec("CREATE TABLE IF NOT EXISTS challenges (
            id VARCHAR(64) PRIMARY KEY,
            course_id VARCHAR(64) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT DEFAULT '',
            difficulty VARCHAR(64) DEFAULT 'Intermediate',
            xp_reward INTEGER DEFAULT 100,
            starter_code TEXT DEFAULT '',
            test_cases_json TEXT DEFAULT '[]',
            hints_json TEXT DEFAULT '[]'
        );");

        // 9. Problems Table
        $pdo->exec("CREATE TABLE IF NOT EXISTS problems (
            id VARCHAR(64) PRIMARY KEY,
            course_id VARCHAR(64) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT DEFAULT '',
            difficulty VARCHAR(64) DEFAULT 'Medium',
            starter_code TEXT DEFAULT '',
            test_cases_json TEXT DEFAULT '[]'
        );");

        // 10. Enrollments Table
        $pdo->exec("CREATE TABLE IF NOT EXISTS enrollments (
            id VARCHAR(64) PRIMARY KEY,
            learner_id VARCHAR(64) NOT NULL,
            learner_name VARCHAR(255) NOT NULL,
            learner_email VARCHAR(255) NOT NULL,
            course_id VARCHAR(64) NOT NULL,
            course_title VARCHAR(255) NOT NULL,
            enrolled_at VARCHAR(64) NOT NULL,
            status VARCHAR(32) DEFAULT 'active'
        );");

        // 11. Progress Table
        $pdo->exec("CREATE TABLE IF NOT EXISTS progress (
            id VARCHAR(64) PRIMARY KEY,
            learner_id VARCHAR(64) NOT NULL,
            course_id VARCHAR(64) NOT NULL,
            completed_lesson_ids TEXT DEFAULT '[]',
            completed_quiz_ids TEXT DEFAULT '[]',
            completed_assessment_ids TEXT DEFAULT '[]',
            completed_challenge_ids TEXT DEFAULT '[]',
            completed_problem_ids TEXT DEFAULT '[]',
            quiz_scores TEXT DEFAULT '{}',
            assessment_scores TEXT DEFAULT '{}',
            overall_percentage REAL DEFAULT 0.0,
            last_activity VARCHAR(64) NOT NULL
        );");

        // 12. Submissions Table
        $pdo->exec("CREATE TABLE IF NOT EXISTS submissions (
            id VARCHAR(64) PRIMARY KEY,
            assessment_id VARCHAR(64) NOT NULL,
            assessment_title VARCHAR(255) NOT NULL,
            learner_id VARCHAR(64) NOT NULL,
            learner_name VARCHAR(255) NOT NULL,
            course_id VARCHAR(64) NOT NULL,
            answers TEXT DEFAULT '{}',
            score REAL DEFAULT NULL,
            feedback TEXT DEFAULT '',
            graded_by VARCHAR(255) DEFAULT '',
            graded_at VARCHAR(64) DEFAULT '',
            submitted_at VARCHAR(64) NOT NULL,
            status VARCHAR(32) DEFAULT 'submitted'
        );");

        // 13. Notifications Table
        $pdo->exec("CREATE TABLE IF NOT EXISTS notifications (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(32) DEFAULT 'info',
            link TEXT DEFAULT '',
            is_read INTEGER DEFAULT 0,
            created_at VARCHAR(64) NOT NULL
        );");

        // Seed default demo data if empty
        self::seedDefaultData($pdo);
    }

    private static function seedDefaultData(PDO $pdo): void {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
        $userCount = $stmt->fetch()['count'] ?? 0;

        if ($userCount == 0) {
            $now = date('c');

            // 1. Trainer Seed
            $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role, phone, avatar, bio, expertise, created_at)
                VALUES (:id, :name, :email, :password, :role, :phone, :avatar, :bio, :expertise, :created_at)");
            $stmt->execute([
                ':id' => 'trainer-001',
                ':name' => 'Prof. Sarah Jenkins',
                ':email' => 'trainer@platform.edu',
                ':password' => 'trainer123',
                ':role' => 'trainer',
                ':phone' => '+1 (555) 234-5678',
                ':avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                ':bio' => 'Lead Senior Quantum & AI Systems Instructor with 12+ years of research and curriculum development experience.',
                ':expertise' => json_encode(["Quantum Computing", "Python Data Science", "Algorithm Optimization", "Cloud Architectures"]),
                ':created_at' => $now
            ]);

            // 2. Student Seed
            $stmt->execute([
                ':id' => 'learner-001',
                ':name' => 'Alex Rivera',
                ':email' => 'student@platform.edu',
                ':password' => 'student123',
                ':role' => 'learner',
                ':phone' => '+1 (555) 987-6543',
                ':avatar' => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
                ':bio' => 'Aspiring Quantum Software Engineer & Machine Learning enthusiast.',
                ':expertise' => json_encode(["Quantum Computing", "Python"]),
                ':created_at' => $now
            ]);

            // 3. Course 1 Seed
            $c1_id = 'crs-qnt-101';
            $stmt = $pdo->prepare("INSERT INTO courses (id, title, description, category, level, duration, thumbnail, trainer_id, trainer_name, is_published, created_at)
                VALUES (:id, :title, :description, :category, :level, :duration, :thumbnail, :trainer_id, :trainer_name, :is_published, :created_at)");
            $stmt->execute([
                ':id' => $c1_id,
                ':title' => 'Quantum Computing Foundations & Qiskit Algorithms',
                ':description' => 'Master the fundamental mechanics of quantum states, superposition, entanglement, and build executable quantum circuits.',
                ':category' => 'Quantum Computing',
                ':level' => 'Beginner to Intermediate',
                ':duration' => '6 Weeks (24 Hours)',
                ':thumbnail' => 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
                ':trainer_id' => 'trainer-001',
                ':trainer_name' => 'Prof. Sarah Jenkins',
                ':is_published' => 1,
                ':created_at' => $now
            ]);

            // Modules for Course 1
            $pdo->exec("INSERT INTO modules (id, course_id, title, description, order_num) VALUES
                ('mod-1', '{$c1_id}', 'Module 1: Superposition and Quantum Bits (Qubits)', 'Mathematical representations of state vectors and single-qubit rotations.', 1),
                ('mod-2', '{$c1_id}', 'Module 2: Entanglement & Bell State Circuits', 'Two-qubit interactions, CNOT gates, and EPR pair creation.', 2);");

            // Lessons for Course 1
            $theory1 = "# Introduction to Qubits & The Bloch Sphere\n\nIn classical computation, the fundamental unit is the **bit** (0 or 1).\nIn quantum computing, the fundamental unit is the **qubit** in superposition:\n\n$$|\\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle$$\n\nWhere $|\\alpha|^2 + |\\beta|^2 = 1$.";
            $stmt = $pdo->prepare("INSERT INTO lessons (id, module_id, course_id, title, type, duration, video_url, content, order_num) VALUES
                (:id1, 'mod-1', :c1, 'Introduction to Qubits & The Bloch Sphere', 'theory', '18 min', '', :t1, 1),
                (:id2, 'mod-1', :c1, 'Quantum Gates & State Rotations Walkthrough', 'video', '24 min', 'https://www.youtube.com/embed/QuRna36xnwk', 'Watch Prof. Jenkins demonstrate Pauli-X, Hadamard, and Phase gate applications.', 2),
                (:id3, 'mod-2', :c1, 'Constructing Bell States with Hadamard & CNOT', 'theory', '22 min', '', 'Entanglement creates inseparable quantum state vectors.', 1);");
            $stmt->execute([
                ':id1' => 'les-1-1',
                ':id2' => 'les-1-2',
                ':id3' => 'les-2-1',
                ':c1' => $c1_id,
                ':t1' => $theory1
            ]);

            // Notes for Course 1
            $pdo->exec("INSERT INTO notes (id, course_id, title, description, file_url, file_name, uploaded_at) VALUES
                ('not-1', '{$c1_id}', 'Complete Quantum Gates Matrix Cheatsheet & Dirac Notation', 'Comprehensive reference PDF summary containing unitary matrices for H, X, Y, Z, CNOT, and Toffoli gates.', 'https://raw.githubusercontent.com/qiskit-community/qiskit-translations/master/docs/cheatsheet/cheatsheet.pdf', 'Quantum_Gates_Cheatsheet.pdf', '{$now}');");

            // Quizzes for Course 1
            $quizQuestions = json_encode([
                [
                    "id" => "q1-1",
                    "question" => "If a normalized state is given by |ψ⟩ = 1/2|0⟩ + c|1⟩, what is |c|^2?",
                    "options" => ["0.25", "0.50", "0.75", "1.00"],
                    "correct_answer_index" => 2,
                    "explanation" => "Because (1/2)^2 + |c|^2 = 1 => 1/4 + |c|^2 = 1 => |c|^2 = 0.75."
                ],
                [
                    "id" => "q1-2",
                    "question" => "Which quantum logic gate transforms |0⟩ into (|0⟩ + |1⟩)/√2?",
                    "options" => ["Pauli-X Gate", "Hadamard (H) Gate", "Phase (S) Gate", "Controlled-Z Gate"],
                    "correct_answer_index" => 1,
                    "explanation" => "The Hadamard gate creates an equal superposition of |0⟩ and |1⟩."
                ]
            ]);
            $stmt = $pdo->prepare("INSERT INTO quizzes (id, course_id, title, description, time_limit_mins, passing_score, questions_json, created_at)
                VALUES ('quiz-1', :cid, 'Qubit Superposition & Gate Algebra Knowledge Check', 'Test your conceptual understanding of normalization and unitary transformations.', 15, 70.0, :qjson, :created_at)");
            $stmt->execute([':cid' => $c1_id, ':qjson' => $quizQuestions, ':created_at' => $now]);

            // Assessments for Course 1
            $asmQuestions = json_encode([
                [
                    "id" => "aq-1",
                    "question" => "Derive the output state vector when applying a Hadamard gate followed by a Pauli-Z gate to state |0⟩. Explain phase kickback.",
                    "max_marks" => 20.0,
                    "guidelines" => "Show Hadamard transformation to (|0>+|1>)/sqrt(2), then apply Z matrix."
                ],
                [
                    "id" => "aq-2",
                    "question" => "Explain how the No-Cloning Theorem prevents duplication of an unknown quantum state.",
                    "max_marks" => 30.0,
                    "guidelines" => "Mention linearity of unitary operations."
                ]
            ]);
            $stmt = $pdo->prepare("INSERT INTO assessments (id, course_id, title, description, deadline, total_marks, instructions, questions_json, created_at)
                VALUES ('asm-1', :cid, 'Mid-Term Theoretical Assessment: Quantum Entanglement', 'Formal assessment evaluating circuit synthesis and Bell state analysis.', '2026-12-31T23:59:59', 50.0, 'Answer all descriptive questions clearly.', :aqjson, :created_at)");
            $stmt->execute([':cid' => $c1_id, ':aqjson' => $asmQuestions, ':created_at' => $now]);

            // Challenges for Course 1
            $starterCode = "def quantum_teleportation_circuit(alpha, beta):\n    # TODO: Implement quantum teleportation circuit\n    pass\n";
            $stmt = $pdo->prepare("INSERT INTO challenges (id, course_id, title, description, difficulty, xp_reward, starter_code, test_cases_json, hints_json)
                VALUES ('ch-1', :cid, 'Hands-On Challenge: Quantum Teleportation Protocol', 'Implement 3-qubit teleportation circuit.', 'Intermediate', 250, :starter, '[]', :hints)");
            $stmt->execute([
                ':cid' => $c1_id,
                ':starter' => $starterCode,
                ':hints' => json_encode(["Use an entangled EPR pair between Alice and Bob."])
            ]);

            // Auto-enroll learner in Course 1
            $pdo->exec("INSERT INTO enrollments (id, learner_id, learner_name, learner_email, course_id, course_title, enrolled_at, status) VALUES
                ('enr-learner-001-{$c1_id}', 'learner-001', 'Alex Rivera', 'student@platform.edu', '{$c1_id}', 'Quantum Computing Foundations & Qiskit Algorithms', '{$now}', 'active');");

            $pdo->exec("INSERT INTO progress (id, learner_id, course_id, completed_lesson_ids, completed_quiz_ids, completed_assessment_ids, completed_challenge_ids, completed_problem_ids, quiz_scores, assessment_scores, overall_percentage, last_activity) VALUES
                ('prog-learner-001-{$c1_id}', 'learner-001', '{$c1_id}', '[\"les-1-1\"]', '[]', '[]', '[]', '[]', '{}', '{}', 25.0, '{$now}');");

            // Seed Notifications
            $pdo->exec("INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at) VALUES
                ('notif-1', 'learner-001', 'Welcome to the Platform!', 'You are enrolled in Quantum Computing Foundations. Start learning now!', 'info', '/learner/course/{$c1_id}', 0, '{$now}'),
                ('notif-2', 'trainer-001', 'New Student Enrolled', 'Alex Rivera enrolled in Quantum Computing Foundations.', 'success', '/trainer/learners', 0, '{$now}');");
        }
    }
}
