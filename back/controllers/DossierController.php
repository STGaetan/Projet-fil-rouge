<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/validation.php';

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
        if (!validateId($params['id'])) {
            jsonResponse(['error' => 'ID invalide'], 400);
        }

        $pdo = getDbConnection();
        $stmt = $pdo->prepare('
            SELECT d.*, s.nom AS stagiaire_nom, s.prenom AS stagiaire_prenom,
                   f.nom_formation
            FROM dossier d
            LEFT JOIN stagiaire s ON d.id_stagiaire = s.id_stagiaire
            LEFT JOIN formation f ON d.id_formation = f.id_formation
            WHERE d.id_dossier = :id
        ');
        $stmt->execute(['id' => (int) $params['id']]);
        $dossier = $stmt->fetch();

        if (!$dossier) {
            jsonResponse(['error' => 'Dossier non trouvé'], 404);
        }

        jsonResponse($dossier);
    }

    public function store(array $params): void
    {
        $body = getBody();

        $clean = validateBody($body, [
            'id_stagiaire' => ['type' => 'int', 'required' => true],
            'id_formation' => ['type' => 'int', 'required' => true],
            'statut'       => ['type' => 'string', 'required' => false, 'default' => 'En attente'],
            'id_user'      => ['type' => 'int', 'required' => false],
        ]);

        // Valider le statut (liste blanche)
        $validStatuts = ['En attente', 'Complet', 'Incomplet', 'Validé', 'Refusé'];
        if ($clean['statut'] && !in_array($clean['statut'], $validStatuts, true)) {
            jsonResponse(['error' => 'Statut invalide. Valeurs autorisées : ' . implode(', ', $validStatuts)], 422);
        }

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
            INSERT INTO dossier (id_stagiaire, id_formation, statut, id_user)
            VALUES (:id_stagiaire, :id_formation, :statut, :id_user)
        ');

        $stmt->execute([
            'id_stagiaire' => $clean['id_stagiaire'],
            'id_formation' => $clean['id_formation'],
            'statut'       => $clean['statut'],
            'id_user'      => $clean['id_user'],
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
        if (!validateId($params['id'])) {
            jsonResponse(['error' => 'ID invalide'], 400);
        }

        $body = getBody();
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT * FROM dossier WHERE id_dossier = :id');
        $stmt->execute(['id' => (int) $params['id']]);
        $dossier = $stmt->fetch();

        if (!$dossier) {
            jsonResponse(['error' => 'Dossier non trouvé'], 404);
        }

        $clean = validateBody($body, [
            'id_stagiaire' => ['type' => 'int', 'required' => false],
            'id_formation' => ['type' => 'int', 'required' => false],
            'statut'       => ['type' => 'string', 'required' => false],
            'id_user'      => ['type' => 'int', 'required' => false],
        ]);

        // Valider le statut si fourni
        if ($clean['statut']) {
            $validStatuts = ['En attente', 'Complet', 'Incomplet', 'Validé', 'Refusé'];
            if (!in_array($clean['statut'], $validStatuts, true)) {
                jsonResponse(['error' => 'Statut invalide'], 422);
            }
        }

        $stmt = $pdo->prepare('
            UPDATE dossier
            SET id_stagiaire = :id_stagiaire, id_formation = :id_formation,
                statut = :statut, id_user = :id_user
            WHERE id_dossier = :id
        ');

        $stmt->execute([
            'id_stagiaire' => $clean['id_stagiaire'] ?? $dossier['id_stagiaire'],
            'id_formation' => $clean['id_formation'] ?? $dossier['id_formation'],
            'statut'       => $clean['statut'] ?? $dossier['statut'],
            'id_user'      => array_key_exists('id_user', $body) ? $clean['id_user'] : $dossier['id_user'],
            'id'           => (int) $params['id'],
        ]);

        $stmt = $pdo->prepare('
            SELECT d.*, s.nom AS stagiaire_nom, s.prenom AS stagiaire_prenom,
                   f.nom_formation
            FROM dossier d
            LEFT JOIN stagiaire s ON d.id_stagiaire = s.id_stagiaire
            LEFT JOIN formation f ON d.id_formation = f.id_formation
            WHERE d.id_dossier = :id
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

        $stmt = $pdo->prepare('SELECT id_dossier FROM dossier WHERE id_dossier = :id');
        $stmt->execute(['id' => (int) $params['id']]);

        if (!$stmt->fetch()) {
            jsonResponse(['error' => 'Dossier non trouvé'], 404);
        }

        $stmt = $pdo->prepare('DELETE FROM dossier WHERE id_dossier = :id');
        $stmt->execute(['id' => (int) $params['id']]);

        jsonResponse(['message' => 'Dossier supprimé']);
    }
}
