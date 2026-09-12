<?php
/**
 * Quiz Controller — Creation, Question Authoring, and Auto-Grading Engine
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Utils/Response.php';
require_once __DIR__ . '/../Utils/Auth.php';
require_once __DIR__ . '/../Utils/Router.php';

class QuizController {
    public function addQuiz(array $params): void {
        $courseId = $params['course_id'];
        $body = Router::getJsonBody();
        $qid = 'quiz-' . substr(md5(uniqid()), 0, 6);
        $now = date('c');

        $title = $body['title'] ?? 'Knowledge Check';
        $description = $body['description'] ?? '';
        $timeLimit = (int)($body['time_limit_mins'] ?? 15);
        $passingScore = (float)($body['passing_score'] ?? 70.0);
        $questions = $body['questions'] ?? [];

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("INSERT INTO quizzes (id, course_id, title, description, time_limit_mins, passing_score, questions_json, created_at)
            VALUES (:id, :cid, :title, :desc, :time_limit, :passing_score, :qjson, :created_at)");
        $stmt->execute([
            ':id' => $qid,
            ':cid' => $courseId,
            ':title' => $title,
            ':desc' => $description,
            ':time_limit' => $timeLimit,
            ':passing_score' => $passingScore,
            ':qjson' => json_encode($questions),
            ':created_at' => $now
        ]);

        $ctrl = new CourseController();
        $ctrl->getCourse(['course_id' => $courseId]);
    }

    public function deleteQuiz(array $params): void {
        $courseId = $params['course_id'];
        $quizId = $params['quiz_id'];

        $pdo = Database::getConnection();
        $pdo->prepare("DELETE FROM quizzes WHERE id = :qid AND course_id = :cid")->execute([':qid' => $quizId, ':cid' => $courseId]);

        $ctrl = new CourseController();
        $ctrl->getCourse(['course_id' => $courseId]);
    }

    public function submitQuiz(array $params): void {
        $courseId = $params['course_id'];
        $quizId = $params['quiz_id'];
        $body = Router::getJsonBody();
        $answers = $body['answers'] ?? []; // question_id -> chosen option index

        $user = Auth::getCurrentUser() ?: ['id' => 'learner-001', 'name' => 'Alex Rivera'];

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM quizzes WHERE id = :qid AND course_id = :cid");
        $stmt->execute([':qid' => $quizId, ':cid' => $courseId]);
        $quiz = $stmt->fetch();

        if (!$quiz) {
            Response::notFound("Quiz not found");
        }

        $questions = json_decode($quiz['questions_json'] ?? '[]', true) ?: [];
        $totalQ = count($questions);
        if ($totalQ === 0) {
            Response::json(['score' => 100.0, 'passed' => true, 'details' => []]);
        }

        $correctCount = 0;
        $results = [];

        foreach ($questions as $q) {
            $userAns = $answers[$q['id']] ?? null;
            $isCorrect = ($userAns !== null && (int)$userAns === (int)$q['correct_answer_index']);
            if ($isCorrect) {
                $correctCount++;
            }
            $results[] = [
                'question_id' => $q['id'],
                'question' => $q['question'],
                'user_answer' => $userAns,
                'correct_answer' => $q['correct_answer_index'],
                'is_correct' => $isCorrect,
                'explanation' => $q['explanation'] ?? ''
            ];
        }

        $scorePercentage = round(($correctCount / $totalQ) * 100.0, 1);
        $passed = $scorePercentage >= (float)$quiz['passing_score'];

        // Update student progress in database
        $this->recordQuizProgress($pdo, $user['id'], $courseId, $quizId, $scorePercentage);

        Response::json([
            'score' => $scorePercentage,
            'passed' => $passed,
            'correct_count' => $correctCount,
            'total_questions' => $totalQ,
            'passing_score' => (float)$quiz['passing_score'],
            'results' => $results
        ]);
    }

    private function recordQuizProgress(PDO $pdo, string $learnerId, string $courseId, string $quizId, float $score): void {
        $now = date('c');
        $stmt = $pdo->prepare("SELECT * FROM progress WHERE learner_id = :lid AND course_id = :cid");
        $stmt->execute([':lid' => $learnerId, ':cid' => $courseId]);
        $prog = $stmt->fetch();

        if ($prog) {
            $quizzes = json_decode($prog['completed_quiz_ids'] ?? '[]', true) ?: [];
            if (!in_array($quizId, $quizzes)) {
                $quizzes[] = $quizId;
            }
            $scores = json_decode($prog['quiz_scores'] ?? '{}', true) ?: [];
            $scores[$quizId] = $score;

            $stmtUpdate = $pdo->prepare("UPDATE progress SET completed_quiz_ids = :qids, quiz_scores = :scores, last_activity = :now WHERE id = :id");
            $stmtUpdate->execute([
                ':qids' => json_encode($quizzes),
                ':scores' => json_encode($scores),
                ':now' => $now,
                ':id' => $prog['id']
            ]);
        } else {
            $id = 'prog-' . substr(md5(uniqid()), 0, 8);
            $stmtInsert = $pdo->prepare("INSERT INTO progress (id, learner_id, course_id, completed_lesson_ids, completed_quiz_ids, completed_assessment_ids, completed_challenge_ids, completed_problem_ids, quiz_scores, assessment_scores, overall_percentage, last_activity)
                VALUES (:id, :lid, :cid, '[]', :qids, '[]', '[]', '[]', :scores, '{}', 20.0, :now)");
            $stmtInsert->execute([
                ':id' => $id,
                ':lid' => $learnerId,
                ':cid' => $courseId,
                ':qids' => json_encode([$quizId]),
                ':scores' => json_encode([$quizId => $score]),
                ':now' => $now
            ]);
        }
    }
}
