<?php
/**
 * Progress Controller — Course Enrollments, Lesson Completion, Progress Calculation & Oversight
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Utils/Response.php';
require_once __DIR__ . '/../Utils/Auth.php';
require_once __DIR__ . '/../Utils/Router.php';

class ProgressController {
    public function enroll(array $params): void {
        $courseId = $params['course_id'];
        $user = Auth::getCurrentUser() ?: ['id' => 'learner-001', 'name' => 'Alex Rivera', 'email' => 'student@platform.edu'];
        $now = date('c');

        $pdo = Database::getConnection();

        // Check course exists
        $stmtC = $pdo->prepare("SELECT * FROM courses WHERE id = :id");
        $stmtC->execute([':id' => $courseId]);
        $course = $stmtC->fetch();
        if (!$course) {
            Response::notFound("Course not found");
        }

        // Check existing enrollment
        $stmtE = $pdo->prepare("SELECT * FROM enrollments WHERE learner_id = :lid AND course_id = :cid");
        $stmtE->execute([':lid' => $user['id'], ':cid' => $courseId]);
        $existing = $stmtE->fetch();
        if ($existing) {
            Response::json($existing);
        }

        $eid = 'enr-' . $user['id'] . '-' . $courseId;
        $stmt = $pdo->prepare("INSERT INTO enrollments (id, learner_id, learner_name, learner_email, course_id, course_title, enrolled_at, status)
            VALUES (:id, :lid, :lname, :lemail, :cid, :ctitle, :now, 'active')");
        $stmt->execute([
            ':id' => $eid,
            ':lid' => $user['id'],
            ':lname' => $user['name'],
            ':lemail' => $user['email'] ?? 'student@platform.edu',
            ':cid' => $courseId,
            ':ctitle' => $course['title'],
            ':now' => $now
        ]);

        // Initialize progress if not exists
        $stmtP = $pdo->prepare("SELECT id FROM progress WHERE learner_id = :lid AND course_id = :cid");
        $stmtP->execute([':lid' => $user['id'], ':cid' => $courseId]);
        if (!$stmtP->fetch()) {
            $pid = 'prog-' . $user['id'] . '-' . $courseId;
            $pdo->prepare("INSERT INTO progress (id, learner_id, course_id, completed_lesson_ids, completed_quiz_ids, completed_assessment_ids, completed_challenge_ids, completed_problem_ids, quiz_scores, assessment_scores, overall_percentage, last_activity)
                VALUES (:id, :lid, :cid, '[]', '[]', '[]', '[]', '[]', '{}', '{}', 0.0, :now)")
                ->execute([':id' => $pid, ':lid' => $user['id'], ':cid' => $courseId, ':now' => $now]);
        }

        // Notify Trainer
        $pdo->prepare("INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
            VALUES (:id, :uid, :title, :msg, 'success', '/trainer/learners', 0, :now)")
            ->execute([
                ':id' => 'notif-' . uniqid(),
                ':uid' => $course['trainer_id'],
                ':title' => 'New Student Enrolled',
                ':msg' => "{$user['name']} enrolled in '{$course['title']}'.",
                ':now' => $now
            ]);

        $enr = [
            'id' => $eid,
            'learner_id' => $user['id'],
            'learner_name' => $user['name'],
            'learner_email' => $user['email'] ?? 'student@platform.edu',
            'course_id' => $courseId,
            'course_title' => $course['title'],
            'enrolled_at' => $now,
            'status' => 'active'
        ];

        Response::json($enr, 201);
    }

    public function getMyEnrollments(): void {
        $user = Auth::getCurrentUser() ?: ['id' => 'learner-001'];
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM enrollments WHERE learner_id = :lid ORDER BY enrolled_at DESC");
        $stmt->execute([':lid' => $user['id']]);
        $enrollments = $stmt->fetchAll();
        Response::json($enrollments);
    }

    public function getProgress(array $params): void {
        $courseId = $params['course_id'];
        $user = Auth::getCurrentUser() ?: ['id' => 'learner-001'];
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("SELECT * FROM progress WHERE learner_id = :lid AND course_id = :cid");
        $stmt->execute([':lid' => $user['id'], ':cid' => $courseId]);
        $prog = $stmt->fetch();

        if ($prog) {
            $prog['completed_lesson_ids'] = json_decode($prog['completed_lesson_ids'] ?? '[]', true) ?: [];
            $prog['completed_quiz_ids'] = json_decode($prog['completed_quiz_ids'] ?? '[]', true) ?: [];
            $prog['completed_assessment_ids'] = json_decode($prog['completed_assessment_ids'] ?? '[]', true) ?: [];
            $prog['completed_challenge_ids'] = json_decode($prog['completed_challenge_ids'] ?? '[]', true) ?: [];
            $prog['completed_problem_ids'] = json_decode($prog['completed_problem_ids'] ?? '[]', true) ?: [];
            $prog['quiz_scores'] = json_decode($prog['quiz_scores'] ?? '{}', true) ?: [];
            $prog['assessment_scores'] = json_decode($prog['assessment_scores'] ?? '{}', true) ?: [];
            $prog['overall_percentage'] = (float)$prog['overall_percentage'];
            Response::json($prog);
        }

        // Return fresh default record
        Response::json([
            'id' => 'prog-' . $user['id'] . '-' . $courseId,
            'learner_id' => $user['id'],
            'course_id' => $courseId,
            'completed_lesson_ids' => [],
            'completed_quiz_ids' => [],
            'completed_assessment_ids' => [],
            'completed_challenge_ids' => [],
            'completed_problem_ids' => [],
            'quiz_scores' => (object)[],
            'assessment_scores' => (object)[],
            'overall_percentage' => 0.0,
            'last_activity' => date('c')
        ]);
    }

    public function markLessonComplete(array $params): void {
        $courseId = $params['course_id'];
        $body = Router::getJsonBody();
        $lessonId = $body['lesson_id'] ?? '';
        $user = Auth::getCurrentUser() ?: ['id' => 'learner-001'];
        $now = date('c');

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM progress WHERE learner_id = :lid AND course_id = :cid");
        $stmt->execute([':lid' => $user['id'], ':cid' => $courseId]);
        $prog = $stmt->fetch();

        $completedLessons = [];
        if ($prog) {
            $completedLessons = json_decode($prog['completed_lesson_ids'] ?? '[]', true) ?: [];
            if (!in_array($lessonId, $completedLessons)) {
                $completedLessons[] = $lessonId;
            }

            // Calculate percentage
            $stmtTotal = $pdo->prepare("SELECT COUNT(*) as count FROM lessons WHERE course_id = :cid");
            $stmtTotal->execute([':cid' => $courseId]);
            $totalLessons = max(1, (int)($stmtTotal->fetch()['count'] ?? 1));
            $percentage = round(min(100.0, (count($completedLessons) / $totalLessons) * 100.0), 1);

            $stmtUpdate = $pdo->prepare("UPDATE progress SET completed_lesson_ids = :lids, overall_percentage = :pct, last_activity = :now WHERE id = :id");
            $stmtUpdate->execute([
                ':lids' => json_encode($completedLessons),
                ':pct' => $percentage,
                ':now' => $now,
                ':id' => $prog['id']
            ]);
        }

        $this->getProgress(['course_id' => $courseId]);
    }

    public function getTrainerLearnersOverview(): void {
        $user = Auth::getCurrentUser() ?: ['id' => 'trainer-001'];
        $pdo = Database::getConnection();

        // Get courses by this trainer
        $stmtC = $pdo->prepare("SELECT id, title FROM courses WHERE trainer_id = :tid");
        $stmtC->execute([':tid' => $user['id']]);
        $courses = $stmtC->fetchAll();
        $courseIds = array_column($courses, 'id');

        $learners = [];
        if (!empty($courseIds)) {
            $inClause = implode(',', array_fill(0, count($courseIds), '?'));
            $stmtEnr = $pdo->prepare("SELECT * FROM enrollments WHERE course_id IN ({$inClause}) ORDER BY enrolled_at DESC");
            $stmtEnr->execute($courseIds);
            $enrollments = $stmtEnr->fetchAll();

            foreach ($enrollments as $enr) {
                $stmtProg = $pdo->prepare("SELECT * FROM progress WHERE learner_id = :lid AND course_id = :cid");
                $stmtProg->execute([':lid' => $enr['learner_id'], ':cid' => $enr['course_id']]);
                $prog = $stmtProg->fetch();

                $completedLessons = json_decode($prog['completed_lesson_ids'] ?? '[]', true) ?: [];
                $completedQuizzes = json_decode($prog['completed_quiz_ids'] ?? '[]', true) ?: [];

                $learners[] = [
                    'enrollment_id' => $enr['id'],
                    'learner_id' => $enr['learner_id'],
                    'learner_name' => $enr['learner_name'],
                    'learner_email' => $enr['learner_email'],
                    'course_id' => $enr['course_id'],
                    'course_title' => $enr['course_title'],
                    'enrolled_at' => $enr['enrolled_at'],
                    'progress_percentage' => (float)($prog['overall_percentage'] ?? 0.0),
                    'completed_lessons' => count($completedLessons),
                    'completed_quizzes' => count($completedQuizzes),
                    'last_active' => $prog['last_activity'] ?? $enr['enrolled_at']
                ];
            }
        }

        $stmtSubs = $pdo->query("SELECT COUNT(*) as count FROM submissions");
        $totalSubmissions = (int)($stmtSubs->fetch()['count'] ?? 0);

        Response::json([
            'total_courses' => count($courses),
            'total_enrollments' => count($learners),
            'total_submissions' => $totalSubmissions,
            'learners' => $learners
        ]);
    }
}
