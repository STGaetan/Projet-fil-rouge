<?php

require_once __DIR__ . '/config/database.php';

// --- CORS ---
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --- Helpers ---
function jsonResponse(mixed $data, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function getBody(): array
{
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}

// --- Routing ---
$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = rtrim($uri, '/') ?: '/';

$routes  = require __DIR__ . '/routes.php';
$matched = false;
$params  = [];

foreach ($routes as $route) {
    [$routeMethod, $routePattern, $handler] = $route;

    if ($routeMethod !== $method) {
        continue;
    }

    $regex = preg_replace('#\{(\w+)\}#', '(?P<$1>[^/]+)', $routePattern);
    $regex = '#^' . $regex . '$#';

    if (preg_match($regex, $uri, $matches)) {
        $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
        $matched = true;
        break;
    }
}

if (!$matched) {
    jsonResponse(['error' => 'Route non trouvée'], 404);
}

// Appeler le handler : "Controller@method"
[$controllerName, $action] = explode('@', $handler);
$controllerFile = __DIR__ . '/controllers/' . $controllerName . '.php';

if (!file_exists($controllerFile)) {
    jsonResponse(['error' => 'Controller introuvable'], 500);
}

require_once $controllerFile;

if (!class_exists($controllerName)) {
    jsonResponse(['error' => 'Classe controller introuvable'], 500);
}

$controller = new $controllerName();

if (!method_exists($controller, $action)) {
    jsonResponse(['error' => "Action '$action' introuvable"], 500);
}

$controller->$action($params);
