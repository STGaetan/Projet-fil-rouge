<?php

/**
 * Input Validation & Sanitization Helper
 *
 * Fournit des fonctions de validation et nettoyage des entrées utilisateur.
 */

/**
 * Nettoie une chaîne : supprime les balises HTML et les caractères dangereux.
 */
function sanitizeString(?string $value): string
{
    if ($value === null) {
        return '';
    }
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

/**
 * Valide un email.
 */
function validateEmail(string $email): bool
{
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

/**
 * Valide un numéro de téléphone (format français souple).
 */
function validatePhone(string $phone): bool
{
    // Accepte les formats : 0612345678, 06 12 34 56 78, +33612345678, etc.
    return (bool) preg_match('/^(\+?\d{1,4}[\s.-]?)?(\(?\d{1,4}\)?[\s.-]?)?[\d\s.-]{6,15}$/', $phone);
}

/**
 * Valide un entier positif (IDs).
 */
function validateId($value): bool
{
    return is_numeric($value) && (int) $value > 0;
}

/**
 * Valide une date au format d-m-Y.
 */
function validateDate(string $date): bool
{
    $d = DateTime::createFromFormat('d-m-Y', $date);
    return $d && $d->format('d-m-Y') === $date;
}

/**
 * Valide et nettoie le body d'une requête selon un schéma.
 *
 * @param array $body  Le body JSON décodé
 * @param array $rules Tableau associatif [champ => [type, required]]
 *    Types: 'string', 'email', 'phone', 'int', 'date', 'text'
 * @return array       Le body nettoyé avec uniquement les champs autorisés
 */
function validateBody(array $body, array $rules): array
{
    $errors = [];
    $clean = [];

    foreach ($rules as $field => $rule) {
        $type = $rule['type'] ?? 'string';
        $required = $rule['required'] ?? false;
        $value = $body[$field] ?? null;

        // Champ requis manquant
        if ($required && ($value === null || $value === '')) {
            $errors[] = "Le champ '$field' est requis.";
            continue;
        }

        // Champ optionnel absent
        if ($value === null || $value === '') {
            $clean[$field] = $rule['default'] ?? null;
            continue;
        }

        switch ($type) {
            case 'email':
                $value = sanitizeString($value);
                if (!validateEmail($value)) {
                    $errors[] = "Le champ '$field' doit être un email valide.";
                }
                $clean[$field] = $value;
                break;

            case 'phone':
                $value = sanitizeString($value);
                if (!validatePhone($value)) {
                    $errors[] = "Le champ '$field' doit être un numéro de téléphone valide.";
                }
                $clean[$field] = $value;
                break;

            case 'int':
                if (!is_numeric($value)) {
                    $errors[] = "Le champ '$field' doit être un nombre entier.";
                } else {
                    $clean[$field] = (int) $value;
                }
                break;

            case 'date':
                $value = sanitizeString($value);
                if (!validateDate($value)) {
                    $errors[] = "Le champ '$field' doit être une date valide (JJ-MM-AAAA).";
                }
                $clean[$field] = $value;
                break;

            case 'text':
                // Texte long : on supprime les balises HTML mais on garde les sauts de ligne
                $clean[$field] = strip_tags(trim($value));
                break;

            case 'string':
            default:
                $clean[$field] = sanitizeString($value);
                break;
        }
    }

    if (!empty($errors)) {
        jsonResponse(['error' => 'Validation échouée', 'details' => $errors], 422);
    }

    return $clean;
}
