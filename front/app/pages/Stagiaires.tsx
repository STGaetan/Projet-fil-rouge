import React, { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  Search,
  Filter,
  Mail,
  Edit,
  Trash2,
  Plus,
  Users,
  Phone,
  Calendar,
  Download,
  Loader2,
  GraduationCap,
  UserCheck,
  UserX,
} from "lucide-react";
import { StatusBadge } from "../components/ui/StatusBadge";
import { toast } from "sonner";
import { Modal } from "../components/ui/Modal";
import { fetchApi } from "../services/api";

// --- Types ---

type Stagiaire = {
  id_stagiaire: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  date_inscription: string;
  nom_formation: string | null;
  dossier_statut: string | null;
  dossier_id: number | null;
  id_formation: number | null;
};

type Formation = {
  id_formation: number;
  nom_formation: string;
};

type FormState = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  id_formation: string;
};

const emptyForm: FormState = { nom: "", prenom: "", email: "", telephone: "", id_formation: "" };

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("fr-FR");
}

function getInitials(nom: string, prenom: string): string {
  return `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();
}

// --- Component ---

export function Stagiaires() {
  const [stagiaires, setStagiaires] = useState<Stagiaire[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterFormation, setFilterFormation] = useState("");
  const [filterStatut, setFilterStatut] = useState("");

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingItem, setDeletingItem] = useState<Stagiaire | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  // --- Load data ---

  const loadData = useCallback(async () => {
    try {
      const [stagData, formData] = await Promise.all([
        fetchApi<Stagiaire[]>("/stagiaires"),
        fetchApi<Formation[]>("/formations"),
      ]);
      setStagiaires(stagData);
      setFormations(formData);
    } catch {
      toast.error("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Filter ---

  const filtered = stagiaires.filter((s) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = `${s.prenom} ${s.nom} ${s.email}`
      .toLowerCase()
      .includes(q);
    const matchFormation =
      !filterFormation || String(s.id_formation) === filterFormation;
    const matchStatut =
      !filterStatut ||
      (filterStatut === "sans_dossier"
        ? !s.dossier_statut
        : s.dossier_statut === filterStatut);
    return matchSearch && matchFormation && matchStatut;
  });

  // --- Stats ---

  const stats = {
    total: stagiaires.length,
    complets: stagiaires.filter((s) => s.dossier_statut === "Complet").length,
    enAttente: stagiaires.filter((s) => s.dossier_statut === "En attente")
      .length,
    sansDossier: stagiaires.filter((s) => !s.dossier_statut).length,
  };

  // --- Handlers ---

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (s: Stagiaire) => {
    setEditingId(s.id_stagiaire);
    setForm({
      nom: s.nom,
      prenom: s.prenom,
      email: s.email,
      telephone: s.telephone ?? "",
      id_formation: s.id_formation ? String(s.id_formation) : "",
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { id_formation, ...stagiaireData } = form;

      if (editingId) {
        await fetchApi(`/stagiaires/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(stagiaireData),
        });
        // Mettre à jour la formation si elle a changé
        const current = stagiaires.find((s) => s.id_stagiaire === editingId);
        if (id_formation) {
          if (current?.dossier_id) {
            await fetchApi(`/dossiers/${current.dossier_id}`, {
              method: "PUT",
              body: JSON.stringify({ id_formation: Number(id_formation) }),
            });
          } else {
            await fetchApi("/dossiers", {
              method: "POST",
              body: JSON.stringify({
                id_stagiaire: editingId,
                id_formation: Number(id_formation),
                statut: "En attente",
              }),
            });
          }
        }
        toast.success("Stagiaire mis à jour.");
      } else {
        const newStagiaire = await fetchApi<{ id_stagiaire: number }>(
          "/stagiaires",
          {
            method: "POST",
            body: JSON.stringify({ ...stagiaireData, mot_de_passe: "password" }),
          }
        );
        if (id_formation && newStagiaire?.id_stagiaire) {
          await fetchApi("/dossiers", {
            method: "POST",
            body: JSON.stringify({
              id_stagiaire: newStagiaire.id_stagiaire,
              id_formation: Number(id_formation),
              statut: "En attente",
            }),
          });
        }
        toast.success("Stagiaire ajouté.");
      }
      setIsFormOpen(false);
      loadData();
    } catch {
      toast.error("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setSaving(true);
    try {
      await fetchApi(`/stagiaires/${deletingItem.id_stagiaire}`, {
        method: "DELETE",
      });
      toast.success(`${deletingItem.prenom} ${deletingItem.nom} supprimé.`);
      setIsDeleteOpen(false);
      setDeletingItem(null);
      loadData();
    } catch {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const rows = filtered.map((s) => ({
      Nom: s.nom,
      Prénom: s.prenom,
      Email: s.email,
      Téléphone: s.telephone ?? "-",
      Formation: s.nom_formation ?? "-",
      "Statut dossier": s.dossier_statut ?? "Sans dossier",
      "Date inscription": formatDate(s.date_inscription),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 16 },
      { wch: 16 },
      { wch: 28 },
      { wch: 16 },
      { wch: 32 },
      { wch: 16 },
      { wch: 18 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stagiaires");
    XLSX.writeFile(
      wb,
      `stagiaires_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    toast.success("Export Excel téléchargé.");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterFormation("");
    setFilterStatut("");
  };

  // --- Loading ---

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[#FF6600]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total</p>
            <p className="text-2xl font-bold text-[#1A1F3D]">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg shrink-0">
            <UserCheck size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">
              Dossiers complets
            </p>
            <p className="text-2xl font-bold text-[#1A1F3D]">
              {stats.complets}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-[#FF6600] rounded-lg shrink-0">
            <GraduationCap size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">En attente</p>
            <p className="text-2xl font-bold text-[#1A1F3D]">
              {stats.enAttente}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-gray-100 text-gray-500 rounded-lg shrink-0">
            <UserX size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Sans dossier</p>
            <p className="text-2xl font-bold text-[#1A1F3D]">
              {stats.sansDossier}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative w-full sm:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
              showFilters
                ? "bg-gray-100 border-gray-300 text-[#1A1F3D]"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Filter size={16} /> Filtres
          </button>
          <button
            onClick={handleExport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border bg-white text-gray-700 border-gray-200 hover:bg-gray-50 transition-all"
          >
            <Download size={16} /> Exporter
          </button>
          <button
            onClick={openAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#1A1F3D] text-white hover:bg-[#2a315c] shadow-sm transition-all"
          >
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 animate-in slide-in-from-top-2 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Formation
            </label>
            <select
              value={filterFormation}
              onChange={(e) => setFilterFormation(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none"
            >
              <option value="">Toutes les formations</option>
              {formations.map((f) => (
                <option key={f.id_formation} value={f.id_formation}>
                  {f.nom_formation}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Statut dossier
            </label>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none"
            >
              <option value="">Tous les statuts</option>
              <option value="Complet">Complet</option>
              <option value="En attente">En attente</option>
              <option value="Incomplet">Incomplet</option>
              <option value="sans_dossier">Sans dossier</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-[#FF6600] transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-50/80">
              <tr className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <th className="px-6 py-4">Stagiaire</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Formation</th>
                <th className="px-6 py-4">Dossier</th>
                <th className="px-6 py-4">Inscription</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => (
                <tr
                  key={s.id_stagiaire}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#FF6600]/10 text-[#FF6600] flex items-center justify-center font-bold text-sm shrink-0">
                        {getInitials(s.nom, s.prenom)}
                      </div>
                      <div>
                        <p className="font-bold text-[#1A1F3D] text-sm group-hover:text-[#FF6600] transition-colors">
                          {s.prenom} {s.nom}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {s.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {s.telephone ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                        <Phone size={13} className="text-gray-400" />
                        {s.telephone}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        Non renseigné
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {s.nom_formation ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {s.nom_formation}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        Aucune formation
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={s.dossier_statut ?? "Sans dossier"} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                      <Calendar size={13} className="text-gray-400" />
                      {formatDate(s.date_inscription)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <a
                        href={`mailto:${s.email}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Envoyer un email"
                      >
                        <Mail size={16} />
                      </a>
                      <button
                        onClick={() => openEdit(s)}
                        className="p-2 text-gray-400 hover:text-[#1A1F3D] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingItem(s);
                          setIsDeleteOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Users size={36} className="text-gray-200" />
                      <p className="text-sm">
                        Aucun stagiaire ne correspond aux critères.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-sm text-gray-500">
          {filtered.length} stagiaire{filtered.length > 1 ? "s" : ""} affiché
          {filtered.length > 1 ? "s" : ""}
          {filtered.length < stagiaires.length && ` sur ${stagiaires.length}`}
        </div>
      </div>

      {/* Modal Ajout / Modification */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? "Modifier le stagiaire" : "Nouveau stagiaire"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Prénom
              </label>
              <input
                required
                type="text"
                value={form.prenom}
                onChange={(e) =>
                  setForm((f) => ({ ...f, prenom: e.target.value }))
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all"
                placeholder="Jean"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nom
              </label>
              <input
                required
                type="text"
                value={form.nom}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nom: e.target.value }))
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all"
                placeholder="Dupont"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all"
              placeholder="jean.dupont@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Téléphone{" "}
              <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input
              type="tel"
              value={form.telephone}
              onChange={(e) =>
                setForm((f) => ({ ...f, telephone: e.target.value }))
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all"
              placeholder="06 12 34 56 78"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Formation{" "}
              <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <select
              value={form.id_formation}
              onChange={(e) =>
                setForm((f) => ({ ...f, id_formation: e.target.value }))
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all"
            >
              <option value="">— Aucune formation —</option>
              {formations.map((f) => (
                <option key={f.id_formation} value={f.id_formation}>
                  {f.nom_formation}
                </option>
              ))}
            </select>
          </div>
          {!editingId && (
            <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              Le mot de passe par défaut sera{" "}
              <span className="font-mono font-semibold">password</span>. Le
              stagiaire devra le modifier à sa première connexion.
            </p>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#1A1F3D] hover:bg-[#2a315c] rounded-lg shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editingId ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Suppression */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingItem(null);
        }}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Supprimer le profil de{" "}
            <span className="font-bold text-[#1A1F3D]">
              {deletingItem?.prenom} {deletingItem?.nom}
            </span>{" "}
            ?
          </p>
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            Toutes les absences, retards et dossiers liés seront supprimés
            définitivement (cascade).
          </p>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => {
                setIsDeleteOpen(false);
                setDeletingItem(null);
              }}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Supprimer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
