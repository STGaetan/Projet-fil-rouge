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
        $stmt = $pdo->prepare('SELECT * FROM utilisateur WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['mot_de_passe'])) {
            jsonResponse(['error' => 'Identifiants incorrects'], 401);
        }

        unset($user['mot_de_passe']);

        jsonResponse([
            'message' => 'Connexion réussie',
            'user' => [
                'id'    => $user['id_user'],
                'nom'   => $user['nom'],
                'prenom'=> $user['prenom'],
                'email' => $user['email'],
                'role'  => $user['role'],
            ],
        ]);
    }
}
