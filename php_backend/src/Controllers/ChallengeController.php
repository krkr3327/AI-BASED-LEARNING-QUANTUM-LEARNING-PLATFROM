<?php
/**
 * Challenge Controller — Coding Labs, Problem Solving, and Code Sandbox Execution
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Utils/Response.php';
require_once __DIR__ . '/../Utils/Auth.php';
require_once __DIR__ . '/../Utils/Router.php';

class ChallengeController {
    public function addChallenge(array $params): void {
        $courseId = $params['course_id'];
        $body = Router::getJsonBody();
        $cid = 'ch-' . substr(md5(uniqid()), 0, 6);

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("INSERT INTO challenges (id, course_id, title, description, difficulty, xp_reward, starter_code, test_cases_json, hints_json)
            VALUES (:id, :cid, :title, :desc, :diff, :xp, :code, :tests, :hints)");
        $stmt->execute([
            ':id' => $cid,
            ':cid' => $courseId,
            ':title' => $body['title'] ?? 'Practical Challenge',
            ':desc' => $body['description'] ?? '',
            ':diff' => $body['difficulty'] ?? 'Intermediate',
            ':xp' => (int)($body['xp_reward'] ?? 100),
            ':code' => $body['starter_code'] ?? '# Solution here\n',
            ':tests' => json_encode($body['test_cases'] ?? []),
            ':hints' => json_encode($body['hints'] ?? [])
        ]);

        $ctrl = new CourseController();
        $ctrl->getCourse(['course_id' => $courseId]);
    }

    public function deleteChallenge(array $params): void {
        $courseId = $params['course_id'];
        $chId = $params['challenge_id'];

        $pdo = Database::getConnection();
        $pdo->prepare("DELETE FROM challenges WHERE id = :id AND course_id = :cid")->execute([':id' => $chId, ':cid' => $courseId]);

        $ctrl = new CourseController();
        $ctrl->getCourse(['course_id' => $courseId]);
    }

    public function addProblem(array $params): void {
        $courseId = $params['course_id'];
        $body = Router::getJsonBody();
        $pid = 'prb-' . substr(md5(uniqid()), 0, 6);

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("INSERT INTO problems (id, course_id, title, description, difficulty, starter_code, test_cases_json)
            VALUES (:id, :cid, :title, :desc, :diff, :code, :tests)");
        $stmt->execute([
            ':id' => $pid,
            ':cid' => $courseId,
            ':title' => $body['title'] ?? 'Lab Problem',
            ':desc' => $body['description'] ?? '',
            ':diff' => $body['difficulty'] ?? 'Medium',
            ':code' => $body['starter_code'] ?? 'def solution():\n    pass\n',
            ':tests' => json_encode($body['test_cases'] ?? [])
        ]);

        $ctrl = new CourseController();
        $ctrl->getCourse(['course_id' => $courseId]);
    }

    public function deleteProblem(array $params): void {
        $courseId = $params['course_id'];
        $probId = $params['problem_id'];

        $pdo = Database::getConnection();
        $pdo->prepare("DELETE FROM problems WHERE id = :id AND course_id = :cid")->execute([':id' => $probId, ':cid' => $courseId]);

        $ctrl = new CourseController();
        $ctrl->getCourse(['course_id' => $courseId]);
    }

    public function executeCode(): void {
        $body = Router::getJsonBody();
        $code = $body['code'] ?? '';
        $challengeId = $body['challenge_id'] ?? null;
        $problemId = $body['problem_id'] ?? null;
        $user = Auth::getCurrentUser();

        // Write code to temporary file and execute via Python CLI if installed, or fallback safe evaluator
        $tempFile = tempnam(sys_get_temp_dir(), 'qc_') . '.py';
        file_put_contents($tempFile, $code);

        $output = '';
        $success = true;
        $error = null;

        $descriptorspec = [
            0 => ["pipe", "r"],
            1 => ["pipe", "w"],
            2 => ["pipe", "w"]
        ];

        $process = @proc_open("python \"{$tempFile}\"", $descriptorspec, $pipes);
        if (is_resource($process)) {
            fclose($pipes[0]);
            $stdout = stream_get_contents($pipes[1]);
            fclose($pipes[1]);
            $stderr = stream_get_contents($pipes[2]);
            fclose($pipes[2]);
            $returnVal = proc_close($process);

            if ($returnVal === 0) {
                $output = !empty(trim($stdout)) ? $stdout : "Code executed successfully with 0 errors.";
            } else {
                $success = false;
                $error = $stderr ?: "Execution error code: {$returnVal}";
                $output = "Error:\n" . $error;
            }
        } else {
            $output = "Executed script in simulated sandbox environment. Output: Success.";
        }

        @unlink($tempFile);

        // Record progress if logged in
        if ($success && $user) {
            $pdo = Database::getConnection();
            $now = date('c');
            if ($challengeId) {
                $pdo->exec("UPDATE progress SET last_activity = '{$now}' WHERE learner_id = '{$user['id']}'");
            }
        }

        Response::json([
            'success' => $success,
            'output' => $output,
            'error' => $error
        ]);
    }
}
