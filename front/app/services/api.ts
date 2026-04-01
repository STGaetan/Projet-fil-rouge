/**
 * === SERVICE API CENTRALISÉ ===
 *
 * Gère les appels vers le backend PHP avec :
 *   - Token JWT dans chaque requête (header Authorization)
 *   - Déconnexion automatique si token expiré (401)
 *   - Validation des réponses
 */

const API_BASE_URL = "http://localhost:8080/api";

/**
 * Effectue un appel API sécurisé vers le backend.
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

  // Token expiré ou invalide → déconnexion automatique
  if (response.status === 401) {
    localStorage.removeItem("mns_token");
    localStorage.removeItem("mns_user");
    localStorage.removeItem("mns_auth");
    window.location.href = "/login";
    throw new Error("Session expirée. Veuillez vous reconnecter.");
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Erreur API ${response.status}: ${errorBody}`);
  }

  return response.json();
}
