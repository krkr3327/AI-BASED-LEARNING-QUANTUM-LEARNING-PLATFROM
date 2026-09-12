<?php
/**
 * Course Controller — Courses, Modules, Lessons, Notes CRUD
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Utils/Response.php';
require_once __DIR__ . '/../Utils/Auth.php';
require_once __DIR__ . '/../Utils/Router.php';

class CourseController {
    public function listCourses(): void {
        $pdo = Database::getConnection();
        $trainerId = $_GET['trainer_id'] ?? null;
        $publishedOnly = isset($_GET['published_only']) && ($_GET['published_only'] === 'true' || $_GET['published_only'] === '1');

        $query = "SELECT * FROM courses WHERE 1=1";
        $params = [];

        if ($trainerId) {
            $query .= " AND trainer_id = :trainer_id";
            $params[':trainer_id'] = $trainerId;
        }

        if ($publishedOnly) {
            $query .= " AND is_published = 1";
        }

        $query .= " ORDER BY created_at DESC";
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $courses = $stmt->fetchAll();

        foreach ($courses as &$c) {
            $c = $this->hydrateCourse($pdo, $c);
        }

        Response::json($courses);
    }

    public function getCourse(array $params): void {
        $id = $params['course_id'] ?? $params['id'] ?? '';
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM courses WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $c = $stmt->fetch();

        if (!$c) {
            Response::notFound("Course not found");
        }

        $c = $this->hydrateCourse($pdo, $c);
        Response::json($c);
    }

    public function createCourse(): void {
        $user = Auth::getCurrentUser();
        $body = Router::getJsonBody();

        $id = 'crs-' . substr(md5(uniqid()), 0, 8);
        $title = trim($body['title'] ?? 'Untitled Course');
        $description = trim($body['description'] ?? '');
        $category = trim($body['category'] ?? 'Quantum Computing');
        $level = trim($body['level'] ?? 'Beginner');
        $duration = trim($body['duration'] ?? '4 Weeks');
        $thumbnail = trim($body['thumbnail'] ?? 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600');
        $trainerId = $user['id'] ?? 'trainer-001';
        $trainerName = $user['name'] ?? 'Instructor';
        $isPublished = isset($body['is_published']) ? ($body['is_published'] ? 1 : 0) : 1;
        $now = date('c');

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("INSERT INTO courses (id, title, description, category, level, duration, thumbnail, trainer_id, trainer_name, is_published, created_at)
            VALUES (:id, :title, :description, :category, :level, :duration, :thumbnail, :trainer_id, :trainer_name, :is_published, :created_at)");
        $stmt->execute([
            ':id' => $id,
            ':title' => $title,
            ':description' => $description,
            ':category' => $category,
            ':level' => $level,
            ':duration' => $duration,
            ':thumbnail' => $thumbnail,
            ':trainer_id' => $trainerId,
            ':trainer_name' => $trainerName,
            ':is_published' => $isPublished,
            ':created_at' => $now
        ]);

        $this->getCourse(['course_id' => $id]);
    }

    public function updateCourse(array $params): void {
        $id = $params['course_id'] ?? $params['id'] ?? '';
        $body = Router::getJsonBody();
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("SELECT * FROM courses WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $c = $stmt->fetch();
        if (!$c) {
            Response::notFound("Course not found");
        }

        $title = $body['title'] ?? $c['title'];
        $description = $body['description'] ?? $c['description'];
        $category = $body['category'] ?? $c['category'];
        $level = $body['level'] ?? $c['level'];
        $duration = $body['duration'] ?? $c['duration'];
        $thumbnail = $body['thumbnail'] ?? $c['thumbnail'];
        $isPublished = isset($body['is_published']) ? ($body['is_published'] ? 1 : 0) : $c['is_published'];

        $stmt = $pdo->prepare("UPDATE courses SET title = :title, description = :description, category = :category, level = :level, duration = :duration, thumbnail = :thumbnail, is_published = :is_published WHERE id = :id");
        $stmt->execute([
            ':title' => $title,
            ':description' => $description,
            ':category' => $category,
            ':level' => $level,
            ':duration' => $duration,
            ':thumbnail' => $thumbnail,
            ':is_published' => $isPublished,
            ':id' => $id
        ]);

        $this->getCourse(['course_id' => $id]);
    }

    public function deleteCourse(array $params): void {
        $id = $params['course_id'] ?? $params['id'] ?? '';
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM courses WHERE id = :id");
        $stmt->execute([':id' => $id]);
        
        $pdo->prepare("DELETE FROM modules WHERE course_id = :id")->execute([':id' => $id]);
        $pdo->prepare("DELETE FROM lessons WHERE course_id = :id")->execute([':id' => $id]);
        $pdo->prepare("DELETE FROM notes WHERE course_id = :id")->execute([':id' => $id]);
        $pdo->prepare("DELETE FROM quizzes WHERE course_id = :id")->execute([':id' => $id]);
        $pdo->prepare("DELETE FROM assessments WHERE course_id = :id")->execute([':id' => $id]);
        $pdo->prepare("DELETE FROM challenges WHERE course_id = :id")->execute([':id' => $id]);
        $pdo->prepare("DELETE FROM problems WHERE course_id = :id")->execute([':id' => $id]);

        Response::json(['message' => 'Course deleted successfully']);
    }

    // Module handlers
    public function addModule(array $params): void {
        $courseId = $params['course_id'];
        $body = Router::getJsonBody();
        $mid = 'mod-' . substr(md5(uniqid()), 0, 6);
        $title = $body['title'] ?? 'New Module';
        $description = $body['description'] ?? '';

        $pdo = Database::getConnection();
        $stmtCount = $pdo->prepare("SELECT COUNT(*) as count FROM modules WHERE course_id = :cid");
        $stmtCount->execute([':cid' => $courseId]);
        $order = ($stmtCount->fetch()['count'] ?? 0) + 1;

        $stmt = $pdo->prepare("INSERT INTO modules (id, course_id, title, description, order_num) VALUES (:id, :cid, :title, :description, :order_num)");
        $stmt->execute([':id' => $mid, ':cid' => $courseId, ':title' => $title, ':description' => $description, ':order_num' => $order]);

        $this->getCourse(['course_id' => $courseId]);
    }

    public function deleteModule(array $params): void {
        $courseId = $params['course_id'];
        $moduleId = $params['module_id'];
        $pdo = Database::getConnection();
        $pdo->prepare("DELETE FROM modules WHERE id = :mid AND course_id = :cid")->execute([':mid' => $moduleId, ':cid' => $courseId]);
        $pdo->prepare("DELETE FROM lessons WHERE module_id = :mid")->execute([':mid' => $moduleId]);

        $this->getCourse(['course_id' => $courseId]);
    }

    // Lesson handlers
    public function addLesson(array $params): void {
        $courseId = $params['course_id'];
        $moduleId = $params['module_id'];
        $body = Router::getJsonBody();

        $lid = 'les-' . substr(md5(uniqid()), 0, 6);
        $title = $body['title'] ?? 'New Lesson';
        $type = $body['type'] ?? 'theory';
        $duration = $body['duration'] ?? '15 min';
        $videoUrl = $body['video_url'] ?? '';
        $content = $body['content'] ?? '';

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("INSERT INTO lessons (id, module_id, course_id, title, type, duration, video_url, content, order_num)
            VALUES (:id, :mid, :cid, :title, :type, :duration, :video_url, :content, 1)");
        $stmt->execute([
            ':id' => $lid,
            ':mid' => $moduleId,
            ':cid' => $courseId,
            ':title' => $title,
            ':type' => $type,
            ':duration' => $duration,
            ':video_url' => $videoUrl,
            ':content' => $content
        ]);

        $this->getCourse(['course_id' => $courseId]);
    }

    public function deleteLesson(array $params): void {
        $courseId = $params['course_id'];
        $lessonId = $params['lesson_id'];
        $pdo = Database::getConnection();
        $pdo->prepare("DELETE FROM lessons WHERE id = :id AND course_id = :cid")->execute([':id' => $lessonId, ':cid' => $courseId]);
        $this->getCourse(['course_id' => $courseId]);
    }

    // Notes handlers
    public function addNote(array $params): void {
        $courseId = $params['course_id'];
        $body = Router::getJsonBody();
        $nid = 'not-' . substr(md5(uniqid()), 0, 6);
        $now = date('c');

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("INSERT INTO notes (id, course_id, title, description, file_url, file_name, uploaded_at)
            VALUES (:id, :cid, :title, :desc, :file_url, :file_name, :uploaded_at)");
        $stmt->execute([
            ':id' => $nid,
            ':cid' => $courseId,
            ':title' => $body['title'] ?? 'Resource Note',
            ':desc' => $body['description'] ?? '',
            ':file_url' => $body['file_url'] ?? '#',
            ':file_name' => $body['file_name'] ?? 'Document.pdf',
            ':uploaded_at' => $now
        ]);

        $this->getCourse(['course_id' => $courseId]);
    }

    public function deleteNote(array $params): void {
        $courseId = $params['course_id'];
        $noteId = $params['note_id'];
        $pdo = Database::getConnection();
        $pdo->prepare("DELETE FROM notes WHERE id = :nid AND course_id = :cid")->execute([':nid' => $noteId, ':cid' => $courseId]);
        $this->getCourse(['course_id' => $courseId]);
    }

    private function hydrateCourse(PDO $pdo, array $c): array {
        $cid = $c['id'];
        $c['is_published'] = (bool)($c['is_published'] ?? 1);

        // Fetch modules and their lessons
        $stmtMod = $pdo->prepare("SELECT * FROM modules WHERE course_id = :cid ORDER BY order_num ASC");
        $stmtMod->execute([':cid' => $cid]);
        $modules = $stmtMod->fetchAll();

        foreach ($modules as &$m) {
            $stmtLes = $pdo->prepare("SELECT * FROM lessons WHERE module_id = :mid ORDER BY order_num ASC");
            $stmtLes->execute([':mid' => $m['id']]);
            $m['lessons'] = $stmtLes->fetchAll();
        }
        $c['modules'] = $modules;

        // Fetch notes
        $stmtNote = $pdo->prepare("SELECT * FROM notes WHERE course_id = :cid ORDER BY uploaded_at DESC");
        $stmtNote->execute([':cid' => $cid]);
        $c['notes'] = $stmtNote->fetchAll();

        // Fetch quizzes
        $stmtQuiz = $pdo->prepare("SELECT * FROM quizzes WHERE course_id = :cid ORDER BY created_at ASC");
        $stmtQuiz->execute([':cid' => $cid]);
        $quizzes = $stmtQuiz->fetchAll();
        foreach ($quizzes as &$q) {
            $q['questions'] = json_decode($q['questions_json'] ?? '[]', true) ?: [];
            unset($q['questions_json']);
        }
        $c['quizzes'] = $quizzes;

        // Fetch assessments
        $stmtAsm = $pdo->prepare("SELECT * FROM assessments WHERE course_id = :cid ORDER BY created_at ASC");
        $stmtAsm->execute([':cid' => $cid]);
        $assessments = $stmtAsm->fetchAll();
        foreach ($assessments as &$a) {
            $a['questions'] = json_decode($a['questions_json'] ?? '[]', true) ?: [];
            unset($a['questions_json']);
        }
        $c['assessments'] = $assessments;

        // Fetch challenges
        $stmtCh = $pdo->prepare("SELECT * FROM challenges WHERE course_id = :cid");
        $stmtCh->execute([':cid' => $cid]);
        $challenges = $stmtCh->fetchAll();
        foreach ($challenges as &$ch) {
            $ch['test_cases'] = json_decode($ch['test_cases_json'] ?? '[]', true) ?: [];
            $ch['hints'] = json_decode($ch['hints_json'] ?? '[]', true) ?: [];
            unset($ch['test_cases_json'], $ch['hints_json']);
        }
        $c['challenges'] = $challenges;

        // Fetch problems
        $stmtPrb = $pdo->prepare("SELECT * FROM problems WHERE course_id = :cid");
        $stmtPrb->execute([':cid' => $cid]);
        $problems = $stmtPrb->fetchAll();
        foreach ($problems as &$prb) {
            $prb['test_cases'] = json_decode($prb['test_cases_json'] ?? '[]', true) ?: [];
            unset($prb['test_cases_json']);
        }
        $c['problems'] = $problems;

        return $c;
    }
}
