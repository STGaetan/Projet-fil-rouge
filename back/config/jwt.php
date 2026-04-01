<?php

/**
 * JWT Authentication Helper
 *
 * Implémentation simple et sécurisée de JWT (HMAC-SHA256).
 * Ne nécessite aucune dépendance externe.
 */

define('JWT_SECRET', getenv('JWT_SECRET') ?: 'mns-admin-secret-key-change-in-production-2024');
define('JWT_EXPIRY', 8 * 3600); // 8 heures

function base64UrlEncode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode(string $data): string
{
    return base64_decode(strtr($data, '-_', '+/'));
}

/**
 * Génère un token JWT pour un utilisateur.
 */
function generateJwt(array $user): string
{
    $header = base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));

    $payload = base64UrlEncode(json_encode([
        'sub' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'nom' => $user['nom'],
        'prenom' => $user['prenom'],
        'iat' => time(),
        'exp' => time() + JWT_EXPIRY,
    ]));

    $signature = base64UrlEncode(
        hash_hmac('sha256', "$header.$payload", JWT_SECRET, true)
    );

    return "$header.$payload.$signature";
}

/**
 * Vérifie et décode un token JWT.
 * Retourne le payload décodé ou null si invalide/expiré.
 */
function verifyJwt(string $token): ?array
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }

    [$header, $payload, $signature] = $parts;

    // Vérifier la signature
    $expectedSignature = base64UrlEncode(
        hash_hmac('sha256', "$header.$payload", JWT_SECRET, true)
    );

    if (!hash_equals($expectedSignature, $signature)) {
        return null;
    }

    $data = json_decode(base64UrlDecode($payload), true);

    if (!$data) {
        return null;
    }

    // Vérifier l'expiration
    if (isset($data['exp']) && $data['exp'] < time()) {
        return null;
    }

    return $data;
}

/**
 * Extrait le token du header Authorization.
 */
function getBearerToken(): ?string
{
    $headers = [];

    if (function_exists('getallheaders')) {
        $headers = getallheaders();
    } else {
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $headerName = str_replace('_', '-', substr($key, 5));
                $headers[$headerName] = $value;
            }
        }
    }

    // Recherche case-insensitive de Authorization
    foreach ($headers as $key => $value) {
        if (strtolower($key) === 'authorization') {
            if (preg_match('/^Bearer\s+(.+)$/i', $value, $matches)) {
                return $matches[1];
            }
        }
    }

    return null;
}

/**
 * Middleware : vérifie l'authentification.
 * Appeler cette fonction au début des routes protégées.
 * Retourne le payload JWT décodé (infos utilisateur).
 */
function requireAuth(): array
{
    $token = getBearerToken();

    if (!$token) {
        jsonResponse(['error' => 'Token d\'authentification requis'], 401);
    }

    $payload = verifyJwt($token);

    if (!$payload) {
        jsonResponse(['error' => 'Token invalide ou expiré'], 401);
    }

    return $payload;
}
