/**
 * === SERVICE API CENTRALISÉ ===
 *
 * Ce fichier sert de point d'entrée unique pour tous les appels vers ton backend PHP.
 * L'URL de base pointe vers le conteneur Docker "php" exposé sur le port 8080.
 *
 * IMPORTANT : Côté backend (PHP), tu devras créer des endpoints (routes) qui
 * répondent en JSON pour chaque fonctionnalité. Par exemple :
 *   - GET  /api/stagiaires       → Retourne la liste des stagiaires
 *   - POST /api/stagiaires       → Crée un nouveau stagiaire
 *   - PUT  /api/stagiaires/:id   → Met à jour un stagiaire
 *   - DELETE /api/stagiaires/:id → Supprime un stagiaire
 *   - etc.
 */

const API_BASE_URL = "http://localhost:8080/api";

/**
 * Fonction utilitaire pour effectuer un appel API vers le backend PHP.
 * Elle gère automatiquement :
 *   - L'ajout du header Content-Type pour les requêtes JSON
 *   - L'envoi du token d'authentification s'il existe (stocké dans localStorage)
 *   - La conversion de la réponse en JSON
 *   - La gestion basique des erreurs HTTP
 *
 * @param endpoint - Le chemin de l'endpoint (ex: "/stagiaires", "/absences/5")
 * @param options  - Options fetch classiques (method, body, etc.)
 * @returns La réponse JSON parsée
 */
export async function fetchApi<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("mns_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Erreur API ${response.status}: ${errorBody}`);
  }

  return response.json();
}
