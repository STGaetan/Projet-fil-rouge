<?php

require_once __DIR__ . '/../config/database.php';

class FormationController
{
    public function index(array $params): void
    {
        $pdo = getDbConnection();
        $stmt = $pdo->query('SELECT * FROM formations ORDER BY created_at DESC');
        jsonResponse($stmt->fetchAll());
    }

    public function show(array $params): void
    {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('SELECT * FROM formations WHERE id = :id');
        $stmt->execute(['id' => $params['id']]);
        $formation = $stmt->fetch();

        if (!$formation) {
            jsonResponse(['error' => 'Formation non trouvée'], 404);
        }

        jsonResponse($formation);
    }

    public function store(array $params): void
    {
        $body = getBody();
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('
            INSERT INTO formations (nom, description, duree, statut, places_total, places_prises)
            VALUES (:nom, :description, :duree, :statut, :places_total, :places_prises)
        ');

        $stmt->execute([
            'nom' => $body['nom'] ?? '',
            'description' => $body['description'] ?? '',
            'duree' => $body['duree'] ?? '',
            'statut' => $body['statut'] ?? 'Active',
            'places_total' => $body['places_total'] ?? 20,
            'places_prises' => $body['places_prises'] ?? 0,
        ]);

        $id = $pdo->lastInsertId();

        $stmt = $pdo->prepare('SELECT * FROM formations WHERE id = :id');
        $stmt->execute(['id' => $id]);

        jsonResponse($stmt->fetch(), 201);
    }

    public function update(array $params): void
    {
        $body = getBody();
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT * FROM formations WHERE id = :id');
        $stmt->execute(['id' => $params['id']]);
        $formation = $stmt->fetch();

        if (!$formation) {
            jsonResponse(['error' => 'Formation non trouvée'], 404);
        }

        $stmt = $pdo->prepare('
            UPDATE formations
            SET nom = :nom, description = :description, duree = :duree,
                statut = :statut, places_total = :places_total, places_prises = :places_prises
            WHERE id = :id
        ');

        $stmt->execute([
            'nom' => $body['nom'] ?? $formation['nom'],
            'description' => $body['description'] ?? $formation['description'],
            'duree' => $body['duree'] ?? $formation['duree'],
            'statut' => $body['statut'] ?? $formation['statut'],
            'places_total' => $body['places_total'] ?? $formation['places_total'],
            'places_prises' => $body['places_prises'] ?? $formation['places_prises'],
            'id' => $params['id'],
        ]);

        $stmt = $pdo->prepare('SELECT * FROM formations WHERE id = :id');
        $stmt->execute(['id' => $params['id']]);

        jsonResponse($stmt->fetch());
    }

    public function destroy(array $params): void
    {
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT id FROM formations WHERE id = :id');
        $stmt->execute(['id' => $params['id']]);

        if (!$stmt->fetch()) {
            jsonResponse(['error' => 'Formation non trouvée'], 404);
        }

        $stmt = $pdo->prepare('DELETE FROM formations WHERE id = :id');
        $stmt->execute(['id' => $params['id']]);

        jsonResponse(['message' => 'Formation supprimée']);
    }
}
