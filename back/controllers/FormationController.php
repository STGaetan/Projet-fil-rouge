<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/validation.php';

class FormationController
{
    public function index(array $params): void
    {
        $pdo = getDbConnection();
        $stmt = $pdo->query('SELECT * FROM formation ORDER BY id_formation DESC');
        jsonResponse($stmt->fetchAll());
    }

    public function show(array $params): void
    {
        if (!validateId($params['id'])) {
            jsonResponse(['error' => 'ID invalide'], 400);
        }

        $pdo = getDbConnection();
        $stmt = $pdo->prepare('SELECT * FROM formation WHERE id_formation = :id');
        $stmt->execute(['id' => (int) $params['id']]);
        $formation = $stmt->fetch();

        if (!$formation) {
            jsonResponse(['error' => 'Formation non trouvée'], 404);
        }

        jsonResponse($formation);
    }

    public function stagiaires(array $params): void
    {
        if (!validateId($params['id'])) {
            jsonResponse(['error' => 'ID invalide'], 400);
        }

        $pdo = getDbConnection();
        $stmt = $pdo->prepare('
            SELECT DISTINCT s.id_stagiaire, s.nom, s.prenom, s.email, s.telephone
            FROM stagiaire s
            INNER JOIN dossier d ON s.id_stagiaire = d.id_stagiaire
            WHERE d.id_formation = :id
            ORDER BY s.nom, s.prenom
        ');
        $stmt->execute(['id' => (int) $params['id']]);
        jsonResponse($stmt->fetchAll());
    }

    public function store(array $params): void
    {
        $body = getBody();

        $clean = validateBody($body, [
            'nom_formation' => ['type' => 'string', 'required' => true],
            'description'   => ['type' => 'text', 'required' => false, 'default' => ''],
            'duree'         => ['type' => 'string', 'required' => false, 'default' => ''],
        ]);

        $pdo = getDbConnection();

        $stmt = $pdo->prepare('
            INSERT INTO formation (nom_formation, description, duree)
            VALUES (:nom_formation, :description, :duree)
        ');

        $stmt->execute([
            'nom_formation' => $clean['nom_formation'],
            'description'   => $clean['description'],
            'duree'         => $clean['duree'],
        ]);

        $id = $pdo->lastInsertId();
        $stmt = $pdo->prepare('SELECT * FROM formation WHERE id_formation = :id');
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

        $stmt = $pdo->prepare('SELECT * FROM formation WHERE id_formation = :id');
        $stmt->execute(['id' => (int) $params['id']]);
        $formation = $stmt->fetch();

        if (!$formation) {
            jsonResponse(['error' => 'Formation non trouvée'], 404);
        }

        $clean = validateBody($body, [
            'nom_formation' => ['type' => 'string', 'required' => false],
            'description'   => ['type' => 'text', 'required' => false],
            'duree'         => ['type' => 'string', 'required' => false],
        ]);

        $stmt = $pdo->prepare('
            UPDATE formation
            SET nom_formation = :nom_formation, description = :description, duree = :duree
            WHERE id_formation = :id
        ');

        $stmt->execute([
            'nom_formation' => $clean['nom_formation'] ?? $formation['nom_formation'],
            'description'   => $clean['description'] ?? $formation['description'],
            'duree'         => $clean['duree'] ?? $formation['duree'],
            'id'            => (int) $params['id'],
        ]);

        $stmt = $pdo->prepare('SELECT * FROM formation WHERE id_formation = :id');
        $stmt->execute(['id' => (int) $params['id']]);

        jsonResponse($stmt->fetch());
    }

    public function destroy(array $params): void
    {
        if (!validateId($params['id'])) {
            jsonResponse(['error' => 'ID invalide'], 400);
        }

        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT id_formation FROM formation WHERE id_formation = :id');
        $stmt->execute(['id' => (int) $params['id']]);

        if (!$stmt->fetch()) {
            jsonResponse(['error' => 'Formation non trouvée'], 404);
        }

        $stmt = $pdo->prepare('DELETE FROM formation WHERE id_formation = :id');
        $stmt->execute(['id' => (int) $params['id']]);

        jsonResponse(['message' => 'Formation supprimée']);
    }
}
