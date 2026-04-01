<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/validation.php';

class AuthController
{
    public function login(array $params): void
    {
        $body = getBody();

        // Validation des entrées
        $clean = validateBody($body, [
            'email'    => ['type' => 'email', 'required' => true],
            'password' => ['type' => 'string', 'required' => true],
        ]);

        $email = $clean['email'];
        $password = $clean['password'];

        $pdo = getDbConnection();
        $stmt = $pdo->prepare('SELECT * FROM utilisateur WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();

        // Message générique pour ne pas révéler si l'email existe
        if (!$user || !password_verify($password, $user['mot_de_passe'])) {
            jsonResponse(['error' => 'Identifiants incorrects'], 401);
        }

        $userData = [
            'id'     => $user['id_user'],
            'nom'    => $user['nom'],
            'prenom' => $user['prenom'],
            'email'  => $user['email'],
            'role'   => $user['role'],
        ];

        // Générer le token JWT
        $token = generateJwt($userData);

        jsonResponse([
            'message' => 'Connexion réussie',
            'token'   => $token,
            'user'    => $userData,
        ]);
    }
}
