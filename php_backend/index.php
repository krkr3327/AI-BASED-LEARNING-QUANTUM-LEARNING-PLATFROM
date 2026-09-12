<?php
/**
 * PHP Backend API Front Controller
 * Entry point for all REST requests across Platform, Curriculum, Assessment, and Simulation.
 */

// 1. Load CORS Middleware & Environment
require_once __DIR__ . '/config/cors.php';
handleCors();

require_once __DIR__ . '/config/env.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/src/Models/Schema.php';
require_once __DIR__ . '/src/Models/FileStore.php';
require_once __DIR__ . '/src/Utils/Response.php';
require_once __DIR__ . '/src/Utils/Router.php';
require_once __DIR__ . '/src/Utils/Auth.php';

// Controllers
require_once __DIR__ . '/src/Controllers/AuthController.php';
require_once __DIR__ . '/src/Controllers/CourseController.php';
require_once __DIR__ . '/src/Controllers/QuizController.php';
require_once __DIR__ . '/src/Controllers/AssessmentController.php';
require_once __DIR__ . '/src/Controllers/ChallengeController.php';
require_once __DIR__ . '/src/Controllers/ProgressController.php';
require_once __DIR__ . '/src/Controllers/NotificationController.php';

// 2. Initialize Database Tables & File Storage
Schema::initialize();
FileStore::init();

// 3. Initialize Router
$router = new Router();

// Health Check
$router->get('/api/health', function() {
    Response::json(['status' => 'healthy', 'backend' => 'PHP', 'version' => '1.0.0', 'timestamp' => date('c')]);
});
$router->get('/health', function() {
    Response::json(['status' => 'healthy', 'backend' => 'PHP', 'version' => '1.0.0', 'timestamp' => date('c')]);
});

// ── AUTHENTICATION ────────────────────────────────────────────────────────
$router->post('/api/platform/auth/register', [AuthController::class, 'register']);
$router->post('/api/platform/auth/login',    [AuthController::class, 'login']);
$router->get('/api/platform/auth/me',        [AuthController::class, 'getMe']);
$router->put('/api/platform/profile',        [AuthController::class, 'updateProfile']);

// Legacy auth routes
$router->post('/api/auth/register', [AuthController::class, 'register']);
$router->post('/api/auth/login',    [AuthController::class, 'login']);
$router->get('/api/auth/me',        [AuthController::class, 'getMe']);

// ── COURSES, MODULES, LESSONS & NOTES ─────────────────────────────────────
$router->get('/api/platform/courses',                      [CourseController::class, 'listCourses']);
$router->post('/api/platform/courses',                     [CourseController::class, 'createCourse']);
$router->get('/api/platform/courses/{course_id}',          [CourseController::class, 'getCourse']);
$router->put('/api/platform/courses/{course_id}',          [CourseController::class, 'updateCourse']);
$router->delete('/api/platform/courses/{course_id}',       [CourseController::class, 'deleteCourse']);

// Modules
$router->post('/api/platform/courses/{course_id}/modules',                    [CourseController::class, 'addModule']);
$router->delete('/api/platform/courses/{course_id}/modules/{module_id}',       [CourseController::class, 'deleteModule']);

// Lessons
$router->post('/api/platform/courses/{course_id}/modules/{module_id}/lessons',               [CourseController::class, 'addLesson']);
$router->delete('/api/platform/courses/{course_id}/modules/{module_id}/lessons/{lesson_id}', [CourseController::class, 'deleteLesson']);

// Notes
$router->post('/api/platform/courses/{course_id}/notes',                 [CourseController::class, 'addNote']);
$router->delete('/api/platform/courses/{course_id}/notes/{note_id}',     [CourseController::class, 'deleteNote']);

// ── QUIZZES ───────────────────────────────────────────────────────────────
$router->post('/api/platform/courses/{course_id}/quizzes',                   [QuizController::class, 'addQuiz']);
$router->delete('/api/platform/courses/{course_id}/quizzes/{quiz_id}',       [QuizController::class, 'deleteQuiz']);
$router->post('/api/platform/courses/{course_id}/quizzes/{quiz_id}/submit',  [QuizController::class, 'submitQuiz']);

// ── ASSESSMENTS & LIVE GRADING DESK ───────────────────────────────────────
$router->post('/api/platform/courses/{course_id}/assessments',                   [AssessmentController::class, 'addAssessment']);
$router->delete('/api/platform/courses/{course_id}/assessments/{assessment_id}', [AssessmentController::class, 'deleteAssessment']);
$router->post('/api/platform/assessments/{assessment_id}/submit',                [AssessmentController::class, 'submitAssessment']);
$router->get('/api/platform/submissions',                                        [AssessmentController::class, 'listSubmissions']);
$router->post('/api/platform/submissions/{submission_id}/grade',                 [AssessmentController::class, 'gradeSubmission']);

// ── CHALLENGES & PROBLEMS ─────────────────────────────────────────────────
$router->post('/api/platform/courses/{course_id}/challenges',                    [ChallengeController::class, 'addChallenge']);
$router->delete('/api/platform/courses/{course_id}/challenges/{challenge_id}',   [ChallengeController::class, 'deleteChallenge']);
$router->post('/api/platform/courses/{course_id}/problems',                      [ChallengeController::class, 'addProblem']);
$router->delete('/api/platform/courses/{course_id}/problems/{problem_id}',       [ChallengeController::class, 'deleteProblem']);
$router->post('/api/platform/execute-code',                                      [ChallengeController::class, 'executeCode']);

// ── ENROLLMENTS & PROGRESS ────────────────────────────────────────────────
$router->post('/api/platform/enrollments/{course_id}',             [ProgressController::class, 'enroll']);
$router->get('/api/platform/enrollments',                          [ProgressController::class, 'getMyEnrollments']);
$router->get('/api/platform/progress/{course_id}',                 [ProgressController::class, 'getProgress']);
$router->post('/api/platform/progress/{course_id}/complete-lesson', [ProgressController::class, 'markLessonComplete']);

// ── TRAINER OVERSIGHT ─────────────────────────────────────────────────────
$router->get('/api/platform/trainer/learners-overview', [ProgressController::class, 'getTrainerLearnersOverview']);

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────
$router->get('/api/platform/notifications',       [NotificationController::class, 'getNotifications']);
$router->post('/api/platform/notifications/read', [NotificationController::class, 'markRead']);

// ── LEARNING CURRICULUM ALIASES ───────────────────────────────────────────
$router->get('/api/learning/curriculum', function() {
    $ctrl = new CourseController();
    $ctrl->listCourses();
});

$router->get('/api/learning/progress', function() {
    $user = Auth::getCurrentUser() ?: ['id' => 'learner-001'];
    $pdo = Database::getConnection();
    $stmt = $pdo->prepare("SELECT * FROM progress WHERE learner_id = :lid");
    $stmt->execute([':lid' => $user['id']]);
    $progs = $stmt->fetchAll();
    Response::json(['learner_id' => $user['id'], 'records' => $progs]);
});

// 4. Dispatch Request
$router->dispatch();
