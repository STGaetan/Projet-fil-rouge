<?php

require_once __DIR__ . '/../config/database.php';

class StagiaireController
{
    public function index(array $params): void
    {
        $pdo = getDbConnection();
        $stmt = $pdo->query('
            SELECT s.id_stagiaire, s.nom, s.prenom, s.email, s.telephone, s.date_inscription,
                   f.nom_formation,
                   d.statut     AS dossier_statut,
                   d.id_dossier AS dossier_id,
                   d.id_formation
            FROM stagiaire s
            LEFT JOIN dossier d ON d.id_dossier = (
                SELECT id_dossier FROM dossier WHERE id_stagiaire = s.id_stagiaire
                ORDER BY id_dossier DESC LIMIT 1
            )
            LEFT JOIN formation f ON d.id_formation = f.id_formation
            ORDER BY s.id_stagiaire DESC
        ');
        jsonResponse($stmt->fetchAll());
    }

    public function show(array $params): void
    {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('
            SELECT s.id_stagiaire, s.nom, s.prenom, s.email, s.telephone, s.date_inscription,
                   f.nom_formation,
                   d.statut     AS dossier_statut,
                   d.id_dossier AS dossier_id,
                   d.id_formation,
                   (SELECT COUNT(*) FROM absence WHERE id_stagiaire = s.id_stagiaire) AS nb_absences,
                   (SELECT COUNT(*) FROM retard  WHERE id_stagiaire = s.id_stagiaire) AS nb_retards
            FROM stagiaire s
            LEFT JOIN dossier d ON d.id_dossier = (
                SELECT id_dossier FROM dossier WHERE id_stagiaire = s.id_stagiaire
                ORDER BY id_dossier DESC LIMIT 1
            )
            LEFT JOIN formation f ON d.id_formation = f.id_formation
            WHERE s.id_stagiaire = :id
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
            INSERT INTO stagiaire (nom, prenom, email, telephone, mot_de_passe)
            VALUES (:nom, :prenom, :email, :telephone, :mot_de_passe)
        ');

        $stmt->execute([
            'nom'           => $body['nom'] ?? '',
            'prenom'        => $body['prenom'] ?? '',
            'email'         => $body['email'] ?? '',
            'telephone'     => $body['telephone'] ?? '',
            'mot_de_passe'  => password_hash($body['mot_de_passe'] ?? 'password', PASSWORD_BCRYPT),
        ]);

        $id = $pdo->lastInsertId();
        $stmt = $pdo->prepare('SELECT * FROM stagiaire WHERE id_stagiaire = :id');
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        unset($result['mot_de_passe']);

        jsonResponse($result, 201);
    }

    public function update(array $params): void
    {
        $body = getBody();
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT * FROM stagiaire WHERE id_stagiaire = :id');
        $stmt->execute(['id' => $params['id']]);
        $stagiaire = $stmt->fetch();

        if (!$stagiaire) {
            jsonResponse(['error' => 'Stagiaire non trouvé'], 404);
        }

        $stmt = $pdo->prepare('
            UPDATE stagiaire
            SET nom = :nom, prenom = :prenom, email = :email, telephone = :telephone
            WHERE id_stagiaire = :id
        ');

        $stmt->execute([
            'nom'       => $body['nom'] ?? $stagiaire['nom'],
            'prenom'    => $body['prenom'] ?? $stagiaire['prenom'],
            'email'     => $body['email'] ?? $stagiaire['email'],
            'telephone' => $body['telephone'] ?? $stagiaire['telephone'],
            'id'        => $params['id'],
        ]);

        $stmt = $pdo->prepare('SELECT * FROM stagiaire WHERE id_stagiaire = :id');
        $stmt->execute(['id' => $params['id']]);
        $result = $stmt->fetch();
        unset($result['mot_de_passe']);

        jsonResponse($result);
    }

    public function destroy(array $params): void
    {
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT id_stagiaire FROM stagiaire WHERE id_stagiaire = :id');
        $stmt->execute(['id' => $params['id']]);

        if (!$stmt->fetch()) {
            jsonResponse(['error' => 'Stagiaire non trouvé'], 404);
        }

        $stmt = $pdo->prepare('DELETE FROM stagiaire WHERE id_stagiaire = :id');
        $stmt->execute(['id' => $params['id']]);

        jsonResponse(['message' => 'Stagiaire supprimé']);
    }
}
