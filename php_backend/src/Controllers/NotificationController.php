<?php
/**
 * Notification Controller — Alerts, Feedback Notifications, and Mark as Read
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Utils/Response.php';
require_once __DIR__ . '/../Utils/Auth.php';

class NotificationController {
    public function getNotifications(): void {
        $user = Auth::getCurrentUser() ?: ['id' => 'learner-001'];
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = :uid ORDER BY created_at DESC");
        $stmt->execute([':uid' => $user['id']]);
        $notifs = $stmt->fetchAll();

        foreach ($notifs as &$n) {
            $n['is_read'] = (bool)$n['is_read'];
        }

        Response::json($notifs);
    }

    public function markRead(): void {
        $user = Auth::getCurrentUser() ?: ['id' => 'learner-001'];
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = :uid AND is_read = 0");
        $stmt->execute([':uid' => $user['id']]);
        $count = $stmt->rowCount();

        Response::json(['marked_read' => $count]);
    }
}
