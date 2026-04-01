<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/validation.php';

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
        if (!validateId($params['id'])) {
            jsonResponse(['error' => 'ID invalide'], 400);
        }

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
        $stmt->execute(['id' => (int) $params['id']]);
        $stagiaire = $stmt->fetch();

        if (!$stagiaire) {
            jsonResponse(['error' => 'Stagiaire non trouvé'], 404);
        }

        jsonResponse($stagiaire);
    }

    public function store(array $params): void
    {
        $body = getBody();

        $clean = validateBody($body, [
            'nom'          => ['type' => 'string', 'required' => true],
            'prenom'       => ['type' => 'string', 'required' => true],
            'email'        => ['type' => 'email', 'required' => true],
            'telephone'    => ['type' => 'phone', 'required' => false, 'default' => ''],
            'mot_de_passe' => ['type' => 'string', 'required' => false, 'default' => 'password'],
        ]);

        $pdo = getDbConnection();

        // Vérifier unicité de l'email
        $stmt = $pdo->prepare('SELECT id_stagiaire FROM stagiaire WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $clean['email']]);
        if ($stmt->fetch()) {
            jsonResponse(['error' => 'Cet email est déjà utilisé'], 409);
        }

        $stmt = $pdo->prepare('
            INSERT INTO stagiaire (nom, prenom, email, telephone, mot_de_passe)
            VALUES (:nom, :prenom, :email, :telephone, :mot_de_passe)
        ');

        $stmt->execute([
            'nom'          => $clean['nom'],
            'prenom'       => $clean['prenom'],
            'email'        => $clean['email'],
            'telephone'    => $clean['telephone'],
            'mot_de_passe' => password_hash($clean['mot_de_passe'], PASSWORD_BCRYPT),
        ]);

        $id = $pdo->lastInsertId();
        $stmt = $pdo->prepare('SELECT id_stagiaire, nom, prenom, email, telephone, date_inscription FROM stagiaire WHERE id_stagiaire = :id');
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

        $stmt = $pdo->prepare('SELECT * FROM stagiaire WHERE id_stagiaire = :id');
        $stmt->execute(['id' => (int) $params['id']]);
        $stagiaire = $stmt->fetch();

        if (!$stagiaire) {
            jsonResponse(['error' => 'Stagiaire non trouvé'], 404);
        }

        $clean = validateBody($body, [
            'nom'       => ['type' => 'string', 'required' => false],
            'prenom'    => ['type' => 'string', 'required' => false],
            'email'     => ['type' => 'email', 'required' => false],
            'telephone' => ['type' => 'phone', 'required' => false],
        ]);

        // Vérifier unicité email si modifié
        $email = $clean['email'] ?? $stagiaire['email'];
        if ($email !== $stagiaire['email']) {
            $check = $pdo->prepare('SELECT id_stagiaire FROM stagiaire WHERE email = :email AND id_stagiaire != :id LIMIT 1');
            $check->execute(['email' => $email, 'id' => (int) $params['id']]);
            if ($check->fetch()) {
                jsonResponse(['error' => 'Cet email est déjà utilisé'], 409);
            }
        }

        $stmt = $pdo->prepare('
            UPDATE stagiaire
            SET nom = :nom, prenom = :prenom, email = :email, telephone = :telephone
            WHERE id_stagiaire = :id
        ');

        $stmt->execute([
            'nom'       => $clean['nom'] ?? $stagiaire['nom'],
            'prenom'    => $clean['prenom'] ?? $stagiaire['prenom'],
            'email'     => $email,
            'telephone' => $clean['telephone'] ?? $stagiaire['telephone'],
            'id'        => (int) $params['id'],
        ]);

        $stmt = $pdo->prepare('SELECT id_stagiaire, nom, prenom, email, telephone, date_inscription FROM stagiaire WHERE id_stagiaire = :id');
        $stmt->execute(['id' => (int) $params['id']]);

        jsonResponse($stmt->fetch());
    }

    public function destroy(array $params): void
    {
        if (!validateId($params['id'])) {
            jsonResponse(['error' => 'ID invalide'], 400);
        }

        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT id_stagiaire FROM stagiaire WHERE id_stagiaire = :id');
        $stmt->execute(['id' => (int) $params['id']]);

        if (!$stmt->fetch()) {
            jsonResponse(['error' => 'Stagiaire non trouvé'], 404);
        }

        $stmt = $pdo->prepare('DELETE FROM stagiaire WHERE id_stagiaire = :id');
        $stmt->execute(['id' => (int) $params['id']]);

        jsonResponse(['message' => 'Stagiaire supprimé']);
    }
}
