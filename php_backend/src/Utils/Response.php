<?php
/**
 * Standard JSON Response Formatter
 */

class Response {
    public static function json($data, int $status = 200): void {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function error(string $message, int $status = 400, $details = null): void {
        $payload = ['detail' => $message];
        if ($details !== null) {
            $payload['details'] = $details;
        }
        self::json($payload, $status);
    }

    public static function notFound(string $message = "Resource not found"): void {
        self::error($message, 404);
    }

    public static function unauthorized(string $message = "Unauthorized"): void {
        self::error($message, 401);
    }

    public static function forbidden(string $message = "Forbidden"): void {
        self::error($message, 403);
    }
}
