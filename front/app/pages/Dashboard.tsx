import React, { useState } from 'react';
import { 
  FolderOpen, 
  Clock, 
  XCircle,
  FileText,
  Plus,
  FileUp,
  AlertTriangle,
  ChevronRight,
  Search
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { X } from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { toast } from 'sonner';

// Mock Data
const initialAbsencesData = [
  { id: 'abs-1', type: 'absence', name: "Jean Dupont", formation: "Développeur Web", date: "12 Mar 2026", duration: "Matin", status: "Justifiée" },
  { id: 'abs-2', type: 'retard', name: "Marie Curie", formation: "Data Science", date: "12 Mar 2026", duration: "1h", status: "En attente" },
  { id: 'abs-3', type: 'absence', name: "Alan Turing", formation: "Cybersécurité", date: "11 Mar 2026", duration: "Après-midi", status: "Non justifiée" },
  { id: 'abs-4', type: 'retard', name: "Ada Lovelace", formation: "Développeur Web", date: "11 Mar 2026", duration: "15min", status: "Justifiée" },
  { id: 'abs-5', type: 'absence', name: "Grace Hopper", formation: "Systèmes et Réseaux", date: "10 Mar 2026", duration: "Journée", status: "Non justifiée" },
];

const documentsData = [
  { id: 'doc-1', docName: "Certificat Médical", student: "Marie Curie", date: "12 Mar", type: "Justificatif" },
  { id: 'doc-2', docName: "Convention de stage", student: "Alan Turing", date: "11 Mar", type: "Dossier" },
  { id: 'doc-3', docName: "Attestation", student: "Jean Dupont", date: "10 Mar", type: "Dossier" },
];

const chartData = [
  { name: 'Lun', Absences: 4, Retards: 2 },
  { name: 'Mar', Absences: 3, Retards: 1 },
  { name: 'Mer', Absences: 5, Retards: 4 },
  { name: 'Jeu', Absences: 2, Retards: 0 },
  { name: 'Ven', Absences: 6, Retards: 3 },
];

export function Dashboard() {
  const [absenceFilter, setAbsenceFilter] = useState('tous');
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  const filteredAbsences = initialAbsencesData.filter(item => {
    if (absenceFilter === 'tous') return true;
    return item.type === absenceFilter;
  });

  const handleDocumentAction = (action: 'valider' | 'refuser', docName: string) => {
    if (action === 'valider') {
      toast.success(`Document "${docName}" validé.`);
    } else {
      toast.error(`Document "${docName}" refusé.`);
    }
  };

  const handleAbsenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAbsenceModalOpen(false);
    toast.success('Événement déclaré avec succès.');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-20 lg:pb-0">
      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-2 lg:gap-3">
        {/* Absence Modal */}
        <Dialog.Root open={isAbsenceModalOpen} onOpenChange={setIsAbsenceModalOpen}>
          <Dialog.Trigger asChild>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 lg:px-4 py-2.5 rounded-lg text-sm font-semibold transition-all bg-[#FF6600] text-white hover:bg-[#e65c00] shadow-sm">
              <Plus size={18} />
              <span className="hidden sm:inline">Déclarer une absence/retard</span>
              <span className="sm:hidden">Absence</span>
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in" />
            <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-4 lg:p-6 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-5">
                <Dialog.Title className="text-xl font-bold text-[#1A1F3D]">Déclarer un événement</Dialog.Title>
                <Dialog.Close asChild>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close">
                    <X size={20} />
                  </button>
                </Dialog.Close>
              </div>
              
              <form className="space-y-4" onSubmit={handleAbsenceSubmit}>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Type d'événement</label>
                  <select className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all">
                    <option>Absence</option>
                    <option>Retard</option>
                    <option>Départ anticipé</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Stagiaire</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Rechercher..." className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Date</label>
                    <input type="date" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Durée</label>
                    <select className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all">
                      <option>Matin</option>
                      <option>Après-midi</option>
                      <option>Journée</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Motif (optionnel)</label>
                  <textarea rows={3} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none transition-all resize-none"></textarea>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                  <Dialog.Close asChild>
                    <button type="button" className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Annuler</button>
                  </Dialog.Close>
                  <button type="submit" className="px-4 py-2.5 text-sm font-semibold text-white bg-[#FF6600] hover:bg-[#e65c00] rounded-lg transition-colors shadow-sm">
                    Enregistrer
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Dossier Modal */}
        <Dialog.Root open={isDossierModalOpen} onOpenChange={setIsDossierModalOpen}>
          <Dialog.Trigger asChild>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 lg:px-4 py-2.5 rounded-lg text-sm font-semibold transition-all bg-white text-[#1A1F3D] border border-gray-200 hover:bg-gray-50 shadow-sm">
              <FileUp size={18} />
              <span className="hidden sm:inline">Nouveau dossier</span>
              <span className="sm:hidden">Dossier</span>
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in" />
            <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-md bg-white rounded-2xl p-6 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-5">
                <Dialog.Title className="text-xl font-bold text-[#1A1F3D]">Créer un dossier</Dialog.Title>
                <Dialog.Close asChild>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </Dialog.Close>
              </div>
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
                  <FolderOpen size={32} />
                </div>
                <p className="text-gray-500 text-sm px-4">Le formulaire est en cours de développement.</p>
                <button onClick={() => setIsDossierModalOpen(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm transition-colors">
                  Fermer
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <button 
          onClick={() => toast.info('Génération en cours...')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 lg:px-4 py-2.5 rounded-lg text-sm font-semibold transition-all bg-white text-[#1A1F3D] border border-gray-200 hover:bg-gray-50 shadow-sm"
        >
          <AlertTriangle size={18} />
          Générer alertes (3)
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatCard title="Absences" value="12" icon={<XCircle size={20} />} accentColor="orange" trend="+2" />
        <StatCard title="Retards" value="5" icon={<Clock size={20} />} accentColor="orange" />
        <StatCard title="Incomplets" value="24" icon={<FolderOpen size={20} />} accentColor="red" trend="Action" />
        <StatCard title="En attente" value="8" icon={<FileText size={20} />} accentColor="blue" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6 lg:space-y-8">
          
          {/* Chart Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base lg:text-lg font-bold text-[#1A1F3D]">Évolution Absences & Retards</h2>
                <p className="text-xs lg:text-sm text-gray-500">Semaine en cours</p>
              </div>
            </div>
            <div className="h-[200px] lg:h-[250px] w-full min-w-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 11}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 11}} />
                  <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}} />
                  <Legend iconType="circle" wrapperStyle={{paddingTop: '10px', fontSize: '11px'}} />
                  <Bar dataKey="Absences" fill="#FF6600" radius={[4, 4, 0, 0]} maxBarSize={30} isAnimationActive={false} />
                  <Bar dataKey="Retards" fill="#1A1F3D" radius={[4, 4, 0, 0]} maxBarSize={30} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Absences List with Tabs */}
          <Tabs.Root className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border border-gray-200" defaultValue="tous" onValueChange={setAbsenceFilter}>
            <div className="px-4 lg:px-6 pt-4 lg:pt-5 pb-0 border-b border-gray-100 flex flex-col sm:flex-row sm:items-end justify-between gap-2 lg:gap-4">
              <div className="flex items-center gap-3 pb-2 lg:pb-4">
                <div className="p-1.5 lg:p-2 bg-orange-50 text-[#FF6600] rounded-lg">
                  <XCircle size={18} />
                </div>
                <h2 className="text-base lg:text-lg font-bold text-[#1A1F3D]">Derniers événements</h2>
              </div>
              
              <Tabs.List className="flex border-b border-transparent overflow-x-auto no-scrollbar w-full sm:w-auto">
                {['tous', 'absence', 'retard'].map((val) => (
                  <Tabs.Trigger 
                    key={val}
                    value={val}
                    className="px-4 py-2.5 text-xs lg:text-sm font-semibold text-gray-500 hover:text-gray-700 data-[state=active]:text-[#FF6600] data-[state=active]:border-b-2 data-[state=active]:border-[#FF6600] outline-none transition-colors capitalize whitespace-nowrap"
                  >
                    {val}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
            </div>
            
            <div className="p-0 flex-1 overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-gray-50/80">
                  <tr className="text-[10px] lg:text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                    <th className="px-4 lg:px-6 py-3">Type</th>
                    <th className="px-4 lg:px-6 py-3">Stagiaire</th>
                    <th className="px-4 lg:px-6 py-3">Date</th>
                    <th className="px-4 lg:px-6 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAbsences.length > 0 ? (
                    filteredAbsences.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 lg:px-6 py-3">
                          {item.type === 'absence' 
                            ? <span className="px-2 py-1 rounded bg-red-50 text-red-600 text-[10px] lg:text-xs font-bold">Absence</span>
                            : <span className="px-2 py-1 rounded bg-orange-50 text-[#FF6600] text-[10px] lg:text-xs font-bold">Retard</span>
                          }
                        </td>
                        <td className="px-4 lg:px-6 py-3">
                          <p className="font-bold text-[#1A1F3D] text-xs lg:text-sm truncate max-w-[120px] lg:max-w-none">{item.name}</p>
                          <p className="text-[10px] lg:text-xs text-gray-500 truncate max-w-[120px] lg:max-w-none">{item.formation}</p>
                        </td>
                        <td className="px-4 lg:px-6 py-3">
                          <p className="text-xs lg:text-sm font-medium text-[#1A1F3D]">{item.date}</p>
                          <p className="text-[10px] lg:text-xs text-gray-500">{item.duration}</p>
                        </td>
                        <td className="px-4 lg:px-6 py-3">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                        Aucun événement.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Tabs.Root>
        </div>

        {/* Right Column (Documents & Alerts) */}
        <div className="space-y-6 lg:space-y-8">
          
          {/* Documents List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border border-gray-200">
            <div className="px-4 lg:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="p-1.5 lg:p-2 bg-blue-50 text-[#1A1F3D] rounded-lg">
                  <FolderOpen size={18} />
                </div>
                <h2 className="text-base lg:text-lg font-bold text-[#1A1F3D]">À vérifier</h2>
              </div>
            </div>
            <div className="p-0">
              <ul className="divide-y divide-gray-100">
                {documentsData.map((item) => (
                  <li key={item.id} className="p-4 lg:p-5 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-500 shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-[#1A1F3D] text-xs lg:text-sm truncate">{item.docName}</p>
                        <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5 truncate">{item.student} • {item.type}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full">
                      <button 
                        onClick={() => handleDocumentAction('valider', item.docName)}
                        className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-bold transition-colors border border-green-200"
                      >
                        Valider
                      </button>
                      <button 
                        onClick={() => handleDocumentAction('refuser', item.docName)}
                        className="flex-1 bg-white text-gray-700 hover:text-red-600 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-bold transition-colors border border-gray-200 hover:border-red-200"
                      >
                        Refuser
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Alert Box */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 lg:p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#EF4444]"></div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-[#EF4444] shrink-0 mt-0.5" size={18} lg:size={20} />
              <div>
                <h3 className="font-bold text-red-800 text-xs lg:text-sm">24 Dossiers Incomplets</h3>
                <p className="text-red-600 text-[10px] lg:text-xs mt-1 leading-relaxed">
                  Relances automatiques en attente de validation.
                </p>
                <button className="mt-3 text-[10px] lg:text-xs font-bold text-white bg-[#EF4444] hover:bg-red-600 px-3 py-2 rounded-lg transition-all flex items-center gap-1.5">
                  Gérer <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
