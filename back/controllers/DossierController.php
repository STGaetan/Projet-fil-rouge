<?php

require_once __DIR__ . '/../config/database.php';

class DossierController
{
    public function index(array $params): void
    {
        $pdo = getDbConnection();
        $stmt = $pdo->query('
            SELECT d.*, s.nom AS stagiaire_nom
            FROM dossiers d
            LEFT JOIN stagiaires s ON d.stagiaire_id = s.id
            ORDER BY d.created_at DESC
        ');
        jsonResponse($stmt->fetchAll());
    }

    public function show(array $params): void
    {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('
            SELECT d.*, s.nom AS stagiaire_nom
            FROM dossiers d
            LEFT JOIN stagiaires s ON d.stagiaire_id = s.id
            WHERE d.id = :id
        ');
        $stmt->execute(['id' => $params['id']]);
        $dossier = $stmt->fetch();

        if (!$dossier) {
            jsonResponse(['error' => 'Dossier non trouvé'], 404);
        }

        jsonResponse($dossier);
    }

    public function store(array $params): void
    {
        $body = getBody();
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('
            INSERT INTO dossiers (stagiaire_id, titre, type, statut)
            VALUES (:stagiaire_id, :titre, :type, :statut)
        ');

        $stmt->execute([
            'stagiaire_id' => $body['stagiaire_id'] ?? 0,
            'titre' => $body['titre'] ?? '',
            'type' => $body['type'] ?? 'Administratif',
            'statut' => $body['statut'] ?? 'En attente',
        ]);

        $id = $pdo->lastInsertId();

        $stmt = $pdo->prepare('SELECT * FROM dossiers WHERE id = :id');
        $stmt->execute(['id' => $id]);

        jsonResponse($stmt->fetch(), 201);
    }

    public function update(array $params): void
    {
        $body = getBody();
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT * FROM dossiers WHERE id = :id');
        $stmt->execute(['id' => $params['id']]);
        $dossier = $stmt->fetch();

        if (!$dossier) {
            jsonResponse(['error' => 'Dossier non trouvé'], 404);
        }

        $stmt = $pdo->prepare('
            UPDATE dossiers
            SET stagiaire_id = :stagiaire_id, titre = :titre, type = :type, statut = :statut
            WHERE id = :id
        ');

        $stmt->execute([
            'stagiaire_id' => $body['stagiaire_id'] ?? $dossier['stagiaire_id'],
            'titre' => $body['titre'] ?? $dossier['titre'],
            'type' => $body['type'] ?? $dossier['type'],
            'statut' => $body['statut'] ?? $dossier['statut'],
            'id' => $params['id'],
        ]);

        $stmt = $pdo->prepare('SELECT * FROM dossiers WHERE id = :id');
        $stmt->execute(['id' => $params['id']]);

        jsonResponse($stmt->fetch());
    }

    public function destroy(array $params): void
    {
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT id FROM dossiers WHERE id = :id');
        $stmt->execute(['id' => $params['id']]);

        if (!$stmt->fetch()) {
            jsonResponse(['error' => 'Dossier non trouvé'], 404);
        }

        $stmt = $pdo->prepare('DELETE FROM dossiers WHERE id = :id');
        $stmt->execute(['id' => $params['id']]);

        jsonResponse(['message' => 'Dossier supprimé']);
    }
}
