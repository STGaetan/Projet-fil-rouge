import React, { useState } from "react";
import {
  Search,
  Plus,
  BookOpen,
  Users,
  Calendar,
  Award,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "../components/ui/Modal";

const initialFormations = [
  {
    id: "f1",
    name: "Développeur Web & Mobile",
    level: "Bac+2",
    duration: "12 mois",
    students: 24,
    status: "Active",
    color: "bg-blue-500",
  },
  {
    id: "f2",
    name: "Concepteur Développeur d'Applications",
    level: "Bac+3",
    duration: "12 mois",
    students: 18,
    status: "Active",
    color: "bg-indigo-500",
  },
  {
    id: "f3",
    name: "Expert en Ingénierie Logicielle",
    level: "Bac+5",
    duration: "24 mois",
    students: 15,
    status: "Active",
    color: "bg-violet-500",
  },
  {
    id: "f4",
    name: "Technicien Systèmes et Réseaux",
    level: "Bac+2",
    duration: "12 mois",
    students: 20,
    status: "En préparation",
    color: "bg-emerald-500",
  },
  {
    id: "f5",
    name: "Administrateur d'Infrastructures Sécurisées",
    level: "Bac+3",
    duration: "12 mois",
    students: 12,
    status: "Active",
    color: "bg-teal-500",
  },
  {
    id: "f6",
    name: "Data IA Analyst",
    level: "Bac+3",
    duration: "12 mois",
    students: 0,
    status: "Brouillon",
    color: "bg-orange-500",
  },
];

export function Formations() {
  const [formations, setFormations] = useState(initialFormations);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentFormation, setCurrentFormation] = useState<any>(null);

  const filteredFormations = formations.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFormation?.name?.trim()) {
      toast.error("Le nom de la formation est obligatoire.");
      return;
    }
    if (currentFormation.id) {
      setFormations(
        formations.map((f) =>
          f.id === currentFormation.id ? currentFormation : f,
        ),
      );
      toast.success("Formation modifiée avec succès.");
    } else {
      setFormations([
        ...formations,
        {
          ...currentFormation,
          id: Math.random().toString(),
          students: 0,
          color: "bg-[#FF6600]",
        },
      ]);
      toast.success("Nouvelle formation ajoutée.");
    }
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    setFormations(formations.filter((f) => f.id !== currentFormation.id));
    setIsDeleteOpen(false);
    toast.success("Formation supprimée.");
  };

  const openAddForm = () => {
    setCurrentFormation({
      name: "",
      level: "Bac+2",
      duration: "12 mois",
      status: "Active",
    });
    setIsFormOpen(true);
  };

  const openEditForm = (formation: any) => {
    setCurrentFormation({ ...formation });
    setIsFormOpen(true);
  };

  const openDeletePrompt = (formation: any) => {
    setCurrentFormation(formation);
    setIsDeleteOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative w-full sm:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Rechercher une formation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] transition-all"
          />
        </div>
        <button
          onClick={openAddForm}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all bg-[#FF6600] text-white hover:bg-[#e65c00] shadow-sm"
        >
          <Plus size={18} />
          Nouvelle formation
        </button>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFormations.map((formation) => (
          <div
            key={formation.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col group"
          >
            <div className="h-3 w-full bg-gray-100 relative">
              <div
                className={`absolute top-0 left-0 h-full w-1/3 ${formation.color || "bg-[#FF6600]"}`}
              ></div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-gray-50 rounded-lg text-[#1A1F3D]">
                  <BookOpen size={24} />
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    formation.status === "Active"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : formation.status === "Brouillon"
                        ? "bg-gray-100 text-gray-600 border border-gray-200"
                        : "bg-orange-50 text-orange-700 border border-orange-200"
                  }`}
                >
                  {formation.status}
                </span>
              </div>

              <h3 className="font-bold text-[#1A1F3D] text-lg mb-1 leading-tight group-hover:text-[#FF6600] transition-colors">
                {formation.name}
              </h3>
              <p className="text-sm text-gray-500 mb-6 flex-1">
                Certification RNCP
              </p>

              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Award size={16} className="text-gray-400" />
                  <span className="font-medium">{formation.level}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
                  <span>{formation.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 col-span-2 pt-3 border-t border-gray-100">
                  <Users size={16} className="text-[#FF6600]" />
                  <span className="font-semibold text-[#1A1F3D]">
                    {formation.students} stagiaires
                  </span>{" "}
                  inscrits
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() =>
                  toast.info("Aperçu de la formation : " + formation.name)
                }
                className="p-2 text-gray-500 hover:text-[#1A1F3D] hover:bg-white rounded-lg transition-colors shadow-sm border border-transparent hover:border-gray-200"
                title="Voir les détails"
              >
                <Eye size={18} />
              </button>
              <button
                onClick={() => openEditForm(formation)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-sm border border-transparent hover:border-blue-100"
                title="Modifier"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => openDeletePrompt(formation)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shadow-sm border border-transparent hover:border-red-200"
                title="Supprimer"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredFormations.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Aucune formation trouvée.</p>
        </div>
      )}

      {/* MODALS */}

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={
          currentFormation?.id ? "Modifier la formation" : "Nouvelle formation"
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nom de la formation
            </label>
            <input
              required
              type="text"
              value={currentFormation?.name || ""}
              onChange={(e) =>
                setCurrentFormation({
                  ...currentFormation,
                  name: e.target.value,
                })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all"
              placeholder="Ex: Développeur Web"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Niveau
              </label>
              <select
                value={currentFormation?.level || "Bac+2"}
                onChange={(e) =>
                  setCurrentFormation({
                    ...currentFormation,
                    level: e.target.value,
                  })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all"
              >
                <option>Bac+2</option>
                <option>Bac+3</option>
                <option>Bac+4</option>
                <option>Bac+5</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Durée
              </label>
              <select
                value={currentFormation?.duration || "12 mois"}
                onChange={(e) =>
                  setCurrentFormation({
                    ...currentFormation,
                    duration: e.target.value,
                  })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all"
              >
                <option>6 mois</option>
                <option>12 mois</option>
                <option>24 mois</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Statut
            </label>
            <select
              value={currentFormation?.status || "Active"}
              onChange={(e) =>
                setCurrentFormation({
                  ...currentFormation,
                  status: e.target.value,
                })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all"
            >
              <option>Active</option>
              <option>En préparation</option>
              <option>Brouillon</option>
            </select>
          </div>
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
              className="px-4 py-2 text-sm font-semibold text-white bg-[#FF6600] hover:bg-[#e65c00] rounded-lg shadow-sm transition-colors"
            >
              {currentFormation?.id
                ? "Enregistrer les modifications"
                : "Créer la formation"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Prompt Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirmer la suppression"
      >
        <div className="mb-6">
          <p className="text-gray-600 text-sm">
            Êtes-vous sûr de vouloir supprimer la formation{" "}
            <span className="font-bold text-[#1A1F3D]">
              {currentFormation?.name}
            </span>{" "}
            ?
          </p>
          <p className="text-red-500 text-xs mt-2 font-medium">
            Attention : Cette action est irréversible et supprimera tous les
            liens associés.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsDeleteOpen(false)}
            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
          >
            Oui, supprimer
          </button>
        </div>
      </Modal>
    </div>
  );
}
