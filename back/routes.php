<?php

return [
    // Auth
    ['POST', '/api/auth/login', 'AuthController@login'],

    // Formations
    ['GET',    '/api/formations',      'FormationController@index'],
    ['GET',    '/api/formations/{id}', 'FormationController@show'],
    ['POST',   '/api/formations',      'FormationController@store'],
    ['PUT',    '/api/formations/{id}', 'FormationController@update'],
    ['DELETE', '/api/formations/{id}', 'FormationController@destroy'],

    // Stagiaires
    ['GET',    '/api/stagiaires',      'StagiaireController@index'],
    ['GET',    '/api/stagiaires/{id}', 'StagiaireController@show'],
    ['POST',   '/api/stagiaires',      'StagiaireController@store'],
    ['PUT',    '/api/stagiaires/{id}', 'StagiaireController@update'],
    ['DELETE', '/api/stagiaires/{id}', 'StagiaireController@destroy'],

    // Dossiers
    ['GET',    '/api/dossiers',      'DossierController@index'],
    ['GET',    '/api/dossiers/{id}', 'DossierController@show'],
    ['POST',   '/api/dossiers',      'DossierController@store'],
    ['PUT',    '/api/dossiers/{id}', 'DossierController@update'],
    ['DELETE', '/api/dossiers/{id}', 'DossierController@destroy'],

    // Absences
    ['GET',    '/api/absences',      'AbsenceController@index'],
    ['GET',    '/api/absences/{id}', 'AbsenceController@show'],
    ['POST',   '/api/absences',      'AbsenceController@store'],
    ['PUT',    '/api/absences/{id}', 'AbsenceController@update'],
    ['DELETE', '/api/absences/{id}', 'AbsenceController@destroy'],

    // Dashboard
    ['GET', '/api/dashboard/stats', 'DashboardController@stats'],
];
