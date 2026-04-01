<?php

require_once __DIR__ . '/../config/database.php';

class AbsenceController
{
    public function index(array $params): void
    {
        $pdo = getDbConnection();
        $stmt = $pdo->query('
            SELECT a.*, s.nom AS stagiaire_nom, s.prenom AS stagiaire_prenom,
                   f.nom_formation
            FROM absence a
            LEFT JOIN stagiaire s ON a.id_stagiaire = s.id_stagiaire
            LEFT JOIN formation f ON a.id_formation = f.id_formation
            ORDER BY a.date_absence DESC
        ');
        jsonResponse($stmt->fetchAll());
    }

    public function show(array $params): void
    {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('
            SELECT a.*, s.nom AS stagiaire_nom, s.prenom AS stagiaire_prenom,
                   f.nom_formation
            FROM absence a
            LEFT JOIN stagiaire s ON a.id_stagiaire = s.id_stagiaire
            LEFT JOIN formation f ON a.id_formation = f.id_formation
            WHERE a.id_absence = :id
        ');
        $stmt->execute(['id' => $params['id']]);
        $absence = $stmt->fetch();

        if (!$absence) {
            jsonResponse(['error' => 'Absence non trouvée'], 404);
        }

        jsonResponse($absence);
    }

    public function store(array $params): void
    {
        $body = getBody();
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('
            INSERT INTO absence (id_stagiaire, id_formation, date_absence, justif_absence, justificatif_obligatoire)
            VALUES (:id_stagiaire, :id_formation, :date_absence, :justif_absence, :justificatif_obligatoire)
        ');

        $stmt->execute([
            'id_stagiaire'              => $body['id_stagiaire'],
            'id_formation'              => $body['id_formation'],
            'date_absence'              => $body['date_absence'] ?? date('Y-m-d'),
            'justif_absence'            => $body['justif_absence'] ?? null,
            'justificatif_obligatoire'  => isset($body['justif_absence']) && $body['justif_absence'] ? 0 : 1,
        ]);

        $id = $pdo->lastInsertId();

        $stmt = $pdo->prepare('
            SELECT a.*, s.nom AS stagiaire_nom, s.prenom AS stagiaire_prenom,
                   f.nom_formation
            FROM absence a
            LEFT JOIN stagiaire s ON a.id_stagiaire = s.id_stagiaire
            LEFT JOIN formation f ON a.id_formation = f.id_formation
            WHERE a.id_absence = :id
        ');
        $stmt->execute(['id' => $id]);

        jsonResponse($stmt->fetch(), 201);
    }

    public function update(array $params): void
    {
        $body = getBody();
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT * FROM absence WHERE id_absence = :id');
        $stmt->execute(['id' => $params['id']]);
        $absence = $stmt->fetch();

        if (!$absence) {
            jsonResponse(['error' => 'Absence non trouvée'], 404);
        }

        $stmt = $pdo->prepare('
            UPDATE absence
            SET id_stagiaire = :id_stagiaire, id_formation = :id_formation,
                date_absence = :date_absence, justif_absence = :justif_absence,
                justificatif_obligatoire = :justificatif_obligatoire
            WHERE id_absence = :id
        ');

        $justif = array_key_exists('justif_absence', $body) ? $body['justif_absence'] : $absence['justif_absence'];

        $stmt->execute([
            'id_stagiaire'              => $body['id_stagiaire'] ?? $absence['id_stagiaire'],
            'id_formation'              => $body['id_formation'] ?? $absence['id_formation'],
            'date_absence'              => $body['date_absence'] ?? $absence['date_absence'],
            'justif_absence'            => $justif,
            'justificatif_obligatoire'  => ($justif !== null && $justif !== '') ? 0 : 1,
            'id'                        => $params['id'],
        ]);

        $stmt = $pdo->prepare('
            SELECT a.*, s.nom AS stagiaire_nom, s.prenom AS stagiaire_prenom,
                   f.nom_formation
            FROM absence a
            LEFT JOIN stagiaire s ON a.id_stagiaire = s.id_stagiaire
            LEFT JOIN formation f ON a.id_formation = f.id_formation
            WHERE a.id_absence = :id
        ');
        $stmt->execute(['id' => $params['id']]);

        jsonResponse($stmt->fetch());
    }

    public function destroy(array $params): void
    {
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT id_absence FROM absence WHERE id_absence = :id');
        $stmt->execute(['id' => $params['id']]);

        if (!$stmt->fetch()) {
            jsonResponse(['error' => 'Absence non trouvée'], 404);
        }

        $stmt = $pdo->prepare('DELETE FROM absence WHERE id_absence = :id');
        $stmt->execute(['id' => $params['id']]);

        jsonResponse(['message' => 'Absence supprimée']);
    }
}
