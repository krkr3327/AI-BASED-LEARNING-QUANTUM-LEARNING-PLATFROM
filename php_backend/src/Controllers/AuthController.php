<?php
/**
 * Auth Controller — Registration, Login, Profile Management
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Models/FileStore.php';
require_once __DIR__ . '/../Utils/Response.php';
require_once __DIR__ . '/../Utils/Auth.php';
require_once __DIR__ . '/../Utils/Router.php';

class AuthController {
    public function register(): void {
        $body = Router::getJsonBody();
        $name = trim($body['name'] ?? '');
        $email = strtolower(trim($body['email'] ?? ''));
        $password = $body['password'] ?? '';
        $role = strtolower(trim($body['role'] ?? 'learner'));
        $phone = trim($body['phone'] ?? '');
        $avatar = trim($body['avatar'] ?? '');
        $bio = trim($body['bio'] ?? '');
        $expertise = $body['expertise'] ?? [];

        if (empty($name) || empty($email) || empty($password)) {
            Response::error("Name, email and password are required.");
        }

        $pdo = Database::getConnection();
        
        // Check existing email
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        if ($stmt->fetch()) {
            Response::error("An account with this email already exists.");
        }

        $id = 'usr-' . substr(md5(uniqid()), 0, 8);
        $now = date('c');

        $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role, phone, avatar, bio, expertise, created_at)
            VALUES (:id, :name, :email, :password, :role, :phone, :avatar, :bio, :expertise, :created_at)");
        $stmt->execute([
            ':id' => $id,
            ':name' => $name,
            ':email' => $email,
            ':password' => $password,
            ':role' => $role,
            ':phone' => $phone,
            ':avatar' => $avatar ?: "https://api.dicebear.com/7.x/bottts/svg?seed=" . urlencode($name),
            ':bio' => $bio ?: "Active " . ucfirst($role) . " on the Platform",
            ':expertise' => json_encode($expertise),
            ':created_at' => $now
        ]);

        // Send welcome notification
        $stmtNotif = $pdo->prepare("INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
            VALUES (:id, :user_id, :title, :message, 'info', :link, 0, :created_at)");
        $notifId = 'notif-' . uniqid();
        $notifData = [
            'id' => $notifId,
            'user_id' => $id,
            'title' => 'Welcome to the Platform!',
            'message' => "Welcome {$name}! Your " . ucfirst($role) . " account is ready.",
            'type' => 'info',
            'link' => $role === 'trainer' ? '/trainer/dashboard' : '/learner/dashboard',
            'is_read' => 0,
            'created_at' => $now
        ];
        $stmtNotif->execute([
            ':id' => $notifId,
            ':user_id' => $id,
            ':title' => $notifData['title'],
            ':message' => $notifData['message'],
            ':link' => $notifData['link'],
            ':created_at' => $now
        ]);

        $token = "{$id}:{$role}";
        $user = [
            'id' => $id,
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'role' => $role,
            'phone' => $phone,
            'avatar' => $avatar ?: "https://api.dicebear.com/7.x/bottts/svg?seed=" . urlencode($name),
            'bio' => $bio ?: "Active " . ucfirst($role) . " on the Platform",
            'expertise' => $expertise,
            'created_at' => $now
        ];

        // Persist directly to JSON files
        FileStore::append('users.json', $user);
        FileStore::append('notifications.json', $notifData);

        unset($user['password']);
        Response::json(['token' => $token, 'user' => $user], 201);
    }

    public function login(): void {
        $body = Router::getJsonBody();
        $email = strtolower(trim($body['email'] ?? ''));
        $password = $body['password'] ?? '';
        $role = isset($body['role']) ? strtolower(trim($body['role'])) : null;

        if (empty($email) || empty($password)) {
            Response::error("Email and password are required.");
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT id, name, email, password, role, phone, avatar, bio, expertise, created_at FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        if (!$user || $user['password'] !== $password) {
            Response::error("Invalid email or password.", 401);
        }

        if ($role && strtolower($user['role']) !== $role) {
            Response::error("This account is registered as a " . ucfirst($user['role']) . ", not a " . ucfirst($role) . ".", 403);
        }

        $token = "{$user['id']}:{$user['role']}";
        unset($user['password']);
        $user['expertise'] = json_decode($user['expertise'] ?? '[]', true) ?: [];

        Response::json(['token' => $token, 'user' => $user]);
    }

    public function getMe(): void {
        $user = Auth::requireUser();
        Response::json($user);
    }

    public function updateProfile(): void {
        $user = Auth::requireUser();
        $body = Router::getJsonBody();

        $name = $body['name'] ?? $user['name'];
        $phone = $body['phone'] ?? $user['phone'];
        $avatar = $body['avatar'] ?? $user['avatar'];
        $bio = $body['bio'] ?? $user['bio'];
        $expertise = isset($body['expertise']) ? json_encode($body['expertise']) : json_encode($user['expertise']);

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE users SET name = :name, phone = :phone, avatar = :avatar, bio = :bio, expertise = :expertise WHERE id = :id");
        $stmt->execute([
            ':name' => $name,
            ':phone' => $phone,
            ':avatar' => $avatar,
            ':bio' => $bio,
            ':expertise' => $expertise,
            ':id' => $user['id']
        ]);

        $updated = Auth::getCurrentUser();
        Response::json($updated);
    }
}
