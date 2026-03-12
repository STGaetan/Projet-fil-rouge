import React, { useState } from 'react';
import { FileText, Search, Plus, CheckCircle2, Clock, FolderOpen, Edit, Trash2 } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { toast } from 'sonner';
import { Modal } from '../components/ui/Modal';

const initialFolders = [
  { id: '1', title: 'Dossier Inscription 2026', student: 'Marie Curie', type: 'Inscription', date: '12 Mar 2026', status: 'Complet' },
  { id: '2', title: 'Convention de stage', student: 'Alan Turing', type: 'Entreprise', date: '11 Mar 2026', status: 'En attente' },
  { id: '3', title: 'Certificat Médical', student: 'Jean Dupont', type: 'Justificatif', date: '10 Mar 2026', status: 'Refusé' },
  { id: '4', title: 'Dossier Financement', student: 'Ada Lovelace', type: 'Financement', date: '09 Mar 2026', status: 'Incomplet' },
  { id: '5', title: 'Attestation Pôle Emploi', student: 'Grace Hopper', type: 'Financement', date: '08 Mar 2026', status: 'Complet' },
  { id: '6', title: 'Contrat Alternance', student: 'Tim Berners-Lee', type: 'Entreprise', date: '05 Mar 2026', status: 'En attente' },
];

export function Dossiers() {
  const [folders, setFolders] = useState(initialFolders);
  const [filter, setFilter] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Complet': return 'border-green-200 bg-green-50/50';
      case 'En attente': return 'border-orange-200 bg-orange-50/50';
      case 'Incomplet': 
      case 'Refusé': return 'border-red-200 bg-red-50/50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const filteredFolders = folders.filter(f => {
    const matchesFilter = filter === 'Tous' || f.status === filter;
    const matchesSearch = f.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.student.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAction = (id: string, action: string) => {
    toast.success(`Action "${action}" exécutée avec succès.`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentFolder.id) {
      setFolders(folders.map(f => f.id === currentFolder.id ? { ...currentFolder, date: 'Aujourd\'hui' } : f));
      toast.success("Dossier modifié avec succès.");
    } else {
      setFolders([{ ...currentFolder, id: Math.random().toString(), date: 'Aujourd\'hui' }, ...folders]);
      toast.success("Nouveau dossier créé.");
    }
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    setFolders(folders.filter(f => f.id !== currentFolder.id));
    setIsDeleteOpen(false);
    toast.success("Dossier supprimé.");
  };

  const openAddForm = () => {
    setCurrentFolder({ title: '', student: '', type: 'Inscription', status: 'En attente' });
    setIsFormOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        
        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4">
          {/* Status Filters */}
          <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm overflow-x-auto w-full sm:w-auto shrink-0">
            {['Tous', 'Complet', 'En attente', 'Incomplet', 'Refusé'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === status 
                    ? 'bg-gray-100 text-[#1A1F3D] shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher (titre, nom)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] shadow-sm transition-all"
            />
          </div>
        </div>

        <button 
          onClick={openAddForm}
          className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all bg-[#1A1F3D] text-white hover:bg-[#2a315c] shadow-sm shrink-0"
        >
          <Plus size={18} />
          Nouveau dossier
        </button>

      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredFolders.map((folder) => (
          <div 
            key={folder.id} 
            className={`bg-white rounded-xl p-5 border ${getStatusColor(folder.status)} shadow-sm hover:shadow-md transition-all group flex flex-col`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-white rounded-lg shadow-sm border border-gray-100 text-[#1A1F3D] group-hover:text-[#FF6600] transition-colors">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1F3D] text-sm line-clamp-2 leading-tight mb-1">{folder.title}</h3>
                  <p className="text-xs text-gray-500">{folder.type}</p>
                </div>
              </div>
              
              {/* Quick Actions Menu (Top right) */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => { setCurrentFolder(folder); setIsFormOpen(true); }}
                  className="p-1.5 text-gray-400 hover:text-[#1A1F3D] hover:bg-gray-100 rounded-md transition-colors" title="Modifier"
                >
                  <Edit size={14} />
                </button>
                <button 
                  onClick={() => { setCurrentFolder(folder); setIsDeleteOpen(true); }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Stagiaire:</span>
                <span className="font-semibold text-gray-900">{folder.student}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Mise à jour:</span>
                <span className="text-gray-700">{folder.date}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100/50">
                <span className="text-gray-500">Statut:</span>
                <StatusBadge status={folder.status === 'Complet' ? 'Validé' : folder.status} />
              </div>
            </div>

            {/* Quick Actions (Bottom) */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleAction(folder.id, 'Vérifié')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                <Search size={14} /> Voir détails
              </button>
              {folder.status !== 'Complet' ? (
                <button 
                  onClick={() => handleAction(folder.id, 'Relancé')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#FF6600]/10 text-[#FF6600] hover:bg-[#FF6600]/20 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                >
                  <Clock size={14} /> Relancer
                </button>
              ) : (
                <button 
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg text-xs font-semibold shadow-sm cursor-default"
                >
                  <CheckCircle2 size={14} /> Validé
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {filteredFolders.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm animate-in zoom-in-95">
          <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Aucun dossier trouvé pour cette recherche ou ce filtre.</p>
        </div>
      )}

      {/* Form Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title={currentFolder?.id ? "Modifier le dossier" : "Nouveau dossier"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre du document</label>
            <input 
              required 
              type="text" 
              value={currentFolder?.title || ''} 
              onChange={e => setCurrentFolder({...currentFolder, title: e.target.value})} 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all" 
              placeholder="Ex: Convention de stage"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stagiaire concerné</label>
            <input 
              required 
              type="text" 
              value={currentFolder?.student || ''} 
              onChange={e => setCurrentFolder({...currentFolder, student: e.target.value})} 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all" 
              placeholder="Ex: Jean Dupont"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type de document</label>
              <select 
                value={currentFolder?.type || 'Inscription'} 
                onChange={e => setCurrentFolder({...currentFolder, type: e.target.value})} 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all"
              >
                <option>Inscription</option>
                <option>Entreprise</option>
                <option>Financement</option>
                <option>Justificatif</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Statut</label>
              <select 
                value={currentFolder?.status || 'En attente'} 
                onChange={e => setCurrentFolder({...currentFolder, status: e.target.value})} 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all"
              >
                <option>Complet</option>
                <option>En attente</option>
                <option>Incomplet</option>
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
              {currentFolder?.id ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Prompt Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Supprimer ce dossier">
        <div className="mb-6">
          <p className="text-gray-600 text-sm">
            Êtes-vous sûr de vouloir supprimer le document <span className="font-bold text-[#1A1F3D]">{currentFolder?.title}</span> appartenant à {currentFolder?.student} ?
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
            Confirmer
          </button>
        </div>
      </Modal>

    </div>
  );
}
