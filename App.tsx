
import React, { useState, useEffect } from 'react';
import { Scan, Upload, Loader2, LogOut, Plus } from 'lucide-react';
import CameraCapture from './components/CameraCapture';
import ResultCard from './components/ResultCard';
import ContactList from './components/ContactList';
import LoginScreen from './components/LoginScreen';
import ConfirmDialog from './components/ConfirmDialog';
import { analyzeBusinessCard } from './services/geminiService';
import { subscribeToContacts, addContact, updateContact, deleteContact, batchImportContacts, subscribeToFieras, addFiera } from './services/storageService';
import { BusinessCardData, ScannedCardData, Fiera } from './types';

const App: React.FC = () => {
  // --- Authentication State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- App Flow State ---
  const [view, setView] = useState<'list' | 'camera' | 'result'>('list');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<BusinessCardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // --- Delete Confirmation State ---
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; contactId: string | null }>({
    isOpen: false,
    contactId: null
  });

  // --- Data State ---
  const [contacts, setContacts] = useState<BusinessCardData[]>([]);
  const [fieras, setFieras] = useState<Fiera[]>([]);
  const [activeFieraId, setActiveFieraId] = useState<string | 'all'>('all');

  // --- Effects ---
  useEffect(() => {
    // Check local auth
    const auth = localStorage.getItem('bs_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  // Sync data from Firestore when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const unsubContacts = subscribeToContacts(setContacts);
      const unsubFieras = subscribeToFieras(setFieras);
      return () => {
        unsubContacts();
        unsubFieras();
      };
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    localStorage.setItem('bs_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('bs_auth');
    setIsAuthenticated(false);
  };

  // --- Handlers ---

  const handleProcessImage = async (imageSrc: string) => {
    setCurrentImage(imageSrc);
    setView('result'); 
    setIsAnalyzing(true);
    setError(null);
    setExtractedData(null);

    try {
      const data: ScannedCardData = await analyzeBusinessCard(imageSrc);
      const tempCard: BusinessCardData = {
        ...data,
        id: '', // Empty ID signals "New"
        timestamp: 0,
        // Assign to current active fiera if one is selected, else null (not undefined)
        fieraId: activeFieraId !== 'all' ? activeFieraId : undefined
      };
      setExtractedData(tempCard);
    } catch (err) {
      console.error(err);
      setError("Errore durante l'analisi OCR. Assicurati che l'immagine sia nitida e riprova.");
      setView('list'); 
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleProcessImage(base64String);
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    event.target.value = '';
  };

  const handleSaveContact = async (finalData: BusinessCardData) => {
    try {
      if (finalData.id && finalData.id !== '') {
        await updateContact(finalData.id, finalData);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...newContactData } = finalData;
        await addContact(newContactData);
      }
      setView('list');
      setExtractedData(null);
      setCurrentImage(null);
    } catch (err) {
      console.error("Error saving to DB:", err);
      setError("Errore nel salvataggio del database. Riprova tra poco.");
    }
  };

  const handleCreateFiera = async (name: string) => {
    try {
      const id = await addFiera(name);
      setActiveFieraId(id); // Switch to new fiera automatically
    } catch (err) {
      console.error(err);
      alert("Impossibile creare l'evento.");
    }
  };

  const onRequestDelete = (id: string) => {
    setDeleteDialog({ isOpen: true, contactId: id });
  };

  const confirmDelete = async () => {
    const id = deleteDialog.contactId;
    if (!id) return;

    try {
      await deleteContact(id);
      setDeleteDialog({ isOpen: false, contactId: null });
      
      if (extractedData?.id === id) {
        setView('list');
        setExtractedData(null);
      }
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Impossibile eliminare il contatto. Riprova.");
      setDeleteDialog({ isOpen: false, contactId: null });
    }
  };

  const handleExport = () => {
    // Export only currently filtered contacts? Or all? Let's export filtered for flexibility.
    const contactsToExport = activeFieraId === 'all' 
      ? contacts 
      : contacts.filter(c => c.fieraId === activeFieraId);

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(contactsToExport));
    const downloadAnchorNode = document.createElement('a');
    const filename = activeFieraId === 'all' 
       ? `brevetti_crm_full_backup.json` 
       : `brevetti_crm_${fieras.find(f => f.id === activeFieraId)?.name.replace(/\s+/g,'_')}.json`;
       
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          if (confirm(`Confermi l'importazione di ${imported.length} contatti?`)) {
             await batchImportContacts(imported);
          }
        }
      } catch (err) {
        console.error(err);
        alert('File non valido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // --- Render ---

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans pb-24 relative">
      
      <ConfirmDialog 
        isOpen={deleteDialog.isOpen}
        title="Elimina Record"
        message="Questa azione è irreversibile. Il contatto verrà rimosso dal database aziendale."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, contactId: null })}
      />

      {/* Corporate Header - Dark Theme */}
      <header className="bg-slate-900 border-b-4 border-[#FFE900] sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('list')}>
             <div className="w-9 h-9 bg-[#FFE900] flex items-center justify-center font-black text-lg rounded-sm group-hover:bg-[#E6D200] transition-colors shadow-glow">
               b
             </div>
             <div>
                <h1 className="font-black text-white text-lg leading-none uppercase tracking-tight">Brevetti Stendalto</h1>
                <span className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase block mt-0.5">Energy in Motion</span>
             </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:block text-slate-500 text-xs uppercase font-bold tracking-wider">CRM System v2.1</span>
            <button onClick={handleLogout} className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase bg-slate-800 px-3 py-1.5 rounded-sm hover:bg-slate-700">
              <span>Esci</span>
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* Loading Overlay */}
        {isAnalyzing && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
             <div className="bg-white p-8 rounded shadow-2xl flex flex-col items-center max-w-sm w-full border-t-8 border-[#FFE900]">
               <Loader2 className="w-12 h-12 text-[#FFE900] animate-spin mb-6" />
               <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Elaborazione OCR</h2>
               <p className="text-slate-500 text-sm mt-2 text-center">Analisi immagine ed estrazione dati strutturati in corso...</p>
             </div>
          </div>
        )}

        {/* View Switcher */}
        {view === 'list' && (
          <>
             <ContactList 
               contacts={contacts} 
               fieras={fieras}
               activeFieraId={activeFieraId}
               onSelectFiera={setActiveFieraId}
               onCreateFiera={handleCreateFiera}
               onDelete={onRequestDelete} 
               onView={(contact) => {
                 setExtractedData(contact);
                 setCurrentImage(''); 
                 setView('result');
               }}
               onImport={handleImport}
               onExport={handleExport}
             />

             {/* FABs */}
             <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-30">
                <div className="flex items-center gap-2 group">
                   <span className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Carica Foto</span>
                   <label className="bg-white p-3 rounded-full shadow-lg border border-slate-200 cursor-pointer hover:border-[#FFE900] transition-colors text-slate-600 hover:text-[#FFE900]">
                     <Upload className="w-5 h-5" />
                     <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                   </label>
                </div>
                
                <button 
                  onClick={() => setView('camera')}
                  className="bg-[#FFE900] p-5 rounded-full shadow-2xl shadow-black/20 hover:scale-105 hover:bg-[#E6D200] transition-all text-slate-900 flex items-center gap-2 group border-2 border-white"
                >
                  <Scan className="w-7 h-7" />
                  <span className="font-black uppercase text-sm pr-1 hidden group-hover:block transition-all">Nuova Scansione</span>
                </button>
             </div>
          </>
        )}

        {view === 'camera' && (
           <CameraCapture 
             onCapture={handleProcessImage}
             onCancel={() => setView('list')}
           />
        )}

        {view === 'result' && extractedData && (
          <ResultCard 
            initialData={extractedData}
            imageSrc={currentImage || ""}
            fieras={fieras}
            onSave={handleSaveContact}
            onDiscard={() => {
              setView('list');
              setExtractedData(null);
            }}
            onDelete={onRequestDelete}
          />
        )}

        {error && (
           <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 shadow-2xl rounded-sm flex items-center gap-4 z-50 animate-in slide-in-from-bottom-2 border-l-4 border-white">
              <p className="font-bold text-sm">{error}</p>
              <button onClick={() => setError(null)} className="text-white/80 hover:text-white font-bold text-sm uppercase text-xs">Chiudi</button>
           </div>
        )}

      </main>
    </div>
  );
};

export default App;
