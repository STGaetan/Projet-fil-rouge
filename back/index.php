<?php

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/jwt.php';
require_once __DIR__ . '/config/validation.php';

// --- Sécurité : Headers ---
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: camera=(), microphone=(), geolocation=()');

// --- CORS : Origines autorisées uniquement ---
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
} else {
    header('Access-Control-Allow-Origin: null');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 3600');

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
    $data = json_decode($raw, true);
    if ($raw !== '' && $data === null) {
        jsonResponse(['error' => 'JSON invalide dans le corps de la requête'], 400);
    }
    return $data ?: [];
}

// --- Routes publiques (pas de JWT requis) ---
$publicRoutes = [
    'POST:/api/auth/login',
];

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

// --- Middleware d'authentification JWT ---
$routeKey = "$method:$routePattern";
if (!in_array($routeKey, $publicRoutes, true)) {
    $authUser = requireAuth();
    // Rendre l'utilisateur authentifié accessible globalement
    $GLOBALS['auth_user'] = $authUser;
}

// --- Appeler le handler : "Controller@method" ---
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
