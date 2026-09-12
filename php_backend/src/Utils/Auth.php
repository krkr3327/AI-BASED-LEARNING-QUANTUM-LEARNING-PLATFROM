<?php
/**
 * Authentication and Token Validator Helper
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/Response.php';

class Auth {
    public static function getCurrentUser(): ?array {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        }

        if (empty($authHeader)) {
            return null;
        }

        $token = trim(str_replace('Bearer ', '', $authHeader));
        if (empty($token)) {
            return null;
        }

        $userId = $token;
        if (strpos($token, ':') !== false) {
            $parts = explode(':', $token);
            $userId = $parts[0];
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT id, name, email, role, phone, avatar, bio, expertise, created_at FROM users WHERE id = :id");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch();

        if ($user) {
            $user['expertise'] = json_decode($user['expertise'] ?? '[]', true) ?: [];
            return $user;
        }

        return null;
    }

    public static function requireUser(): array {
        $user = self::getCurrentUser();
        if (!$user) {
            Response::unauthorized("Authentication required");
        }
        return $user;
    }

    public static function requireRole(string $role): array {
        $user = self::requireUser();
        if (strtolower($user['role']) !== strtolower($role)) {
            Response::forbidden("Access restricted to {$role}s only");
        }
        return $user;
    }
}
