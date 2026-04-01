<?php

require_once __DIR__ . '/../config/database.php';

class RetardController
{
    public function index(array $params): void
    {
        $pdo = getDbConnection();
        $stmt = $pdo->query('
            SELECT r.*, s.nom AS stagiaire_nom, s.prenom AS stagiaire_prenom,
                   f.nom_formation
            FROM retard r
            LEFT JOIN stagiaire s ON r.id_stagiaire = s.id_stagiaire
            LEFT JOIN formation f ON r.id_formation = f.id_formation
            ORDER BY r.date_retard DESC
        ');
        jsonResponse($stmt->fetchAll());
    }

    public function show(array $params): void
    {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('
            SELECT r.*, s.nom AS stagiaire_nom, s.prenom AS stagiaire_prenom,
                   f.nom_formation
            FROM retard r
            LEFT JOIN stagiaire s ON r.id_stagiaire = s.id_stagiaire
            LEFT JOIN formation f ON r.id_formation = f.id_formation
            WHERE r.id_retard = :id
        ');
        $stmt->execute(['id' => $params['id']]);
        $retard = $stmt->fetch();

        if (!$retard) {
            jsonResponse(['error' => 'Retard non trouvé'], 404);
        }

        jsonResponse($retard);
    }

    public function store(array $params): void
    {
        $body = getBody();
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('
            INSERT INTO retard (id_stagiaire, id_formation, date_retard, temps_retard)
            VALUES (:id_stagiaire, :id_formation, :date_retard, :temps_retard)
        ');

        $stmt->execute([
            'id_stagiaire' => $body['id_stagiaire'],
            'id_formation' => $body['id_formation'],
            'date_retard' => $body['date_retard'] ?? date('Y-m-d'),
            'temps_retard' => $body['temps_retard'] ?? '',
        ]);

        $id = $pdo->lastInsertId();

        $stmt = $pdo->prepare('
            SELECT r.*, s.nom AS stagiaire_nom, s.prenom AS stagiaire_prenom,
                   f.nom_formation
            FROM retard r
            LEFT JOIN stagiaire s ON r.id_stagiaire = s.id_stagiaire
            LEFT JOIN formation f ON r.id_formation = f.id_formation
            WHERE r.id_retard = :id
        ');
        $stmt->execute(['id' => $id]);

        jsonResponse($stmt->fetch(), 201);
    }

    public function update(array $params): void
    {
        $body = getBody();
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT * FROM retard WHERE id_retard = :id');
        $stmt->execute(['id' => $params['id']]);
        $retard = $stmt->fetch();

        if (!$retard) {
            jsonResponse(['error' => 'Retard non trouvé'], 404);
        }

        $stmt = $pdo->prepare('
            UPDATE retard
            SET id_stagiaire = :id_stagiaire, id_formation = :id_formation,
                date_retard = :date_retard, temps_retard = :temps_retard
            WHERE id_retard = :id
        ');

        $stmt->execute([
            'id_stagiaire' => $body['id_stagiaire'] ?? $retard['id_stagiaire'],
            'id_formation' => $body['id_formation'] ?? $retard['id_formation'],
            'date_retard' => $body['date_retard'] ?? $retard['date_retard'],
            'temps_retard' => $body['temps_retard'] ?? $retard['temps_retard'],
            'id' => $params['id'],
        ]);

        $stmt = $pdo->prepare('
            SELECT r.*, s.nom AS stagiaire_nom, s.prenom AS stagiaire_prenom,
                   f.nom_formation
            FROM retard r
            LEFT JOIN stagiaire s ON r.id_stagiaire = s.id_stagiaire
            LEFT JOIN formation f ON r.id_formation = f.id_formation
            WHERE r.id_retard = :id
        ');
        $stmt->execute(['id' => $params['id']]);

        jsonResponse($stmt->fetch());
    }

    public function destroy(array $params): void
    {
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT id_retard FROM retard WHERE id_retard = :id');
        $stmt->execute(['id' => $params['id']]);

        if (!$stmt->fetch()) {
            jsonResponse(['error' => 'Retard non trouvé'], 404);
        }

        $stmt = $pdo->prepare('DELETE FROM retard WHERE id_retard = :id');
        $stmt->execute(['id' => $params['id']]);

        jsonResponse(['message' => 'Retard supprimé']);
    }
}
