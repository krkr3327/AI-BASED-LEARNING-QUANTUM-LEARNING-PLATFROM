<?php
/**
 * FileStore — File-based Data Storage Manager
 * 
 * Automatically persists and synchronizes all backend data into plain, 
 * human-readable JSON files inside the `php_backend/data/` folder.
 */

class FileStore {
    private static string $dataDir = '';

    public static function init(): void {
        self::$dataDir = dirname(__DIR__, 2) . '/data';
        if (!file_exists(self::$dataDir)) {
            @mkdir(self::$dataDir, 0777, true);
        }

        // Initialize default seed files if they don't exist
        self::ensureFile('users.json', [
            [
                'id' => 'trainer-001',
                'name' => 'Prof. Sarah Jenkins',
                'email' => 'trainer@platform.edu',
                'password' => 'trainer123',
                'role' => 'trainer',
                'phone' => '+1 (555) 234-5678',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                'bio' => 'Lead Senior Quantum & AI Systems Instructor with 12+ years of research.',
                'expertise' => ['Quantum Computing', 'Python Data Science', 'Algorithms'],
                'created_at' => date('c')
            ],
            [
                'id' => 'learner-001',
                'name' => 'Alex Rivera',
                'email' => 'student@platform.edu',
                'password' => 'student123',
                'role' => 'learner',
                'phone' => '+1 (555) 987-6543',
                'avatar' => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
                'bio' => 'Aspiring Quantum Software Engineer & Machine Learning enthusiast.',
                'expertise' => [],
                'created_at' => date('c')
            ]
        ]);

        self::ensureFile('courses.json', [
            [
                'id' => 'course-001',
                'title' => 'Quantum Computing Fundamentals (Qubit Mastery)',
                'description' => 'Comprehensive beginner course on quantum mechanics, superposition, Bloch sphere representations, and foundational single-qubit quantum gates.',
                'level' => 'beginner',
                'duration' => '4 Weeks (12 Hours)',
                'trainer_id' => 'trainer-001',
                'is_published' => true,
                'thumbnail' => 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
                'created_at' => date('c')
            ],
            [
                'id' => 'course-002',
                'title' => 'Quantum Multi-Qubit Entanglement & Quantum Teleportation',
                'description' => 'Master Bell States, CNOT gate logic, Superdense coding, and multi-qubit circuit entanglement algorithms.',
                'level' => 'intermediate',
                'duration' => '6 Weeks (18 Hours)',
                'trainer_id' => 'trainer-001',
                'is_published' => true,
                'thumbnail' => 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
                'created_at' => date('c')
            ],
            [
                'id' => 'course-003',
                'title' => 'Advanced Quantum Phase Estimation, Shor\'s & Grover\'s Algorithms',
                'description' => 'In-depth algorithmic analysis of quantum Fourier transforms, Grover search amplitude amplification, and Shor prime factorization.',
                'level' => 'advanced',
                'duration' => '8 Weeks (24 Hours)',
                'trainer_id' => 'trainer-001',
                'is_published' => true,
                'thumbnail' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
                'created_at' => date('c')
            ]
        ]);

        self::ensureFile('quizzes.json', [
            [
                'id' => 'quiz-001',
                'course_id' => 'course-001',
                'title' => 'Qubit Superposition & Gate Logic Check',
                'time_limit' => 15,
                'passing_score' => 70,
                'created_at' => date('c')
            ]
        ]);

        self::ensureFile('assessments.json', [
            [
                'id' => 'assess-001',
                'course_id' => 'course-001',
                'title' => 'Unit 1 Midterm Written Assessment: Quantum Circuit Proofs',
                'description' => 'Provide rigorous mathematical solutions and circuit logic explanations for quantum state vectors.',
                'total_points' => 100,
                'passing_score' => 75,
                'created_at' => date('c')
            ]
        ]);

        self::ensureFile('challenges.json', [
            [
                'id' => 'chal-001',
                'title' => 'Bell State Entanglement Circuit Lab',
                'description' => 'Construct a two-qubit circuit that produces the maximally entangled Bell state (|00> + |11>)/sqrt(2).',
                'difficulty' => 'easy',
                'xp' => 150,
                'created_at' => date('c')
            ]
        ]);

        self::ensureFile('progress.json', []);
        self::ensureFile('submissions.json', []);
        self::ensureFile('notifications.json', []);
    }

    private static function ensureFile(string $filename, array $defaultData): void {
        $filePath = self::$dataDir . '/' . $filename;
        if (!file_exists($filePath)) {
            file_put_contents($filePath, json_encode($defaultData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        }
    }

    public static function read(string $filename): array {
        self::init();
        $filePath = self::$dataDir . '/' . $filename;
        if (!file_exists($filePath)) {
            return [];
        }
        $content = file_get_contents($filePath);
        return json_decode($content, true) ?: [];
    }

    public static function write(string $filename, array $data): bool {
        self::init();
        $filePath = self::$dataDir . '/' . $filename;
        return (bool) file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }

    public static function append(string $filename, array $item): bool {
        $items = self::read($filename);
        $items[] = $item;
        return self::write($filename, $items);
    }

    public static function updateWhere(string $filename, string $key, $value, array $updates): bool {
        $items = self::read($filename);
        foreach ($items as &$item) {
            if (isset($item[$key]) && $item[$key] == $value) {
                $item = array_merge($item, $updates);
            }
        }
        return self::write($filename, $items);
    }
}
