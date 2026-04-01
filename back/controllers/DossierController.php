<?php

require_once __DIR__ . '/../config/database.php';

class DossierController
{
    public function index(array $params): void
    {
        $pdo = getDbConnection();
        $stmt = $pdo->query('
            SELECT d.*, s.nom AS stagiaire_nom, s.prenom AS stagiaire_prenom,
                   f.nom_formation
            FROM dossier d
            LEFT JOIN stagiaire s ON d.id_stagiaire = s.id_stagiaire
            LEFT JOIN formation f ON d.id_formation = f.id_formation
            ORDER BY d.id_dossier DESC
        ');
        jsonResponse($stmt->fetchAll());
    }

    public function show(array $params): void
    {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('
            SELECT d.*, s.nom AS stagiaire_nom, s.prenom AS stagiaire_prenom,
                   f.nom_formation
            FROM dossier d
            LEFT JOIN stagiaire s ON d.id_stagiaire = s.id_stagiaire
            LEFT JOIN formation f ON d.id_formation = f.id_formation
            WHERE d.id_dossier = :id
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
            INSERT INTO dossier (id_stagiaire, id_formation, statut, id_user)
            VALUES (:id_stagiaire, :id_formation, :statut, :id_user)
        ');

        $stmt->execute([
            'id_stagiaire' => $body['id_stagiaire'],
            'id_formation' => $body['id_formation'],
            'statut'       => $body['statut'] ?? 'En attente',
            'id_user'      => $body['id_user'] ?? null,
        ]);

        $id = $pdo->lastInsertId();
        $stmt = $pdo->prepare('
            SELECT d.*, s.nom AS stagiaire_nom, s.prenom AS stagiaire_prenom,
                   f.nom_formation
            FROM dossier d
            LEFT JOIN stagiaire s ON d.id_stagiaire = s.id_stagiaire
            LEFT JOIN formation f ON d.id_formation = f.id_formation
            WHERE d.id_dossier = :id
        ');
        $stmt->execute(['id' => $id]);

        jsonResponse($stmt->fetch(), 201);
    }

    public function update(array $params): void
    {
        $body = getBody();
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT * FROM dossier WHERE id_dossier = :id');
        $stmt->execute(['id' => $params['id']]);
        $dossier = $stmt->fetch();

        if (!$dossier) {
            jsonResponse(['error' => 'Dossier non trouvé'], 404);
        }

        $stmt = $pdo->prepare('
            UPDATE dossier
            SET id_stagiaire = :id_stagiaire, id_formation = :id_formation,
                statut = :statut, id_user = :id_user
            WHERE id_dossier = :id
        ');

        $stmt->execute([
            'id_stagiaire' => $body['id_stagiaire'] ?? $dossier['id_stagiaire'],
            'id_formation' => $body['id_formation'] ?? $dossier['id_formation'],
            'statut'       => $body['statut'] ?? $dossier['statut'],
            'id_user'      => array_key_exists('id_user', $body) ? $body['id_user'] : $dossier['id_user'],
            'id'           => $params['id'],
        ]);

        $stmt = $pdo->prepare('
            SELECT d.*, s.nom AS stagiaire_nom, s.prenom AS stagiaire_prenom,
                   f.nom_formation
            FROM dossier d
            LEFT JOIN stagiaire s ON d.id_stagiaire = s.id_stagiaire
            LEFT JOIN formation f ON d.id_formation = f.id_formation
            WHERE d.id_dossier = :id
        ');
        $stmt->execute(['id' => $params['id']]);

        jsonResponse($stmt->fetch());
    }

    public function destroy(array $params): void
    {
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT id_dossier FROM dossier WHERE id_dossier = :id');
        $stmt->execute(['id' => $params['id']]);

        if (!$stmt->fetch()) {
            jsonResponse(['error' => 'Dossier non trouvé'], 404);
        }

        $stmt = $pdo->prepare('DELETE FROM dossier WHERE id_dossier = :id');
        $stmt->execute(['id' => $params['id']]);

        jsonResponse(['message' => 'Dossier supprimé']);
    }
}
