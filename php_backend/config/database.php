<?php
/**
 * Database Connection Factory
 */

require_once __DIR__ . '/env.php';

class Database {
    private static ?PDO $pdo = null;

    public static function getConnection(): PDO {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        $driver = strtolower(env('DB_DRIVER', 'sqlite'));

        try {
            if ($driver === 'sqlite') {
                $baseDir = dirname(__DIR__);
                $dbDir = $baseDir . '/data';
                if (!file_exists($dbDir)) {
                    @mkdir($dbDir, 0777, true);
                }
                $fullPath = $dbDir . '/database.sqlite';
                if (!file_exists($fullPath)) {
                    @touch($fullPath);
                }

                self::$pdo = new PDO("sqlite:" . str_replace('\\', '/', $fullPath));
                self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                // Enable foreign keys in SQLite
                self::$pdo->exec("PRAGMA foreign_keys = ON;");
            } else {
                $host = env('DB_HOST', '127.0.0.1');
                $port = env('DB_PORT', '3306');
                $dbname = env('DB_NAME', 'quantum_platform');
                $user = env('DB_USER', 'root');
                $pass = env('DB_PASS', '');

                $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
                self::$pdo = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            }
        } catch (PDOException $e) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode([
                'error' => 'Database connection failed',
                'detail' => $e->getMessage()
            ]);
            exit;
        }

        return self::$pdo;
    }
}
