<?php

require_once __DIR__ . '/../config/database.php';

class DashboardController
{
    public function stats(array $params): void
    {
        $pdo = getDbConnection();

        $stagiaires = $pdo->query('SELECT COUNT(*) as total FROM stagiaire')->fetch()['total'];
        $formations = $pdo->query('SELECT COUNT(*) as total FROM formation')->fetch()['total'];
        $dossiers = $pdo->query('SELECT COUNT(*) as total FROM dossier')->fetch()['total'];
        $absences = $pdo->query('SELECT COUNT(*) as total FROM absence')->fetch()['total'];
        $retards = $pdo->query('SELECT COUNT(*) as total FROM retard')->fetch()['total'];

        $dossiersEnAttente = $pdo->query("SELECT COUNT(*) as total FROM dossier WHERE statut = 'En attente'")->fetch()['total'];
        $dossiersIncomplets = $pdo->query("SELECT COUNT(*) as total FROM dossier WHERE statut = 'Incomplet'")->fetch()['total'];
        $absencesNonJust = $pdo->query("SELECT COUNT(*) as total FROM absence WHERE justificatif_obligatoire = 1 AND justif_absence IS NULL")->fetch()['total'];

        jsonResponse([
            'stagiaires'          => (int) $stagiaires,
            'formations'          => (int) $formations,
            'dossiers'            => (int) $dossiers,
            'dossiers_en_attente' => (int) $dossiersEnAttente,
            'dossiers_incomplets' => (int) $dossiersIncomplets,
            'absences'            => (int) $absences,
            'retards'             => (int) $retards,
            'absences_non_justifiees' => (int) $absencesNonJust,
        ]);
    }
}
