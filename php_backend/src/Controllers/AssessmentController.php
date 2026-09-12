<?php
/**
 * Assessment Controller — Written Exams, Student Submissions, and Live Grading Desk
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Utils/Response.php';
require_once __DIR__ . '/../Utils/Auth.php';
require_once __DIR__ . '/../Utils/Router.php';

class AssessmentController {
    public function addAssessment(array $params): void {
        $courseId = $params['course_id'];
        $body = Router::getJsonBody();
        $aid = 'asm-' . substr(md5(uniqid()), 0, 6);
        $now = date('c');

        $title = $body['title'] ?? 'Formal Assessment';
        $description = $body['description'] ?? '';
        $deadline = $body['deadline'] ?? '2026-12-31T23:59:59';
        $instructions = $body['instructions'] ?? 'Provide complete, structured answers.';
        $questions = $body['questions'] ?? [];
        $totalMarks = (float)($body['total_marks'] ?? 100.0);

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("INSERT INTO assessments (id, course_id, title, description, deadline, total_marks, instructions, questions_json, created_at)
            VALUES (:id, :cid, :title, :desc, :deadline, :marks, :inst, :qjson, :created_at)");
        $stmt->execute([
            ':id' => $aid,
            ':cid' => $courseId,
            ':title' => $title,
            ':desc' => $description,
            ':deadline' => $deadline,
            ':marks' => $totalMarks,
            ':inst' => $instructions,
            ':qjson' => json_encode($questions),
            ':created_at' => $now
        ]);

        $ctrl = new CourseController();
        $ctrl->getCourse(['course_id' => $courseId]);
    }

    public function deleteAssessment(array $params): void {
        $courseId = $params['course_id'];
        $asmId = $params['assessment_id'];

        $pdo = Database::getConnection();
        $pdo->prepare("DELETE FROM assessments WHERE id = :id AND course_id = :cid")->execute([':id' => $asmId, ':cid' => $courseId]);

        $ctrl = new CourseController();
        $ctrl->getCourse(['course_id' => $courseId]);
    }

    public function submitAssessment(array $params): void {
        $assessmentId = $params['assessment_id'];
        $body = Router::getJsonBody();
        $courseId = $body['course_id'] ?? '';
        $answers = $body['answers'] ?? [];

        $user = Auth::getCurrentUser() ?: ['id' => 'learner-001', 'name' => 'Alex Rivera', 'email' => 'student@platform.edu'];

        $pdo = Database::getConnection();
        $stmtAsm = $pdo->prepare("SELECT * FROM assessments WHERE id = :id");
        $stmtAsm->execute([':id' => $assessmentId]);
        $asm = $stmtAsm->fetch();

        if (!$asm) {
            Response::notFound("Assessment not found");
        }

        $subId = 'sub-' . substr(md5(uniqid()), 0, 8);
        $now = date('c');

        $stmt = $pdo->prepare("INSERT INTO submissions (id, assessment_id, assessment_title, learner_id, learner_name, course_id, answers, status, submitted_at)
            VALUES (:id, :aid, :title, :lid, :lname, :cid, :answers, 'submitted', :now)");
        $stmt->execute([
            ':id' => $subId,
            ':aid' => $assessmentId,
            ':title' => $asm['title'],
            ':lid' => $user['id'],
            ':lname' => $user['name'],
            ':cid' => $courseId ?: $asm['course_id'],
            ':answers' => json_encode($answers),
            ':now' => $now
        ]);

        // Notify Trainer of new submission
        $stmtC = $pdo->prepare("SELECT trainer_id, title FROM courses WHERE id = :cid");
        $stmtC->execute([':cid' => $asm['course_id']]);
        $c = $stmtC->fetch();
        if ($c) {
            $stmtNotif = $pdo->prepare("INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
                VALUES (:id, :uid, :title, :msg, 'info', '/trainer/assessments', 0, :now)");
            $stmtNotif->execute([
                ':id' => 'notif-' . uniqid(),
                ':uid' => $c['trainer_id'],
                ':title' => 'New Assessment Submission',
                ':msg' => "{$user['name']} submitted answers for '{$asm['title']}'. Ready for grading.",
                ':now' => $now
            ]);
        }

        $res = [
            'id' => $subId,
            'assessment_id' => $assessmentId,
            'assessment_title' => $asm['title'],
            'learner_id' => $user['id'],
            'learner_name' => $user['name'],
            'course_id' => $asm['course_id'],
            'answers' => $answers,
            'score' => null,
            'feedback' => null,
            'status' => 'submitted',
            'submitted_at' => $now
        ];

        Response::json($res, 201);
    }

    public function listSubmissions(): void {
        $courseId = $_GET['course_id'] ?? null;
        $learnerId = $_GET['learner_id'] ?? null;

        $pdo = Database::getConnection();
        $query = "SELECT * FROM submissions WHERE 1=1";
        $params = [];

        if ($courseId) {
            $query .= " AND course_id = :cid";
            $params[':cid'] = $courseId;
        }
        if ($learnerId) {
            $query .= " AND learner_id = :lid";
            $params[':lid'] = $learnerId;
        }

        $query .= " ORDER BY submitted_at DESC";
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $subs = $stmt->fetchAll();

        foreach ($subs as &$s) {
            $s['answers'] = json_decode($s['answers'] ?? '{}', true) ?: [];
            $s['score'] = $s['score'] !== null ? (float)$s['score'] : null;
        }

        Response::json($subs);
    }

    public function gradeSubmission(array $params): void {
        $subId = $params['submission_id'];
        $body = Router::getJsonBody();
        $score = (float)($body['score'] ?? 0.0);
        $feedback = trim($body['feedback'] ?? '');
        $user = Auth::getCurrentUser() ?: ['name' => 'Instructor'];
        $now = date('c');

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM submissions WHERE id = :id");
        $stmt->execute([':id' => $subId]);
        $sub = $stmt->fetch();

        if (!$sub) {
            Response::notFound("Submission not found");
        }

        $stmtUpdate = $pdo->prepare("UPDATE submissions SET score = :score, feedback = :feedback, graded_by = :graded_by, graded_at = :graded_at, status = 'graded' WHERE id = :id");
        $stmtUpdate->execute([
            ':score' => $score,
            ':feedback' => $feedback,
            ':graded_by' => $user['name'],
            ':graded_at' => $now,
            ':id' => $subId
        ]);

        // Update learner progress record
        $this->recordAssessmentProgress($pdo, $sub['learner_id'], $sub['course_id'], $sub['assessment_id'], $score);

        // Notify Student of grade
        $stmtNotif = $pdo->prepare("INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
            VALUES (:id, :uid, :title, :msg, 'success', :link, 0, :now)");
        $stmtNotif->execute([
            ':id' => 'notif-' . uniqid(),
            ':uid' => $sub['learner_id'],
            ':title' => 'Assessment Graded',
            ':msg' => "Your submission for '{$sub['assessment_title']}' has been graded! Score: {$score}. Feedback: {$feedback}",
            ':link' => "/learner/course/{$sub['course_id']}",
            ':now' => $now
        ]);

        $sub['score'] = $score;
        $sub['feedback'] = $feedback;
        $sub['graded_by'] = $user['name'];
        $sub['graded_at'] = $now;
        $sub['status'] = 'graded';
        $sub['answers'] = json_decode($sub['answers'] ?? '{}', true) ?: [];

        Response::json($sub);
    }

    private function recordAssessmentProgress(PDO $pdo, string $learnerId, string $courseId, string $assessmentId, float $score): void {
        $now = date('c');
        $stmt = $pdo->prepare("SELECT * FROM progress WHERE learner_id = :lid AND course_id = :cid");
        $stmt->execute([':lid' => $learnerId, ':cid' => $courseId]);
        $prog = $stmt->fetch();

        if ($prog) {
            $asms = json_decode($prog['completed_assessment_ids'] ?? '[]', true) ?: [];
            if (!in_array($assessmentId, $asms)) {
                $asms[] = $assessmentId;
            }
            $scores = json_decode($prog['assessment_scores'] ?? '{}', true) ?: [];
            $scores[$assessmentId] = $score;

            $stmtUpdate = $pdo->prepare("UPDATE progress SET completed_assessment_ids = :aids, assessment_scores = :scores, last_activity = :now WHERE id = :id");
            $stmtUpdate->execute([
                ':aids' => json_encode($asms),
                ':scores' => json_encode($scores),
                ':now' => $now,
                ':id' => $prog['id']
            ]);
        }
    }
}
