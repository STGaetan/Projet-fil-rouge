<?php

require_once __DIR__ . '/../config/database.php';

class AuthController
{
    public function login(array $params): void
    {
        $body = getBody();

        $email = $body['email'] ?? '';
        $password = $body['password'] ?? '';

        if (empty($email) || empty($password)) {
            jsonResponse(['error' => 'Email et mot de passe requis'], 400);
        }

        $pdo = getDbConnection();
        $stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            jsonResponse(['error' => 'Identifiants incorrects'], 401);
        }

        unset($user['password']);

        jsonResponse([
            'message' => 'Connexion réussie',
            'user' => $user,
        ]);
    }
}
