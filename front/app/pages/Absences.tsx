import React, { useState } from 'react';
import { Search, Filter, Download, Plus, Clock, XCircle, Users } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { toast } from 'sonner';
import { Modal } from '../components/ui/Modal';

const initialAbsences = [
  { id: 'abs-1', type: 'Absence', name: "Jean Dupont", formation: "Développeur Web", date: "12/03/2026", duration: "Matin", status: "Justifiée", motif: "Maladie" },
  { id: 'abs-2', type: 'Retard', name: "Marie Curie", formation: "Data Science", date: "12/03/2026", duration: "1h", status: "En attente", motif: "Problème de transport" },
  { id: 'abs-3', type: 'Absence', name: "Alan Turing", formation: "Cybersécurité", date: "11/03/2026", duration: "Après-midi", status: "Non justifiée", motif: "-" },
  { id: 'abs-4', type: 'Retard', name: "Ada Lovelace", formation: "Développeur Web", date: "11/03/2026", duration: "15min", status: "Justifiée", motif: "RDV Médical" },
  { id: 'abs-5', type: 'Absence', name: "Grace Hopper", formation: "Systèmes et Réseaux", date: "10/03/2026", duration: "Journée", status: "Non justifiée", motif: "-" },
  { id: 'abs-6', type: 'Départ anticipé', name: "Tim Berners-Lee", formation: "Développeur Web", date: "09/03/2026", duration: "2h", status: "Justifiée", motif: "Urgence familiale" },
];

export function Absences() {
  const [absences, setAbsences] = useState(initialAbsences);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<any>(null);

  const filteredData = absences.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'Tous' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleExport = () => {
    toast.success('Export du fichier CSV en cours...');
  };

  const openAddForm = () => {
    const today = new Date().toLocaleDateString('fr-FR');
    setCurrentEntry({ 
      name: '', formation: 'Développeur Web', type: 'Absence', 
      date: today, duration: 'Journée', motif: '', status: 'En attente' 
    });
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAbsences([
      { ...currentEntry, id: `abs-${Math.random().toString()}` }, 
      ...absences
    ]);
    setIsFormOpen(false);
    toast.success(`Événement (${currentEntry.type}) déclaré pour ${currentEntry.name}.`);
  };

  const markJustified = (id: string, name: string) => {
    setAbsences(absences.map(a => a.id === id ? { ...a, status: 'Justifiée' } : a));
    toast.success(`Le statut pour ${name} a été mis à jour en "Justifiée".`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-500 rounded-lg">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Absences (Ce mois)</p>
            <p className="text-2xl font-bold text-[#1A1F3D]">{absences.filter(a => a.type === 'Absence').length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-[#FF6600] rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Retards (Ce mois)</p>
            <p className="text-2xl font-bold text-[#1A1F3D]">{absences.filter(a => a.type === 'Retard').length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-500 rounded-lg">
            <Filter size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">À justifier</p>
            <p className="text-2xl font-bold text-[#1A1F3D]">{absences.filter(a => a.status === 'Non justifiée' || a.status === 'En attente').length}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
            <option value="Départ anticipé">Départs anticipés</option>
          </select>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleExport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          >
            <Download size={16} />
            Exporter
          </button>
          <button 
            onClick={openAddForm}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-[#FF6600] text-white hover:bg-[#e65c00] shadow-sm"
          >
            <Plus size={16} />
            Saisir
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-50/80">
              <tr className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Stagiaire & Formation</th>
                <th className="px-6 py-4">Date & Durée</th>
                <th className="px-6 py-4">Motif</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                      item.type === 'Absence' ? 'bg-red-50 text-red-600' :
                      item.type === 'Retard' ? 'bg-orange-50 text-[#FF6600]' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#1A1F3D] text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.formation}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[#1A1F3D]">{item.date}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.duration}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 truncate max-w-[150px]">{item.motif || "-"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {item.status !== 'Justifiée' && (
                      <button 
                        onClick={() => markJustified(item.id, item.name)}
                        className="text-xs font-semibold px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-md transition-colors shadow-sm"
                      >
                        Justifier
                      </button>
                    )}
                    <button 
                      onClick={() => toast.info(`Aperçu du dossier assiduité pour ${item.name}`)}
                      className="text-gray-500 hover:text-[#1A1F3D] hover:bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                     <div className="flex flex-col items-center gap-2">
                      <Users size={32} className="text-gray-300" />
                      <p>Aucun événement ne correspond à votre recherche ou filtre.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-sm text-gray-500">
          <span>Affichage de {filteredData.length} résultats</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-white disabled:opacity-50" disabled>Précédent</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-white disabled:opacity-50" disabled>Suivant</button>
          </div>
        </div>
      </div>

      {/* Saisir Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title="Saisir un événement"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type</label>
              <select 
                value={currentEntry?.type || 'Absence'} 
                onChange={e => setCurrentEntry({...currentEntry, type: e.target.value})} 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all"
              >
                <option>Absence</option>
                <option>Retard</option>
                <option>Départ anticipé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
              <input 
                required 
                type="text" 
                value={currentEntry?.date || ''} 
                onChange={e => setCurrentEntry({...currentEntry, date: e.target.value})} 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all" 
                placeholder="JJ/MM/AAAA"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom du stagiaire</label>
            <input 
              required 
              type="text" 
              value={currentEntry?.name || ''} 
              onChange={e => setCurrentEntry({...currentEntry, name: e.target.value})} 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all" 
              placeholder="Ex: Jean Dupont"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Durée</label>
              <input 
                required 
                type="text" 
                value={currentEntry?.duration || ''} 
                onChange={e => setCurrentEntry({...currentEntry, duration: e.target.value})} 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all" 
                placeholder="Ex: Matin, 1h, 15min"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Formation</label>
              <select 
                value={currentEntry?.formation || 'Développeur Web'} 
                onChange={e => setCurrentEntry({...currentEntry, formation: e.target.value})} 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all"
              >
                <option>Développeur Web</option>
                <option>Data Science</option>
                <option>Cybersécurité</option>
                <option>Systèmes et Réseaux</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Motif (Optionnel)</label>
            <textarea 
              rows={2}
              value={currentEntry?.motif || ''} 
              onChange={e => setCurrentEntry({...currentEntry, motif: e.target.value})} 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all resize-none" 
              placeholder="Maladie, Transport..."
            />
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
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
