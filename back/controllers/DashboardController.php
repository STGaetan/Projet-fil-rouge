<?php

require_once __DIR__ . '/../config/database.php';

class DashboardController
{
    public function stats(array $params): void
    {
        $pdo = getDbConnection();

        $stagiaires = $pdo->query('SELECT COUNT(*) as total FROM stagiaires')->fetch()['total'];
        $formations = $pdo->query('SELECT COUNT(*) as total FROM formations')->fetch()['total'];
        $dossiers = $pdo->query('SELECT COUNT(*) as total FROM dossiers')->fetch()['total'];
        $absences = $pdo->query('SELECT COUNT(*) as total FROM absences')->fetch()['total'];

        $formationsActives = $pdo->query("SELECT COUNT(*) as total FROM formations WHERE statut = 'Active'")->fetch()['total'];
        $dossiersEnAttente = $pdo->query("SELECT COUNT(*) as total FROM dossiers WHERE statut = 'En attente'")->fetch()['total'];
        $absencesNonJust = $pdo->query("SELECT COUNT(*) as total FROM absences WHERE statut = 'Non justifiée'")->fetch()['total'];

        jsonResponse([
            'stagiaires' => (int) $stagiaires,
            'formations' => (int) $formations,
            'formations_actives' => (int) $formationsActives,
            'dossiers' => (int) $dossiers,
            'dossiers_en_attente' => (int) $dossiersEnAttente,
            'absences' => (int) $absences,
            'absences_non_justifiees' => (int) $absencesNonJust,
        ]);
    }
}
