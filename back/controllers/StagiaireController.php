<?php

require_once __DIR__ . '/../config/database.php';

class StagiaireController
{
    public function index(array $params): void
    {
        $pdo = getDbConnection();
        $stmt = $pdo->query('
            SELECT s.*, f.nom AS formation_nom
            FROM stagiaires s
            LEFT JOIN formations f ON s.formation_id = f.id
            ORDER BY s.created_at DESC
        ');
        jsonResponse($stmt->fetchAll());
    }

    public function show(array $params): void
    {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('
            SELECT s.*, f.nom AS formation_nom
            FROM stagiaires s
            LEFT JOIN formations f ON s.formation_id = f.id
            WHERE s.id = :id
        ');
        $stmt->execute(['id' => $params['id']]);
        $stagiaire = $stmt->fetch();

        if (!$stagiaire) {
            jsonResponse(['error' => 'Stagiaire non trouvé'], 404);
        }

        jsonResponse($stagiaire);
    }

    public function store(array $params): void
    {
        $body = getBody();
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('
            INSERT INTO stagiaires (nom, email, formation_id, statut, progression)
            VALUES (:nom, :email, :formation_id, :statut, :progression)
        ');

        $stmt->execute([
            'nom' => $body['nom'] ?? '',
            'email' => $body['email'] ?? '',
            'formation_id' => !empty($body['formation_id']) ? $body['formation_id'] : null,
            'statut' => $body['statut'] ?? 'En attente',
            'progression' => $body['progression'] ?? 0,
        ]);

        $id = $pdo->lastInsertId();

        $stmt = $pdo->prepare('SELECT * FROM stagiaires WHERE id = :id');
        $stmt->execute(['id' => $id]);

        jsonResponse($stmt->fetch(), 201);
    }

    public function update(array $params): void
    {
        $body = getBody();
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT * FROM stagiaires WHERE id = :id');
        $stmt->execute(['id' => $params['id']]);
        $stagiaire = $stmt->fetch();

        if (!$stagiaire) {
            jsonResponse(['error' => 'Stagiaire non trouvé'], 404);
        }

        $stmt = $pdo->prepare('
            UPDATE stagiaires
            SET nom = :nom, email = :email, formation_id = :formation_id,
                statut = :statut, progression = :progression
            WHERE id = :id
        ');

        $stmt->execute([
            'nom' => $body['nom'] ?? $stagiaire['nom'],
            'email' => $body['email'] ?? $stagiaire['email'],
            'formation_id' => array_key_exists('formation_id', $body) ? ($body['formation_id'] ?: null) : $stagiaire['formation_id'],
            'statut' => $body['statut'] ?? $stagiaire['statut'],
            'progression' => $body['progression'] ?? $stagiaire['progression'],
            'id' => $params['id'],
        ]);

        $stmt = $pdo->prepare('SELECT * FROM stagiaires WHERE id = :id');
        $stmt->execute(['id' => $params['id']]);

        jsonResponse($stmt->fetch());
    }

    public function destroy(array $params): void
    {
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT id FROM stagiaires WHERE id = :id');
        $stmt->execute(['id' => $params['id']]);

        if (!$stmt->fetch()) {
            jsonResponse(['error' => 'Stagiaire non trouvé'], 404);
        }

        $stmt = $pdo->prepare('DELETE FROM stagiaires WHERE id = :id');
        $stmt->execute(['id' => $params['id']]);

        jsonResponse(['message' => 'Stagiaire supprimé']);
    }
}
