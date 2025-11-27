
import React, { useState } from 'react';
import { BusinessCardData, Fiera } from '../types';
import { Search, Trash2, Download, Upload, Filter, Plus, User, Calendar, FolderOpen, ChevronDown, ListFilter, Users } from 'lucide-react';
import { deleteFiera, reassignContactsFiera } from '../services/storageService';

interface ContactListProps {
  contacts: BusinessCardData[];
  fieras: Fiera[];
  activeFieraId: string | 'all';
  onSelectFiera: (id: string | 'all') => void;
  onCreateFiera: (name: string) => void;
  onDelete: (id: string) => void;
  onView: (contact: BusinessCardData) => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
}

const ContactList: React.FC<ContactListProps> = ({ 
  contacts, 
  fieras, 
  activeFieraId, 
  onSelectFiera, 
  onCreateFiera,
  onDelete, 
  onView, 
  onImport, 
  onExport 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingFiera, setIsCreatingFiera] = useState(false);
  const [newFieraName, setNewFieraName] = useState('');
  
  // State for delete fiera modal
  const [deleteFieraModal, setDeleteFieraModal] = useState<{ isOpen: boolean; fiera: Fiera | null }>({
    isOpen: false,
    fiera: null
  });
  const [targetFieraId, setTargetFieraId] = useState<string>('none');

  // Filter Logic: Search Term AND Fiera ID
  const filteredContacts = contacts.filter(c => {
    const matchesSearch = `${c.nome} ${c.cognome} ${c.azienda}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFiera = activeFieraId === 'all' || c.fieraId === activeFieraId;
    return matchesSearch && matchesFiera;
  }).sort((a, b) => b.timestamp - a.timestamp);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getInitials = (nome: string, cognome: string) => {
    return `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase();
  };

  const handleCreateFieraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(newFieraName.trim()) {
      onCreateFiera(newFieraName.trim());
      setNewFieraName('');
      setIsCreatingFiera(false);
    }
  };

  const handleDeleteFieraInit = (e: React.MouseEvent, fiera: Fiera) => {
    e.stopPropagation();
    setDeleteFieraModal({ isOpen: true, fiera });
    setTargetFieraId('none');
  };

  const confirmDeleteFiera = async () => {
    if (!deleteFieraModal.fiera) return;
    try {
      // 1. Reassign contacts if needed
      const contactsInFiera = contacts.filter(c => c.fieraId === deleteFieraModal.fiera!.id);
      if (contactsInFiera.length > 0) {
        const newFieraId = targetFieraId === 'none' ? undefined : targetFieraId;
        await reassignContactsFiera(deleteFieraModal.fiera.id, newFieraId);
      }
      
      // 2. Delete the fiera
      await deleteFiera(deleteFieraModal.fiera.id);
      
      // 3. Reset UI
      if (activeFieraId === deleteFieraModal.fiera.id) {
        onSelectFiera('all');
      }
      setDeleteFieraModal({ isOpen: false, fiera: null });
    } catch (err) {
      console.error(err);
      alert("Errore durante l'eliminazione dell'evento.");
    }
  };

  const activeFieraName = activeFieraId === 'all' ? 'Tutti gli Eventi' : fieras.find(f => f.id === activeFieraId)?.name || 'Evento Sconosciuto';
  const contactsInActiveFiera = contacts.filter(c => c.fieraId === activeFieraId).length;

  return (
    <div className="w-full animate-in fade-in duration-500">
      
      {/* --- Filter & Event Bar --- */}
      <div className="mb-6 bg-white p-4 rounded-sm border border-slate-200 shadow-sm flex flex-col gap-4">
        
        {/* Top Row: Event Selector and Import/Export */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Event Dropdown Area */}
          <div className="relative group z-20 w-full md:w-auto">
             <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contesto Attivo</span>
             </div>
             <button className="flex items-center justify-between w-full md:w-72 bg-slate-900 border border-slate-900 px-4 py-3 rounded-sm shadow-md hover:bg-slate-800 transition-colors text-white group-focus-within:ring-2 ring-[#FFE900]">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Calendar className="w-4 h-4 text-[#FFE900]" />
                  <span className="font-bold text-sm truncate">{activeFieraName}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
             </button>

             {/* Dropdown Menu */}
             <div className="hidden group-hover:block absolute top-full left-0 w-full md:w-80 bg-white border border-slate-200 shadow-xl rounded-sm mt-1 p-1 max-h-80 overflow-y-auto z-50">
                <button 
                  onClick={() => onSelectFiera('all')}
                  className={`w-full text-left px-4 py-3 text-xs font-bold uppercase rounded-sm flex items-center gap-2 ${activeFieraId === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <FolderOpen className="w-4 h-4" /> Tutti gli Eventi
                </button>
                <div className="h-px bg-slate-100 my-1"></div>
                {fieras.map(f => (
                  <div key={f.id} className="flex items-center group/item hover:bg-slate-50 rounded-sm">
                    <button 
                      onClick={() => onSelectFiera(f.id)}
                      className={`flex-1 text-left px-4 py-3 text-sm font-medium truncate ${activeFieraId === f.id ? 'bg-yellow-50 text-slate-900 border-l-4 border-[#FFE900]' : 'text-slate-700 border-l-4 border-transparent'}`}
                    >
                      {f.name}
                    </button>
                    <button
                       onClick={(e) => handleDeleteFieraInit(e, f)}
                       className="p-3 text-slate-300 hover:text-red-600 transition-colors opacity-0 group-hover/item:opacity-100"
                       title="Elimina Evento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="h-px bg-slate-100 my-1"></div>
                <button 
                  onClick={() => setIsCreatingFiera(true)}
                  className="w-full text-left px-4 py-3 text-xs font-bold uppercase text-[#FFE900] bg-slate-900 hover:bg-slate-800 rounded-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Nuovo Evento
                </button>
             </div>
          </div>

          {/* Tools */}
          <div className="flex gap-2 w-full md:w-auto self-end">
             <button onClick={onExport} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 rounded-sm font-bold text-xs uppercase transition-colors shadow-sm">
               <Download className="w-4 h-4" /> Export
             </button>
             <label className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 rounded-sm font-bold text-xs uppercase cursor-pointer transition-colors shadow-sm">
               <Upload className="w-4 h-4" /> Import
               <input type="file" accept=".json" onChange={onImport} className="hidden" />
             </label>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
           <input 
             type="text" 
             placeholder="Cerca contatti..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-10 pr-4 py-3 bg-slate-50 border-b-2 border-slate-200 focus:border-[#FFE900] outline-none text-slate-900 font-medium transition-colors"
           />
        </div>
      </div>

      {/* New Fiera Modal */}
      {isCreatingFiera && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm p-6 rounded-sm shadow-2xl border-t-8 border-[#FFE900]">
             <h3 className="text-lg font-black text-slate-900 uppercase mb-4">Crea Nuovo Evento</h3>
             <form onSubmit={handleCreateFieraSubmit}>
               <input 
                 autoFocus
                 type="text" 
                 placeholder="Es. Mecspe 2024..." 
                 value={newFieraName}
                 onChange={(e) => setNewFieraName(e.target.value)}
                 className="w-full p-3 border border-slate-300 rounded-sm mb-4 focus:border-[#FFE900] outline-none font-bold"
               />
               <div className="flex justify-end gap-2">
                 <button type="button" onClick={() => setIsCreatingFiera(false)} className="px-4 py-2 text-slate-500 font-bold text-xs uppercase hover:bg-slate-100 rounded-sm">Annulla</button>
                 <button type="submit" disabled={!newFieraName.trim()} className="px-4 py-2 bg-[#FFE900] text-slate-900 font-bold text-xs uppercase rounded-sm hover:bg-[#E6D200]">Crea</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Delete Fiera Modal */}
      {deleteFieraModal.isOpen && deleteFieraModal.fiera && (
        <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md p-6 rounded-sm shadow-2xl border-t-8 border-red-600">
             <h3 className="text-lg font-black text-slate-900 uppercase mb-2">Elimina Evento</h3>
             <p className="text-sm text-slate-600 mb-4">
               Stai eliminando <strong>{deleteFieraModal.fiera.name}</strong>. 
             </p>

             {contacts.filter(c => c.fieraId === deleteFieraModal.fiera!.id).length > 0 && (
               <div className="bg-yellow-50 p-4 border border-yellow-200 mb-4 rounded-sm">
                 <p className="text-xs font-bold text-yellow-800 uppercase mb-2">Attenzione: Contiene Leads</p>
                 <p className="text-sm text-slate-700 mb-2">Ci sono contatti associati a questo evento. Dove vuoi spostarli?</p>
                 <select 
                    className="w-full p-2 border border-slate-300 rounded-sm text-sm"
                    value={targetFieraId}
                    onChange={(e) => setTargetFieraId(e.target.value)}
                 >
                   <option value="none">-- Scollega da Eventi (Mantieni in CRM) --</option>
                   {fieras.filter(f => f.id !== deleteFieraModal.fiera!.id).map(f => (
                     <option key={f.id} value={f.id}>Sposta in: {f.name}</option>
                   ))}
                 </select>
               </div>
             )}

             <div className="flex justify-end gap-2 mt-4">
               <button onClick={() => setDeleteFieraModal({ isOpen: false, fiera: null })} className="px-4 py-2 text-slate-500 font-bold text-xs uppercase hover:bg-slate-100 rounded-sm">Annulla</button>
               <button onClick={confirmDeleteFiera} className="px-4 py-2 bg-red-600 text-white font-bold text-xs uppercase rounded-sm hover:bg-red-700 shadow-sm">Conferma Eliminazione</button>
             </div>
           </div>
        </div>
      )}

      {/* Data Table Header */}
      <div className="bg-white rounded-sm shadow-md overflow-hidden border border-slate-200">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-900 text-white border-b border-slate-900 text-[11px] font-bold uppercase tracking-wider">
          <div className="col-span-4 md:col-span-3">Nome Contatto</div>
          <div className="col-span-4 md:col-span-3">Azienda</div>
          <div className="hidden md:block md:col-span-3">Email</div>
          <div className="hidden md:block md:col-span-2">Data Scansione</div>
          <div className="col-span-4 md:col-span-1 text-right">Azioni</div>
        </div>

        {/* Data Rows */}
        <div className="divide-y divide-slate-100">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-20 bg-slate-50">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-slate-900 font-bold mb-1">Nessun contatto trovato</h3>
              <p className="text-slate-500 text-xs">Modifica i filtri o inizia una nuova scansione.</p>
            </div>
          ) : (
            filteredContacts.map(contact => (
              <div 
                key={contact.id} 
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center bg-white hover:bg-blue-50/50 transition-colors border-l-4 border-transparent hover:border-[#FFE900] group relative"
              >
                {/* Area cliccabile principale */}
                <button 
                  type="button"
                  onClick={() => onView(contact)}
                  className="absolute inset-0 w-full h-full cursor-pointer z-0 focus:outline-none"
                  aria-label="Vedi dettagli"
                ></button>

                {/* Name Column */}
                <div className="col-span-4 md:col-span-3 flex items-center gap-3 overflow-hidden pointer-events-none z-10">
                  <div className="w-9 h-9 rounded-sm bg-slate-800 text-[#FFE900] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-slate-700">
                    {getInitials(contact.nome || '?', contact.cognome || '?')}
                  </div>
                  <div className="truncate">
                    <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-900">{contact.nome} {contact.cognome}</h3>
                    <p className="text-xs text-slate-500 truncate md:hidden">{contact.azienda}</p>
                  </div>
                </div>

                {/* Company Column */}
                <div className="col-span-4 md:col-span-3 overflow-hidden flex flex-col justify-center pointer-events-none z-10">
                  <p className="text-sm font-semibold text-slate-700 truncate">{contact.azienda || '-'}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide truncate">{contact.ruolo}</p>
                </div>

                {/* Email Column (Desktop) */}
                <div className="hidden md:block md:col-span-3 overflow-hidden pointer-events-none z-10">
                  <p className="text-sm text-slate-600 truncate">
                    {contact.email || '-'}
                  </p>
                </div>

                {/* Date Column (Desktop) */}
                <div className="hidden md:block md:col-span-2 pointer-events-none z-10">
                  <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-sm border border-slate-200">
                    {formatDate(contact.timestamp)}
                  </span>
                </div>

                {/* Actions Column */}
                <div className="col-span-4 md:col-span-1 flex justify-end z-20 relative">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // Stop propagation explicitly
                      if (contact.id) onDelete(contact.id);
                    }}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"
                    title="Elimina Contatto"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center text-xs text-slate-400 font-medium px-2">
         <span>Sistema CRM Brevetti Stendalto</span>
         <span>Record: {filteredContacts.length}</span>
      </div>
    </div>
  );
};

export default ContactList;
