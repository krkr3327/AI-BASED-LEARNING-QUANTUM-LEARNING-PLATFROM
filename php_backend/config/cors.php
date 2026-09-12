<?php
/**
 * CORS Middleware Configuration
 */

require_once __DIR__ . '/env.php';

function handleCors() {
    $origin = env('CORS_ORIGIN', '*');
    
    // Set headers
    header("Access-Control-Allow-Origin: {$origin}");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");

    // Handle preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}
