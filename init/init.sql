-- =====================================================
-- MNS Admin - Script d'initialisation de la base
-- =====================================================

SET NAMES utf8mb4;

-- Table des utilisateurs (admin)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des formations
CREATE TABLE IF NOT EXISTS formations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    description TEXT,
    duree VARCHAR(50),
    statut VARCHAR(50) NOT NULL DEFAULT 'Active',
    places_total INT NOT NULL DEFAULT 20,
    places_prises INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des stagiaires
CREATE TABLE IF NOT EXISTS stagiaires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    formation_id INT,
    statut VARCHAR(50) NOT NULL DEFAULT 'En attente',
    progression INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des dossiers
CREATE TABLE IF NOT EXISTS dossiers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stagiaire_id INT NOT NULL,
    titre VARCHAR(200) NOT NULL,
    type VARCHAR(100) NOT NULL DEFAULT 'Administratif',
    statut VARCHAR(50) NOT NULL DEFAULT 'En attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stagiaire_id) REFERENCES stagiaires(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des absences
CREATE TABLE IF NOT EXISTS absences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stagiaire_id INT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'absence',
    date_absence DATE NOT NULL,
    motif TEXT,
    statut VARCHAR(50) NOT NULL DEFAULT 'Non justifiée',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stagiaire_id) REFERENCES stagiaires(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Données de démonstration
-- =====================================================

-- Utilisateur admin (mot de passe: password)
INSERT INTO users (nom, email, password, role) VALUES
('Administrateur', 'admin@mns.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Formations
INSERT INTO formations (nom, description, duree, statut, places_total, places_prises) VALUES
('Développeur Web', 'Formation complète en développement web full-stack', '12 mois', 'Active', 25, 18),
('Data Science', 'Analyse de données, machine learning et IA', '10 mois', 'Active', 20, 15),
('Cybersécurité', 'Sécurité des systèmes et réseaux informatiques', '9 mois', 'Active', 15, 8),
('Systèmes et Réseaux', 'Administration systèmes et infrastructure réseau', '10 mois', 'Terminée', 20, 20);

-- Stagiaires
INSERT INTO stagiaires (nom, email, formation_id, statut, progression) VALUES
('Jean Dupont', 'jean.dupont@email.com', 1, 'Inscrit', 85),
('Marie Curie', 'marie.curie@email.com', 2, 'Inscrit', 92),
('Alan Turing', 'alan.turing@email.com', 3, 'En attente', 0),
('Ada Lovelace', 'ada.lovelace@email.com', 1, 'Inscrit', 45),
('Grace Hopper', 'grace.hopper@email.com', 4, 'Refusé', 12),
('Tim Berners-Lee', 'tim.b@email.com', 1, 'Inscrit', 78);

-- Dossiers
INSERT INTO dossiers (stagiaire_id, titre, type, statut) VALUES
(1, 'Dossier inscription', 'Administratif', 'Validé'),
(1, 'Convention de stage', 'Convention', 'En attente'),
(2, 'Dossier inscription', 'Administratif', 'Validé'),
(3, 'Dossier inscription', 'Administratif', 'Incomplet'),
(4, 'Dossier inscription', 'Administratif', 'Validé'),
(4, 'Attestation de formation', 'Pédagogique', 'En attente'),
(5, 'Dossier inscription', 'Administratif', 'Refusé');

-- Absences
INSERT INTO absences (stagiaire_id, type, date_absence, motif, statut) VALUES
(1, 'absence', '2026-03-10', 'Maladie', 'Justifiée'),
(1, 'retard', '2026-03-05', 'Transport', 'Justifiée'),
(2, 'absence', '2026-03-08', '', 'Non justifiée'),
(4, 'retard', '2026-03-11', 'Rendez-vous médical', 'Justifiée'),
(4, 'absence', '2026-03-09', '', 'Non justifiée'),
(6, 'retard', '2026-03-07', 'Panne de réveil', 'Non justifiée');
