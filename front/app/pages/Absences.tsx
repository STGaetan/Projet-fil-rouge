import React, { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  Search,
  Download,
  Plus,
  Clock,
  XCircle,
  Users,
  Trash2,
  Edit3,
  Filter,
} from "lucide-react";
import { StatusBadge } from "../components/ui/StatusBadge";
import { toast } from "sonner";
import { Modal } from "../components/ui/Modal";
import { fetchApi } from "../services/api";

type Absence = {
  id_absence: number;
  id_stagiaire: number;
  id_formation: number;
  date_absence: string;
  justif_absence: string | null;
  justificatif_obligatoire: number;
  stagiaire_nom: string;
  stagiaire_prenom: string;
  nom_formation: string;
};

type Retard = {
  id_retard: number;
  id_stagiaire: number;
  id_formation: number;
  date_retard: string;
  temps_retard: string;
  stagiaire_nom: string;
  stagiaire_prenom: string;
  nom_formation: string;
};

type Stagiaire = {
  id_stagiaire: number;
  nom: string;
  prenom: string;
};

type Formation = {
  id_formation: number;
  nom_formation: string;
};

type UnifiedRow = {
  id: number;
  type: "Absence" | "Retard";
  stagiaire: string;
  formation: string;
  date: string;
  detail: string;
  statut: string;
  raw: Absence | Retard;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR");
}

export function Absences() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [retards, setRetards] = useState<Retard[]>([]);
  const [stagiaires, setStagiaires] = useState<Stagiaire[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Tous");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UnifiedRow | null>(null);
  const [deletingItem, setDeletingItem] = useState<UnifiedRow | null>(null);
  const [saving, setSaving] = useState(false);

  const [formType, setFormType] = useState<"Absence" | "Retard">("Absence");
  const [formStagiaire, setFormStagiaire] = useState("");
  const [formFormation, setFormFormation] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formMotif, setFormMotif] = useState("");
  const [formTemps, setFormTemps] = useState("");
  const [formStagiaires, setFormStagiaires] = useState<Stagiaire[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [abs, ret, stag, form] = await Promise.all([
        fetchApi<Absence[]>("/absences"),
        fetchApi<Retard[]>("/retards"),
        fetchApi<Stagiaire[]>("/stagiaires"),
        fetchApi<Formation[]>("/formations"),
      ]);
      setAbsences(abs);
      setRetards(ret);
      setStagiaires(stag);
      setFormations(form);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur de chargement des données.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Quand la formation change dans le formulaire, charge les stagiaires de cette promo
  useEffect(() => {
    if (!formFormation) {
      setFormStagiaires([]);
      setFormStagiaire("");
      return;
    }
    fetchApi<Stagiaire[]>(`/formations/${formFormation}/stagiaires`)
      .then((data) => {
        setFormStagiaires(data);
        // Réinitialise le stagiaire sélectionné s'il n'est plus dans la liste
        const ids = data.map((s) => String(s.id_stagiaire));
        if (formStagiaire && !ids.includes(formStagiaire)) {
          setFormStagiaire("");
        }
      })
      .catch((err) => {
        setFormStagiaires([]);
        toast.error(err instanceof Error ? err.message : "Impossible de charger les stagiaires de cette formation.");
      });
  }, [formFormation]);

  const unifiedData: UnifiedRow[] = [
    ...absences.map(
      (a): UnifiedRow => ({
        id: a.id_absence,
        type: "Absence",
        stagiaire: `${a.stagiaire_prenom} ${a.stagiaire_nom}`,
        formation: a.nom_formation,
        date: a.date_absence,
        detail: a.justif_absence || "-",
        statut: a.justif_absence
          ? "Justifiée"
          : a.justificatif_obligatoire
            ? "Non justifiée"
            : "Justifiée",
        raw: a,
      }),
    ),
    ...retards.map(
      (r): UnifiedRow => ({
        id: r.id_retard,
        type: "Retard",
        stagiaire: `${r.stagiaire_prenom} ${r.stagiaire_nom}`,
        formation: r.nom_formation,
        date: r.date_retard,
        detail: r.temps_retard,
        statut: "Signalé",
        raw: r,
      }),
    ),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredData = unifiedData.filter((item) => {
    const matchesSearch = item.stagiaire
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "Tous" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    absences: absences.length,
    retards: retards.length,
    nonJustifiees: absences.filter(
      (a) => !a.justif_absence && a.justificatif_obligatoire,
    ).length,
  };

  const openAddForm = () => {
    setEditingItem(null);
    setFormType("Absence");
    setFormStagiaire("");
    setFormFormation("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormMotif("");
    setFormTemps("");
    setIsFormOpen(true);
  };

  const openEditForm = (item: UnifiedRow) => {
    setEditingItem(item);
    setFormType(item.type);
    if (item.type === "Absence") {
      const a = item.raw as Absence;
      setFormStagiaire(String(a.id_stagiaire));
      setFormFormation(String(a.id_formation));
      setFormDate(a.date_absence);
      setFormMotif(a.justif_absence || "");
      setFormTemps("");
    } else {
      const r = item.raw as Retard;
      setFormStagiaire(String(r.id_stagiaire));
      setFormFormation(String(r.id_formation));
      setFormDate(r.date_retard);
      setFormMotif("");
      setFormTemps(r.temps_retard);
    }
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFormation)              { toast.error("Veuillez sélectionner une formation."); return; }
    if (!formStagiaire)              { toast.error("Veuillez sélectionner un stagiaire."); return; }
    if (!formDate)                   { toast.error("La date est obligatoire."); return; }
    if (formType === "Retard" && !formTemps.trim()) { toast.error("La durée du retard est obligatoire."); return; }
    setSaving(true);

    try {
      if (formType === "Absence") {
        const payload = {
          id_stagiaire: Number(formStagiaire),
          id_formation: Number(formFormation),
          date_absence: formDate,
          justif_absence: formMotif || null,
        };

        if (editingItem) {
          await fetchApi(`/absences/${editingItem.id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          });
          toast.success("Absence modifiée.");
        } else {
          await fetchApi("/absences", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          toast.success("Absence enregistrée.");
        }
      } else {
        const payload = {
          id_stagiaire: Number(formStagiaire),
          id_formation: Number(formFormation),
          date_retard: formDate,
          temps_retard: formTemps,
        };

        if (editingItem) {
          await fetchApi(`/retards/${editingItem.id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          });
          toast.success("Retard modifié.");
        } else {
          await fetchApi("/retards", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          toast.success("Retard enregistré.");
        }
      }

      setIsFormOpen(false);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setSaving(true);

    try {
      const endpoint =
        deletingItem.type === "Absence"
          ? `/absences/${deletingItem.id}`
          : `/retards/${deletingItem.id}`;

      await fetchApi(endpoint, { method: "DELETE" });
      toast.success(`${deletingItem.type} supprimé(e).`);
      setIsDeleteOpen(false);
      setDeletingItem(null);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression.");
    } finally {
      setSaving(false);
    }
  };

  const handleJustify = async (item: UnifiedRow) => {
    if (item.type !== "Absence") return;
    try {
      await fetchApi(`/absences/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          justif_absence: "Justifié par l'administrateur",
        }),
      });
      toast.success(`Absence de ${item.stagiaire} marquée comme justifiée.`);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la justification.");
    }
  };

  const handleExport = () => {
    const rows = filteredData.map((r) => ({
      Type: r.type,
      Stagiaire: r.stagiaire,
      Formation: r.formation,
      Date: formatDate(r.date),
      Détail: r.detail,
      Statut: r.statut,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 10 }, { wch: 24 }, { wch: 32 }, { wch: 14 }, { wch: 30 }, { wch: 16 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Absences & Retards");
    XLSX.writeFile(wb, `absences_retards_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Export Excel téléchargé.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-4 border-[#FF6600]/30 border-t-[#FF6600] rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white p-3 sm:p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 sm:gap-4">
          <div className="p-2 sm:p-3 bg-red-50 text-red-500 rounded-lg shrink-0">
            <XCircle size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Absences</p>
            <p className="text-xl sm:text-2xl font-bold text-[#1A1F3D]">
              {stats.absences}
            </p>
          </div>
        </div>
        <div className="bg-white p-3 sm:p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 sm:gap-4">
          <div className="p-2 sm:p-3 bg-orange-50 text-[#FF6600] rounded-lg shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Retards</p>
            <p className="text-xl sm:text-2xl font-bold text-[#1A1F3D]">{stats.retards}</p>
          </div>
        </div>
        <div className="bg-white p-3 sm:p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 sm:gap-4">
          <div className="p-2 sm:p-3 bg-blue-50 text-blue-500 rounded-lg shrink-0">
            <Filter size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium leading-tight">Non justif.</p>
            <p className="text-xl sm:text-2xl font-bold text-[#1A1F3D]">
              {stats.nonJustifiees}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher un stagiaire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] transition-all"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-40 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] transition-all cursor-pointer"
          >
            <option value="Tous">Tous les types</option>
            <option value="Absence">Absences</option>
            <option value="Retard">Retards</option>
          </select>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          >
            <Download size={16} /> Exporter
          </button>
          <button
            onClick={openAddForm}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-[#FF6600] text-white hover:bg-[#e65c00] shadow-sm"
          >
            <Plus size={16} /> Saisir
          </button>
        </div>
      </div>

      {/* ===== MOBILE : Vue cards ===== */}
      <div className="sm:hidden space-y-3">
        {filteredData.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-14 text-center">
            <Users size={32} className="mx-auto text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">Aucun événement trouvé.</p>
          </div>
        ) : (
          filteredData.map((item) => (
            <div key={`${item.type}-${item.id}`} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              {/* Ligne du haut : type + statut + actions */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      item.type === "Absence"
                        ? "bg-red-50 text-red-600"
                        : "bg-orange-50 text-[#FF6600]"
                    }`}
                  >
                    {item.type}
                  </span>
                  <StatusBadge status={item.statut} />
                </div>
                <div className="flex gap-1 shrink-0">
                  {item.type === "Absence" && item.statut === "Non justifiée" && (
                    <button
                      onClick={() => handleJustify(item)}
                      className="text-xs font-semibold px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-md transition-colors"
                    >
                      Justifier
                    </button>
                  )}
                  <button
                    onClick={() => openEditForm(item)}
                    className="p-1.5 text-gray-400 hover:text-[#FF6600] hover:bg-orange-50 rounded-md transition-colors"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => { setDeletingItem(item); setIsDeleteOpen(true); }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Infos stagiaire */}
              <p className="font-bold text-[#1A1F3D] text-sm">{item.stagiaire}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.formation}</p>

              {/* Date + détail */}
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span className="font-medium text-gray-700">{formatDate(item.date)}</span>
                {item.detail !== "-" && (
                  <span className="truncate max-w-[180px] ml-2">{item.detail}</span>
                )}
              </div>
            </div>
          ))
        )}

        {filteredData.length > 0 && (
          <p className="text-xs text-gray-400 text-center py-1">
            {filteredData.length} résultat{filteredData.length > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* ===== DESKTOP : Table ===== */}
      <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-50/80">
              <tr className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Stagiaire & Formation</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Détail</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((item) => (
                <tr
                  key={`${item.type}-${item.id}`}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                        item.type === "Absence"
                          ? "bg-red-50 text-red-600"
                          : "bg-orange-50 text-[#FF6600]"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#1A1F3D] text-sm">{item.stagiaire}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.formation}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[#1A1F3D]">{formatDate(item.date)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 truncate max-w-[200px]">{item.detail}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.statut} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {item.type === "Absence" && item.statut === "Non justifiée" && (
                        <button
                          onClick={() => handleJustify(item)}
                          className="text-xs font-semibold px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-md transition-colors"
                        >
                          Justifier
                        </button>
                      )}
                      <button
                        onClick={() => openEditForm(item)}
                        className="p-1.5 text-gray-400 hover:text-[#FF6600] hover:bg-orange-50 rounded-md transition-colors"
                        title="Modifier"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => { setDeletingItem(item); setIsDeleteOpen(true); }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Users size={32} className="text-gray-300" />
                      <p>Aucun événement trouvé.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-sm text-gray-500">
          <span>{filteredData.length} résultat{filteredData.length > 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Modal Ajout/Modification */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={
          editingItem
            ? `Modifier ${editingItem.type.toLowerCase()}`
            : "Saisir un événement"
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Type
              </label>
              <select
                value={formType}
                onChange={(e) =>
                  setFormType(e.target.value as "Absence" | "Retard")
                }
                disabled={!!editingItem}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all disabled:opacity-60"
              >
                <option value="Absence">Absence</option>
                <option value="Retard">Retard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Date
              </label>
              <input
                required
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Formation
            </label>
            <select
              required
              value={formFormation}
              onChange={(e) => setFormFormation(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all"
            >
              <option value="">-- Sélectionner une formation --</option>
              {formations.map((f) => (
                <option key={f.id_formation} value={f.id_formation}>
                  {f.nom_formation}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Stagiaire
            </label>
            {!formFormation ? (
              <p className="text-xs text-gray-400 italic py-2">
                Sélectionnez d'abord une formation.
              </p>
            ) : formStagiaires.length === 0 ? (
              <p className="text-xs text-orange-500 italic py-2">
                Aucun stagiaire inscrit dans cette formation.
              </p>
            ) : (
              <select
                required
                value={formStagiaire}
                onChange={(e) => setFormStagiaire(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all"
              >
                <option value="">-- Sélectionner un stagiaire --</option>
                {formStagiaires.map((s) => (
                  <option key={s.id_stagiaire} value={s.id_stagiaire}>
                    {s.prenom} {s.nom}
                  </option>
                ))}
              </select>
            )}
          </div>

          {formType === "Absence" ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Motif / Justification (optionnel)
              </label>
              <textarea
                rows={2}
                value={formMotif}
                onChange={(e) => setFormMotif(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all resize-none"
                placeholder="Ex: Maladie, RDV médical..."
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Durée du retard
              </label>
              <input
                required
                type="text"
                value={formTemps}
                onChange={(e) => setFormTemps(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all"
                placeholder="Ex: 15 min, 30 min, 1h"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
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
              className="px-4 py-2 text-sm font-semibold text-white bg-[#FF6600] hover:bg-[#e65c00] rounded-lg shadow-sm transition-colors disabled:opacity-70"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
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
            Supprimer{" "}
            {deletingItem?.type === "Absence" ? "l'absence" : "le retard"} de{" "}
            <span className="font-bold text-[#1A1F3D]">
              {deletingItem?.stagiaire}
            </span>{" "}
            du {deletingItem ? formatDate(deletingItem.date) : ""} ?
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
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
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors disabled:opacity-70"
            >
              {saving ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
