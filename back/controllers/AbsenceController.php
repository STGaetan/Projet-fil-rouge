<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/validation.php';

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
        if (!validateId($params['id'])) {
            jsonResponse(['error' => 'ID invalide'], 400);
        }

        $pdo = getDbConnection();
        $stmt = $pdo->prepare('
            SELECT a.*, s.nom AS stagiaire_nom, s.prenom AS stagiaire_prenom,
                   f.nom_formation
            FROM absence a
            LEFT JOIN stagiaire s ON a.id_stagiaire = s.id_stagiaire
            LEFT JOIN formation f ON a.id_formation = f.id_formation
            WHERE a.id_absence = :id
        ');
        $stmt->execute(['id' => (int) $params['id']]);
        $absence = $stmt->fetch();

        if (!$absence) {
            jsonResponse(['error' => 'Absence non trouvée'], 404);
        }

        jsonResponse($absence);
    }

    public function store(array $params): void
    {
        $body = getBody();

        $clean = validateBody($body, [
            'id_stagiaire'    => ['type' => 'int', 'required' => true],
            'id_formation'    => ['type' => 'int', 'required' => true],
            'date_absence'    => ['type' => 'date', 'required' => false, 'default' => date('Y-m-d')],
            'justif_absence'  => ['type' => 'text', 'required' => false],
        ]);

        $pdo = getDbConnection();

        // Vérifier que le stagiaire existe
        $stmt = $pdo->prepare('SELECT id_stagiaire FROM stagiaire WHERE id_stagiaire = :id');
        $stmt->execute(['id' => $clean['id_stagiaire']]);
        if (!$stmt->fetch()) {
            jsonResponse(['error' => 'Stagiaire non trouvé'], 404);
        }

        // Vérifier que la formation existe
        $stmt = $pdo->prepare('SELECT id_formation FROM formation WHERE id_formation = :id');
        $stmt->execute(['id' => $clean['id_formation']]);
        if (!$stmt->fetch()) {
            jsonResponse(['error' => 'Formation non trouvée'], 404);
        }

        $stmt = $pdo->prepare('
            INSERT INTO absence (id_stagiaire, id_formation, date_absence, justif_absence, justificatif_obligatoire)
            VALUES (:id_stagiaire, :id_formation, :date_absence, :justif_absence, :justificatif_obligatoire)
        ');

        $stmt->execute([
            'id_stagiaire'             => $clean['id_stagiaire'],
            'id_formation'             => $clean['id_formation'],
            'date_absence'             => $clean['date_absence'],
            'justif_absence'           => $clean['justif_absence'],
            'justificatif_obligatoire' => ($clean['justif_absence'] !== null && $clean['justif_absence'] !== '') ? 0 : 1,
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
        if (!validateId($params['id'])) {
            jsonResponse(['error' => 'ID invalide'], 400);
        }

        $body = getBody();
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT * FROM absence WHERE id_absence = :id');
        $stmt->execute(['id' => (int) $params['id']]);
        $absence = $stmt->fetch();

        if (!$absence) {
            jsonResponse(['error' => 'Absence non trouvée'], 404);
        }

        $clean = validateBody($body, [
            'id_stagiaire'    => ['type' => 'int', 'required' => false],
            'id_formation'    => ['type' => 'int', 'required' => false],
            'date_absence'    => ['type' => 'date', 'required' => false],
            'justif_absence'  => ['type' => 'text', 'required' => false],
        ]);

        $justif = array_key_exists('justif_absence', $body) ? $clean['justif_absence'] : $absence['justif_absence'];

        $stmt = $pdo->prepare('
            UPDATE absence
            SET id_stagiaire = :id_stagiaire, id_formation = :id_formation,
                date_absence = :date_absence, justif_absence = :justif_absence,
                justificatif_obligatoire = :justificatif_obligatoire
            WHERE id_absence = :id
        ');

        $stmt->execute([
            'id_stagiaire'             => $clean['id_stagiaire'] ?? $absence['id_stagiaire'],
            'id_formation'             => $clean['id_formation'] ?? $absence['id_formation'],
            'date_absence'             => $clean['date_absence'] ?? $absence['date_absence'],
            'justif_absence'           => $justif,
            'justificatif_obligatoire' => ($justif !== null && $justif !== '') ? 0 : 1,
            'id'                       => (int) $params['id'],
        ]);

        $stmt = $pdo->prepare('
            SELECT a.*, s.nom AS stagiaire_nom, s.prenom AS stagiaire_prenom,
                   f.nom_formation
            FROM absence a
            LEFT JOIN stagiaire s ON a.id_stagiaire = s.id_stagiaire
            LEFT JOIN formation f ON a.id_formation = f.id_formation
            WHERE a.id_absence = :id
        ');
        $stmt->execute(['id' => (int) $params['id']]);

        jsonResponse($stmt->fetch());
    }

    public function destroy(array $params): void
    {
        if (!validateId($params['id'])) {
            jsonResponse(['error' => 'ID invalide'], 400);
        }

        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT id_absence FROM absence WHERE id_absence = :id');
        $stmt->execute(['id' => (int) $params['id']]);

        if (!$stmt->fetch()) {
            jsonResponse(['error' => 'Absence non trouvée'], 404);
        }

        $stmt = $pdo->prepare('DELETE FROM absence WHERE id_absence = :id');
        $stmt->execute(['id' => (int) $params['id']]);

        jsonResponse(['message' => 'Absence supprimée']);
    }
}
