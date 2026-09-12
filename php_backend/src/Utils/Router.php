<?php
/**
 * Lightweight REST Router for PHP Backend
 */

require_once __DIR__ . '/Response.php';

class Router {
    private array $routes = [];

    public function get(string $path, $handler): void {
        $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, $handler): void {
        $this->addRoute('POST', $path, $handler);
    }

    public function put(string $path, $handler): void {
        $this->addRoute('PUT', $path, $handler);
    }

    public function delete(string $path, $handler): void {
        $this->addRoute('DELETE', $path, $handler);
    }

    private function addRoute(string $method, string $path, $handler): void {
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => $path,
            'handler' => $handler
        ];
    }

    public static function getJsonBody(): array {
        $raw = file_get_contents('php://input');
        if (empty($raw)) {
            return [];
        }
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    public function dispatch(): void {
        $requestMethod = $_SERVER['REQUEST_METHOD'];
        $requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        // Normalize trailing slashes (except root)
        if ($requestUri !== '/' && substr($requestUri, -1) === '/') {
            $requestUri = rtrim($requestUri, '/');
        }

        foreach ($this->routes as $route) {
            if ($route['method'] !== $requestMethod) {
                continue;
            }

            // Convert route path pattern with parameters like {id} or {course_id}
            $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $route['path']);
            $pattern = '#^' . $pattern . '$#';

            if (preg_match($pattern, $requestUri, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                
                // Invoke handler
                if (is_callable($route['handler'])) {
                    call_user_func($route['handler'], $params);
                    return;
                } else if (is_array($route['handler'])) {
                    list($class, $method) = $route['handler'];
                    $controller = new $class();
                    call_user_func([$controller, $method], $params);
                    return;
                }
            }
        }

        Response::notFound("Endpoint {$requestMethod} {$requestUri} not found on PHP API server");
    }
}
