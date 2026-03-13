<?php

require_once __DIR__ . '/../config/database.php';

class AbsenceController
{
    public function index(array $params): void
    {
        $pdo = getDbConnection();
        $stmt = $pdo->query('
            SELECT a.*, s.nom AS stagiaire_nom
            FROM absences a
            LEFT JOIN stagiaires s ON a.stagiaire_id = s.id
            ORDER BY a.date_absence DESC
        ');
        jsonResponse($stmt->fetchAll());
    }

    public function show(array $params): void
    {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('
            SELECT a.*, s.nom AS stagiaire_nom
            FROM absences a
            LEFT JOIN stagiaires s ON a.stagiaire_id = s.id
            WHERE a.id = :id
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
            INSERT INTO absences (stagiaire_id, type, date_absence, motif, statut)
            VALUES (:stagiaire_id, :type, :date_absence, :motif, :statut)
        ');

        $stmt->execute([
            'stagiaire_id' => $body['stagiaire_id'] ?? 0,
            'type' => $body['type'] ?? 'absence',
            'date_absence' => $body['date_absence'] ?? date('Y-m-d'),
            'motif' => $body['motif'] ?? '',
            'statut' => $body['statut'] ?? 'Non justifiée',
        ]);

        $id = $pdo->lastInsertId();

        $stmt = $pdo->prepare('SELECT * FROM absences WHERE id = :id');
        $stmt->execute(['id' => $id]);

        jsonResponse($stmt->fetch(), 201);
    }

    public function update(array $params): void
    {
        $body = getBody();
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT * FROM absences WHERE id = :id');
        $stmt->execute(['id' => $params['id']]);
        $absence = $stmt->fetch();

        if (!$absence) {
            jsonResponse(['error' => 'Absence non trouvée'], 404);
        }

        $stmt = $pdo->prepare('
            UPDATE absences
            SET stagiaire_id = :stagiaire_id, type = :type, date_absence = :date_absence,
                motif = :motif, statut = :statut
            WHERE id = :id
        ');

        $stmt->execute([
            'stagiaire_id' => $body['stagiaire_id'] ?? $absence['stagiaire_id'],
            'type' => $body['type'] ?? $absence['type'],
            'date_absence' => $body['date_absence'] ?? $absence['date_absence'],
            'motif' => $body['motif'] ?? $absence['motif'],
            'statut' => $body['statut'] ?? $absence['statut'],
            'id' => $params['id'],
        ]);

        $stmt = $pdo->prepare('SELECT * FROM absences WHERE id = :id');
        $stmt->execute(['id' => $params['id']]);

        jsonResponse($stmt->fetch());
    }

    public function destroy(array $params): void
    {
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT id FROM absences WHERE id = :id');
        $stmt->execute(['id' => $params['id']]);

        if (!$stmt->fetch()) {
            jsonResponse(['error' => 'Absence non trouvée'], 404);
        }

        $stmt = $pdo->prepare('DELETE FROM absences WHERE id = :id');
        $stmt->execute(['id' => $params['id']]);

        jsonResponse(['message' => 'Absence supprimée']);
    }
}
