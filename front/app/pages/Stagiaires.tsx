import React, { useState } from 'react';
import { Search, Filter, Mail, Edit, Trash2, Plus, Users } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { toast } from 'sonner';
import { Modal } from '../components/ui/Modal';

const initialStudents = [
  { id: '1', name: 'Jean Dupont', email: 'jean.dupont@email.com', formation: 'Développeur Web', status: 'Inscrit', progress: 85 },
  { id: '2', name: 'Marie Curie', email: 'marie.curie@email.com', formation: 'Data Science', status: 'Inscrit', progress: 92 },
  { id: '3', name: 'Alan Turing', email: 'alan.turing@email.com', formation: 'Cybersécurité', status: 'En attente', progress: 0 },
  { id: '4', name: 'Ada Lovelace', email: 'ada.lovelace@email.com', formation: 'Développeur Web', status: 'Inscrit', progress: 45 },
  { id: '5', name: 'Grace Hopper', email: 'grace.hopper@email.com', formation: 'Systèmes et Réseaux', status: 'Refusé', progress: 12 },
  { id: '6', name: 'Tim Berners-Lee', email: 'tim.b@email.com', formation: 'Développeur Web', status: 'Inscrit', progress: 78 },
];

export function Stagiaires() {
  const [students, setStudents] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Advanced Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [formationFilter, setFormationFilter] = useState('Toutes');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<any>(null);

  // Extract unique formations for the filter dropdown
  const uniqueFormations = Array.from(new Set(students.map(s => s.formation)));

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Tous' || s.status === statusFilter;
    const matchesFormation = formationFilter === 'Toutes' || s.formation === formationFilter;
    return matchesSearch && matchesStatus && matchesFormation;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStudent.id) {
      setStudents(students.map(s => s.id === currentStudent.id ? currentStudent : s));
      toast.success("Informations du stagiaire mises à jour.");
    } else {
      setStudents([{ ...currentStudent, id: Math.random().toString(), progress: 0 }, ...students]);
      toast.success("Nouveau stagiaire ajouté avec succès.");
    }
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    setStudents(students.filter(s => s.id !== currentStudent.id));
    setIsDeleteOpen(false);
    toast.success("Stagiaire supprimé de la base.");
  };

  const openAddForm = () => {
    setCurrentStudent({ name: '', email: '', formation: 'Développeur Web', status: 'En attente' });
    setIsFormOpen(true);
  };

  const openEditForm = (student: any) => {
    setCurrentStudent({ ...student });
    setIsFormOpen(true);
  };

  const openDeletePrompt = (student: any) => {
    setCurrentStudent(student);
    setIsDeleteOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border flex ${
              showFilters ? 'bg-gray-100 border-gray-300 text-[#1A1F3D]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
            Filtres
          </button>
          <button 
            onClick={openAddForm}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all bg-[#1A1F3D] text-white hover:bg-[#2a315c] shadow-sm"
          >
            <Plus size={18} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 animate-in slide-in-from-top-2 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</label>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="Inscrit">Inscrit / Validé</option>
              <option value="En attente">En attente</option>
              <option value="Refusé">Refusé</option>
            </select>
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Formation</label>
            <select 
              value={formationFilter} 
              onChange={e => setFormationFilter(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all"
            >
              <option value="Toutes">Toutes les formations</option>
              {uniqueFormations.map(form => (
                <option key={form} value={form}>{form}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => { setStatusFilter('Tous'); setFormationFilter('Toutes'); setSearchTerm(''); }}
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
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50/80">
              <tr className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <th className="px-6 py-4">Nom & Contact</th>
                <th className="px-6 py-4">Formation</th>
                <th className="px-6 py-4">Progression</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#FF6600]/10 text-[#FF6600] flex items-center justify-center font-bold text-sm shrink-0">
                        {student.name.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-[#1A1F3D] text-sm group-hover:text-[#FF6600] transition-colors">{student.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {student.formation}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full max-w-[120px] flex items-center gap-3">
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${student.progress > 80 ? 'bg-green-500' : student.progress > 40 ? 'bg-orange-400' : 'bg-red-400'}`}
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-600 w-8">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={student.status === 'Inscrit' ? 'Validé' : student.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => toast.info(`Ouverture de la messagerie pour ${student.name}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-sm border border-transparent hover:border-blue-100" title="Contacter"
                      >
                        <Mail size={16} />
                      </button>
                      <button 
                        onClick={() => openEditForm(student)}
                        className="p-2 text-gray-400 hover:text-[#1A1F3D] hover:bg-gray-50 rounded-lg transition-colors shadow-sm border border-transparent hover:border-gray-200" title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => openDeletePrompt(student)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm border border-transparent hover:border-red-100" title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Users size={32} className="text-gray-300" />
                      <p>Aucun stagiaire ne correspond aux critères actuels.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-sm text-gray-500">
          <span>Affichage de {filteredStudents.length} sur {students.length} stagiaires</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-white disabled:opacity-50" disabled>Précédent</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-white disabled:opacity-50" disabled>Suivant</button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title={currentStudent?.id ? "Modifier le stagiaire" : "Nouveau stagiaire"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom complet</label>
            <input 
              required 
              type="text" 
              value={currentStudent?.name || ''} 
              onChange={e => setCurrentStudent({...currentStudent, name: e.target.value})} 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all" 
              placeholder="Ex: Jean Dupont"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse Email</label>
            <input 
              required 
              type="email" 
              value={currentStudent?.email || ''} 
              onChange={e => setCurrentStudent({...currentStudent, email: e.target.value})} 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all" 
              placeholder="jean.dupont@email.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Formation</label>
              <select 
                value={currentStudent?.formation || 'Développeur Web'} 
                onChange={e => setCurrentStudent({...currentStudent, formation: e.target.value})} 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all"
              >
                <option>Développeur Web</option>
                <option>Data Science</option>
                <option>Cybersécurité</option>
                <option>Systèmes et Réseaux</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Statut</label>
              <select 
                value={currentStudent?.status || 'En attente'} 
                onChange={e => setCurrentStudent({...currentStudent, status: e.target.value})} 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all"
              >
                <option>Inscrit</option>
                <option>En attente</option>
                <option>Refusé</option>
              </select>
            </div>
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
              className="px-4 py-2 text-sm font-semibold text-white bg-[#1A1F3D] hover:bg-[#2a315c] rounded-lg shadow-sm transition-colors"
            >
              {currentStudent?.id ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Prompt Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirmer la suppression">
        <div className="mb-6">
          <p className="text-gray-600 text-sm">
            Êtes-vous sûr de vouloir supprimer le profil de <span className="font-bold text-[#1A1F3D]">{currentStudent?.name}</span> ?
          </p>
          <p className="text-red-500 text-xs mt-2 font-medium">
            Attention : Tous ses documents, absences et notes seront supprimés définitivement.
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
