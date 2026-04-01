const API_BASE_URL = "http://localhost:8080/api";

/** Traduit un code HTTP en message lisible par défaut. */
function httpStatusMessage(status: number): string {
  switch (status) {
    case 400: return "Requête invalide.";
    case 403: return "Accès refusé.";
    case 404: return "Ressource introuvable.";
    case 409: return "Cet enregistrement existe déjà (ex: email déjà utilisé).";
    case 422: return "Données invalides.";
    case 500: return "Erreur serveur. Veuillez réessayer.";
    default:  return `Erreur ${status}.`;
  }
}

/**
 * Effectue un appel API sécurisé vers le backend.
 * Extrait automatiquement le message d'erreur retourné par le serveur.
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

  // Token expiré → déconnexion automatique (sauf sur la route de login)
  if (response.status === 401 && !endpoint.startsWith("/auth/")) {
    localStorage.removeItem("mns_token");
    localStorage.removeItem("mns_user");
    localStorage.removeItem("mns_auth");
    window.location.href = "/login";
    throw new Error("Session expirée. Veuillez vous reconnecter.");
  }

  if (!response.ok) {
    // On tente d'extraire le message d'erreur précis retourné par le backend
    let message = httpStatusMessage(response.status);
    try {
      const errorData = await response.json();
      if (Array.isArray(errorData.details) && errorData.details.length > 0) {
        // Erreurs de validation : affiche le premier détail
        message = errorData.details[0];
      } else if (typeof errorData.error === "string") {
        message = errorData.error;
      }
    } catch {
      // Le body n'était pas du JSON valide → on garde le message par défaut
    }
    throw new Error(message);
  }

  return response.json();
}
