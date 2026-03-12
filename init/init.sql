-- =====================================================
-- MNS Admin - Script d'initialisation de la base
-- Basé sur le MCD du projet fil rouge
-- =====================================================

SET NAMES utf8mb4;

-- =====================================================
-- STRUCTURE DES TABLES
-- =====================================================

-- 1. Utilisateur (Administrateur)
-- Les comptes admin qui gèrent la plateforme
CREATE TABLE IF NOT EXISTS utilisateur (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Formation
CREATE TABLE IF NOT EXISTS formation (
    id_formation INT AUTO_INCREMENT PRIMARY KEY,
    nom_formation VARCHAR(200) NOT NULL,
    description TEXT,
    duree VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Stagiaire
CREATE TABLE IF NOT EXISTS stagiaire (
    id_stagiaire INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telephone VARCHAR(20),
    mot_de_passe VARCHAR(255) NOT NULL,
    date_inscription DATE NOT NULL DEFAULT (CURRENT_DATE)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Absence
-- Relation AVOIR_ABSENCE : un stagiaire peut avoir 0 à N absences
CREATE TABLE IF NOT EXISTS absence (
    id_absence INT AUTO_INCREMENT PRIMARY KEY,
    id_stagiaire INT NOT NULL,
    id_formation INT NOT NULL,
    date_absence DATE NOT NULL,
    justif_absence TEXT,
    justificatif_obligatoire TINYINT(1) NOT NULL DEFAULT 1,
    FOREIGN KEY (id_stagiaire) REFERENCES stagiaire(id_stagiaire) ON DELETE CASCADE,
    FOREIGN KEY (id_formation) REFERENCES formation(id_formation) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Retard
-- Relation AVOIR_RETARD : un stagiaire peut avoir 0 à N retards
CREATE TABLE IF NOT EXISTS retard (
    id_retard INT AUTO_INCREMENT PRIMARY KEY,
    id_stagiaire INT NOT NULL,
    id_formation INT NOT NULL,
    date_retard DATE NOT NULL,
    temps_retard VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_stagiaire) REFERENCES stagiaire(id_stagiaire) ON DELETE CASCADE,
    FOREIGN KEY (id_formation) REFERENCES formation(id_formation) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Dossier
-- Lié à un stagiaire et une formation
-- id_user = l'admin qui a validé le dossier (relation VALIDER_DOSSIER, peut être NULL si pas encore validé)
CREATE TABLE IF NOT EXISTS dossier (
    id_dossier INT AUTO_INCREMENT PRIMARY KEY,
    id_stagiaire INT NOT NULL,
    id_formation INT NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'En attente',
    id_user INT,
    FOREIGN KEY (id_stagiaire) REFERENCES stagiaire(id_stagiaire) ON DELETE CASCADE,
    FOREIGN KEY (id_formation) REFERENCES formation(id_formation) ON DELETE CASCADE,
    FOREIGN KEY (id_user) REFERENCES utilisateur(id_user) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. PieceJustificativeType
-- Les types de pièces à fournir (ex: "Carte d'identité", "Certificat médical", etc.)
CREATE TABLE IF NOT EXISTS piece_justificative_type (
    id_piece_type INT AUTO_INCREMENT PRIMARY KEY,
    nom_piece VARCHAR(200) NOT NULL,
    obligatoire TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Table de jonction : POSSEDER_PIECES (Formation ↔ PieceJustificativeType)
-- Une formation exige certains types de pièces, et un type de pièce peut être requis par plusieurs formations
CREATE TABLE IF NOT EXISTS formation_piece_type (
    id_formation INT NOT NULL,
    id_piece_type INT NOT NULL,
    PRIMARY KEY (id_formation, id_piece_type),
    FOREIGN KEY (id_formation) REFERENCES formation(id_formation) ON DELETE CASCADE,
    FOREIGN KEY (id_piece_type) REFERENCES piece_justificative_type(id_piece_type) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Document
-- Un document concret déposé par un stagiaire dans un dossier
-- id_user = l'admin qui a géré/vérifié le document (relation GERER_DOCUMENT)
CREATE TABLE IF NOT EXISTS document (
    id_document INT AUTO_INCREMENT PRIMARY KEY,
    id_dossier INT NOT NULL,
    id_piece_type INT NOT NULL,
    chemin_fichier VARCHAR(500) NOT NULL,
    date_depot DATE NOT NULL DEFAULT (CURRENT_DATE),
    statut_validation VARCHAR(50) NOT NULL DEFAULT 'En attente',
    id_user INT,
    FOREIGN KEY (id_dossier) REFERENCES dossier(id_dossier) ON DELETE CASCADE,
    FOREIGN KEY (id_piece_type) REFERENCES piece_justificative_type(id_piece_type) ON DELETE CASCADE,
    FOREIGN KEY (id_user) REFERENCES utilisateur(id_user) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Notification
-- Relation SERA_NOTIFIE : un stagiaire reçoit des notifications
CREATE TABLE IF NOT EXISTS notification (
    id_notification INT AUTO_INCREMENT PRIMARY KEY,
    id_stagiaire INT NOT NULL,
    type_notification VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    date_notification DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lu TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (id_stagiaire) REFERENCES stagiaire(id_stagiaire) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =====================================================
-- DONNÉES DE DÉMONSTRATION
-- =====================================================

-- Utilisateur admin (mot de passe hashé de "password" avec password_hash PHP bcrypt)
INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, role) VALUES
('Admin', 'Laura', 'admin@mns.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Formations
INSERT INTO formation (nom_formation, description, duree) VALUES
('Développeur Web & Mobile', 'Formation complète en développement web et mobile full-stack', '12 mois'),
('Concepteur Développeur d\'Applications', 'Conception et développement d\'applications complexes', '12 mois'),
('Data & IA', 'Analyse de données, machine learning et intelligence artificielle', '10 mois'),
('Cybersécurité', 'Sécurité des systèmes et réseaux informatiques', '9 mois'),
('Systèmes et Réseaux', 'Administration systèmes et infrastructure réseau', '10 mois');

-- Stagiaires (mot de passe hashé de "password")
INSERT INTO stagiaire (nom, prenom, email, telephone, mot_de_passe) VALUES
('Dupont', 'Jean', 'jean.dupont@email.com', '0612345678', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('Curie', 'Marie', 'marie.curie@email.com', '0623456789', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('Turing', 'Alan', 'alan.turing@email.com', '0634567890', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('Lovelace', 'Ada', 'ada.lovelace@email.com', '0645678901', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('Hopper', 'Grace', 'grace.hopper@email.com', '0656789012', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('Berners-Lee', 'Tim', 'tim.b@email.com', '0667890123', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Types de pièces justificatives
INSERT INTO piece_justificative_type (nom_piece, obligatoire) VALUES
('Carte d\'identité', 1),
('Justificatif de domicile', 1),
('CV', 1),
('Lettre de motivation', 1),
('Diplôme(s) précédent(s)', 1),
('Photo d\'identité', 1),
('Certificat médical', 0),
('Attestation Pôle Emploi', 0);

-- Lien Formation ↔ Pièces requises (toutes les formations demandent les 6 premières pièces)
INSERT INTO formation_piece_type (id_formation, id_piece_type) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6),
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6),
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6),
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6),
(5, 1), (5, 2), (5, 3), (5, 4), (5, 5), (5, 6);

-- Dossiers (stagiaire + formation + statut)
INSERT INTO dossier (id_stagiaire, id_formation, statut, id_user) VALUES
(1, 1, 'Complet', 1),
(2, 3, 'Complet', 1),
(3, 4, 'En attente', NULL),
(4, 1, 'Incomplet', NULL),
(5, 5, 'Complet', 1),
(6, 1, 'En attente', NULL);

-- Documents déposés
INSERT INTO document (id_dossier, id_piece_type, chemin_fichier, date_depot, statut_validation, id_user) VALUES
(1, 1, '/uploads/1/carte_identite.pdf', '2026-01-15', 'Validé', 1),
(1, 2, '/uploads/1/justificatif_domicile.pdf', '2026-01-15', 'Validé', 1),
(1, 3, '/uploads/1/cv.pdf', '2026-01-16', 'Validé', 1),
(2, 1, '/uploads/2/carte_identite.pdf', '2026-02-01', 'Validé', 1),
(2, 3, '/uploads/2/cv.pdf', '2026-02-02', 'Validé', 1),
(3, 1, '/uploads/3/carte_identite.pdf', '2026-03-01', 'En attente', NULL),
(4, 1, '/uploads/4/carte_identite.pdf', '2026-02-20', 'Validé', 1),
(4, 3, '/uploads/4/cv.pdf', '2026-02-20', 'Refusé', 1);

-- Absences
INSERT INTO absence (id_stagiaire, id_formation, date_absence, justif_absence, justificatif_obligatoire) VALUES
(1, 1, '2026-03-10', 'Maladie - certificat fourni', 0),
(2, 3, '2026-03-08', NULL, 1),
(4, 1, '2026-03-09', NULL, 1),
(5, 5, '2026-03-11', 'Urgence familiale', 0);

-- Retards
INSERT INTO retard (id_stagiaire, id_formation, date_retard, temps_retard) VALUES
(1, 1, '2026-03-05', '15 min'),
(4, 1, '2026-03-11', '30 min'),
(6, 1, '2026-03-07', '1h'),
(2, 3, '2026-03-12', '10 min');

-- Notifications
INSERT INTO notification (id_stagiaire, type_notification, message) VALUES
(3, 'dossier', 'Votre dossier d\'inscription est en attente de validation.'),
(4, 'document', 'Votre CV a été refusé. Merci de le renvoyer.'),
(2, 'absence', 'Vous avez une absence non justifiée le 08/03/2026.');
