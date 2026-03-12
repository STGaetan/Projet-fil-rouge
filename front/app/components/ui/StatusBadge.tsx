import React from 'react';
import { CheckCircle2, AlertTriangle, XOctagon } from 'lucide-react';

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'Justifiée':
    case 'Validé':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-200"><CheckCircle2 size={12}/> {status}</span>;
    case 'En attente':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-50 text-[#FF6600] border border-orange-200"><AlertTriangle size={12}/> {status}</span>;
    case 'Non justifiée':
    case 'Incomplet':
    case 'Refusé':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-[#EF4444] border border-red-200"><XOctagon size={12}/> {status}</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">{status}</span>;
  }
}
