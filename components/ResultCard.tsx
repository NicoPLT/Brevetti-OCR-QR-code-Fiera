
import React, { useState, useEffect } from 'react';
import { BusinessCardData, ProductRow, ReportData, Fiera } from '../types';
import { Save, Trash2, ArrowLeft, Building2, User, Mail, Phone, Globe, MapPin, FileText, CheckSquare, Briefcase, PenSquare, X, Calendar, Factory, Scan } from 'lucide-react';

interface ResultCardProps {
  initialData: BusinessCardData;
  imageSrc: string;
  fieras: Fiera[]; 
  onSave: (data: BusinessCardData) => void;
  onDiscard: () => void;
  onDelete?: (id: string) => void;
}

const PRODUCTS_LIST = [
  "CATENE PORTACAVI NYLON",
  "CATENE PORTACAVI ACCIAIO",
  "CAVI / CAVI CABLATI",
  "GUAINE E RACCORDI",
  "TOTAL CHAIN",
  "MRS",
  "ALTRO..."
];

const SOURCES_LIST = ["SITO", "SOCIAL", "PASSAPAROLA", "PUBBLICITÀ", "ALTRO"];
const ACTIONS_FIERA_LIST = ["CONSEGNATO CATALOGO CATENE", "CONSEGNATO CATALOGO CAVI", "CONSEGNATO CATALOGO GUAINE", "CONSEGNATO CATALOGO MRS"];
const ACTIONS_FUTURE_LIST = ["INVIARE CATALOGHI", "VISITA FUNZIONARIO DI ZONA", "ALTRO..."];

const ResultCard: React.FC<ResultCardProps> = ({ initialData, imageSrc, fieras, onSave, onDiscard, onDelete }) => {
  const [formData, setFormData] = useState<BusinessCardData>(initialData);
  const isNewScan = !initialData.id || initialData.id === '';
  const [isEditing, setIsEditing] = useState<boolean>(isNewScan);
  
  // Initialize report if not present
  useEffect(() => {
    if (!formData.report) {
      const initialReport: ReportData = {
        products: PRODUCTS_LIST.map(name => ({ name, clienteBS: null, competitor: '' })),
        sources: [],
        actionsFiera: [],
        actionsFuture: [],
      };
      setFormData(prev => ({ ...prev, report: initialReport }));
    }
  }, []); 

  const handleInputChange = (field: keyof BusinessCardData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProductChange = (index: number, field: keyof ProductRow, value: any) => {
    if (!isEditing) return;
    setFormData(prev => {
      const newReport = { ...(prev.report!) };
      const newProducts = [...newReport.products];
      newProducts[index] = { ...newProducts[index], [field]: value };
      newReport.products = newProducts;
      return { ...prev, report: newReport };
    });
  };

  const toggleListSelection = (listType: keyof ReportData, item: string) => {
    if (!isEditing) return;
    setFormData(prev => {
      const newReport = { ...(prev.report!) };
      const list = newReport[listType] as string[];
      if (list.includes(item)) {
        // @ts-ignore
        newReport[listType] = list.filter(i => i !== item);
      } else {
        // @ts-ignore
        newReport[listType] = [...list, item];
      }
      return { ...prev, report: newReport };
    });
  };

  const InputField = ({ icon: Icon, label, field }: { icon: any, label: string, field: keyof BusinessCardData }) => (
    <div className="group mb-4">
      <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
        <Icon className="w-3 h-3 text-slate-400" /> {label}
      </label>
      {isEditing ? (
        <input 
          type="text" 
          value={formData[field] as string}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium px-3 py-2 rounded-sm focus:border-[#FFE900] focus:ring-1 focus:ring-[#FFE900] outline-none transition-all"
          placeholder={`...`}
        />
      ) : (
        <div className="text-sm font-medium text-slate-900 min-h-[1.5rem] break-words border-b border-transparent">
          {formData[field] as string || <span className="text-slate-300 text-xs italic">N/A</span>}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Actions - Dark */}
      <div className="flex justify-between items-center bg-slate-900 p-4 rounded-sm border-l-8 border-[#FFE900] shadow-lg text-white">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onDiscard} className="text-slate-400 hover:text-[#FFE900] flex items-center gap-2 text-xs font-bold uppercase transition-colors">
            <ArrowLeft className="w-4 h-4" /> Indietro
          </button>
          <div className="h-8 w-px bg-slate-700"></div>
          <div>
            <h1 className="text-xl font-black text-white leading-none tracking-tight">
              {formData.nome || 'Nuovo Contatto'} {formData.cognome}
            </h1>
            <p className="text-xs text-[#FFE900] font-bold uppercase mt-1">
               {formData.azienda || 'Azienda non specificata'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!isNewScan && onDelete && (
             <button 
               type="button"
               onClick={() => { if(formData.id) onDelete(formData.id); }}
               className="text-slate-400 hover:text-red-500 hover:bg-slate-800 p-2 rounded-sm transition-colors"
               title="Elimina Record"
             >
               <Trash2 className="w-5 h-5" />
             </button>
          )}

          {!isEditing ? (
            <button 
              type="button"
              onClick={() => setIsEditing(true)}
              className="bg-white text-slate-900 border border-slate-200 px-5 py-2 rounded-sm font-bold uppercase text-xs flex items-center gap-2 hover:bg-[#FFE900] hover:border-[#FFE900] transition-all shadow-sm"
            >
              <PenSquare className="w-4 h-4" /> Modifica
            </button>
          ) : (
            <>
               {!isNewScan && (
                 <button 
                   type="button"
                   onClick={() => {
                     setIsEditing(false);
                     setFormData(initialData);
                   }}
                   className="text-slate-400 px-4 py-2 font-bold uppercase text-xs hover:text-white transition-colors"
                 >
                   Annulla
                 </button>
               )}
               <button 
                type="button"
                onClick={() => onSave(formData)}
                className="bg-[#FFE900] text-slate-900 px-6 py-2.5 font-black uppercase text-xs flex items-center gap-2 hover:bg-white hover:text-black transition-colors rounded-sm shadow-md"
              >
                <Save className="w-4 h-4" /> Salva Record
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: Contact Record */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden">
             <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Dati Anagrafici</h3>
                <User className="w-4 h-4 text-slate-400" />
             </div>
             
             <div className="p-6">
                {/* Fiera Selector Field */}
                <div className="group mb-6">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <Calendar className="w-3 h-3" /> Evento di Riferimento
                    </label>
                    {isEditing ? (
                    <select
                        value={formData.fieraId || ''}
                        onChange={(e) => handleInputChange('fieraId', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold px-3 py-2 rounded-sm focus:border-[#FFE900] outline-none transition-all"
                    >
                        <option value="">Nessun Evento</option>
                        {fieras.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </select>
                    ) : (
                    <div className="text-sm font-bold text-slate-900 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-sm inline-block">
                        {fieras.find(f => f.id === formData.fieraId)?.name || <span className="text-slate-400 italic">Nessun evento</span>}
                    </div>
                    )}
                </div>
                
                <div className="space-y-1">
                    <InputField icon={User} label="Nome" field="nome" />
                    <InputField icon={User} label="Cognome" field="cognome" />
                </div>
                
                <div className="h-px bg-slate-100 my-4"></div>
                
                <InputField icon={Briefcase} label="Ruolo" field="ruolo" />
                <InputField icon={Building2} label="Azienda" field="azienda" />
                
                <div className="h-px bg-slate-100 my-4"></div>
                
                <InputField icon={Mail} label="Email" field="email" />
                <InputField icon={Phone} label="Telefono" field="telefono" />
                <InputField icon={Globe} label="Sito Web" field="sito_web" />
                <InputField icon={MapPin} label="Indirizzo" field="indirizzo" />
             </div>
           </div>

           {imageSrc && (
             <div className="bg-white p-2 rounded-sm border border-slate-200 shadow-sm">
                <div className="bg-slate-900 px-3 py-2 mb-2 rounded-sm flex justify-between items-center">
                    <p className="text-[10px] font-bold text-white uppercase">Original Scan</p>
                    <Scan className="w-3 h-3 text-[#FFE900]" />
                </div>
                <img src={imageSrc} alt="Business Card" className="w-full h-auto object-cover rounded-sm border border-slate-100 opacity-90 hover:opacity-100 transition-opacity" />
             </div>
           )}
        </div>

        {/* Right Panel: Activity / Report */}
        <div className="lg:col-span-8">
           <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden">
             
             {/* Header Section */}
             <div className="bg-slate-900 border-b-4 border-[#FFE900] px-6 py-4 flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                   <FileText className="w-4 h-4 text-[#FFE900]" />
                   Report Visita
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-800 px-2 py-1 rounded">Internal Use Only</span>
             </div>

             <div className="p-8">
               
               {/* Products Table */}
               <div className="mb-12">
                 <div className="flex items-center gap-2 mb-4">
                     <Factory className="w-4 h-4 text-slate-400" />
                     <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Interesse Prodotti</h4>
                 </div>
                 
                 <div className="overflow-hidden border border-slate-300 rounded-sm">
                   <table className="w-full text-sm">
                     <thead>
                       <tr className="bg-slate-800 text-white">
                         <th className="p-3 text-left font-bold w-1/3 text-xs uppercase tracking-wide">Prodotto</th>
                         <th className="p-3 text-center font-bold w-1/4 text-xs uppercase tracking-wide">Cliente BS</th>
                         <th className="p-3 text-left font-bold text-xs uppercase tracking-wide">Competitor Note</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-200">
                       {formData.report?.products.map((prod, idx) => (
                         <tr key={idx} className={`hover:bg-yellow-50 transition-colors group ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                           <td className="p-3 font-bold text-slate-800 text-xs uppercase">{prod.name}</td>
                           <td className="p-3">
                             <div className="flex justify-center gap-1">
                               <button 
                                 type="button"
                                 onClick={() => handleProductChange(idx, 'clienteBS', prod.clienteBS === 'SI' ? null : 'SI')}
                                 disabled={!isEditing}
                                 className={`w-10 h-7 flex items-center justify-center text-[10px] font-bold border rounded-sm transition-all ${prod.clienteBS === 'SI' ? 'bg-[#FFE900] border-[#FFE900] text-black shadow-md scale-105' : 'bg-white border-slate-200 text-slate-300'} ${!isEditing ? 'opacity-80' : 'hover:border-slate-400'}`}
                               >SI</button>
                               <button 
                                 type="button"
                                 onClick={() => handleProductChange(idx, 'clienteBS', prod.clienteBS === 'NO' ? null : 'NO')}
                                 disabled={!isEditing}
                                 className={`w-10 h-7 flex items-center justify-center text-[10px] font-bold border rounded-sm transition-all ${prod.clienteBS === 'NO' ? 'bg-slate-800 border-slate-800 text-white shadow-md scale-105' : 'bg-white border-slate-200 text-slate-300'} ${!isEditing ? 'opacity-80' : 'hover:border-slate-400'}`}
                               >NO</button>
                             </div>
                           </td>
                           <td className="p-3">
                             <input 
                               type="text" 
                               value={prod.competitor}
                               onChange={(e) => handleProductChange(idx, 'competitor', e.target.value)}
                               disabled={!isEditing}
                               className={`w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none transition-colors ${isEditing ? 'border-b border-slate-300 focus:border-slate-800' : ''}`}
                               placeholder={isEditing ? "Brand competitor..." : ""}
                             />
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                 {/* Marketing Source */}
                 <div className="bg-slate-50 p-5 rounded-sm border border-slate-200">
                   <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Lead Source</h4>
                   <div className="space-y-2">
                     {SOURCES_LIST.map(item => (
                       <label key={item} className={`flex items-center gap-3 p-2 rounded-sm border transition-all ${formData.report?.sources.includes(item) ? 'bg-white border-[#FFE900] shadow-sm' : 'border-transparent hover:bg-slate-100'} ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}>
                         <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${formData.report?.sources.includes(item) ? 'border-[#FFE900] bg-[#FFE900]' : 'border-slate-300 bg-white'}`}
                              onClick={() => toggleListSelection('sources', item)}>
                           {formData.report?.sources.includes(item) && <CheckSquare className="w-3 h-3 text-black" />}
                         </div>
                         <span className={`text-xs font-bold ${formData.report?.sources.includes(item) ? 'text-slate-900' : 'text-slate-500'}`}>{item}</span>
                       </label>
                     ))}
                   </div>
                 </div>

                 {/* Actions Fiera */}
                 <div className="bg-slate-50 p-5 rounded-sm border border-slate-200">
                   <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Azioni Fiera</h4>
                   <div className="space-y-2">
                     {ACTIONS_FIERA_LIST.map(item => (
                       <label key={item} className={`flex items-center gap-3 p-2 rounded-sm border transition-all ${formData.report?.actionsFiera.includes(item) ? 'bg-white border-[#FFE900] shadow-sm' : 'border-transparent hover:bg-slate-100'} ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}>
                         <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${formData.report?.actionsFiera.includes(item) ? 'border-[#FFE900] bg-[#FFE900]' : 'border-slate-300 bg-white'}`}
                              onClick={() => toggleListSelection('actionsFiera', item)}>
                           {formData.report?.actionsFiera.includes(item) && <CheckSquare className="w-3 h-3 text-black" />}
                         </div>
                         <span className={`text-xs font-bold ${formData.report?.actionsFiera.includes(item) ? 'text-slate-900' : 'text-slate-500'}`}>{item}</span>
                       </label>
                     ))}
                   </div>
                 </div>
               </div>

               {/* Actions Future */}
               <div className="mb-12">
                 <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">Next Steps (Azioni Future)</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                   {ACTIONS_FUTURE_LIST.map(item => (
                     <label key={item} className={`flex items-center gap-3 p-4 rounded-sm border transition-all ${formData.report?.actionsFuture.includes(item) ? 'bg-slate-800 border-slate-800 shadow-md transform -translate-y-1' : 'bg-white border-slate-200 hover:border-slate-300'} ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                          onClick={() => toggleListSelection('actionsFuture', item)}>
                       <div className={`w-5 h-5 border rounded-sm flex items-center justify-center transition-colors shrink-0 ${formData.report?.actionsFuture.includes(item) ? 'border-[#FFE900] bg-[#FFE900]' : 'border-slate-300 bg-white'}`}>
                         {formData.report?.actionsFuture.includes(item) && <CheckSquare className="w-3.5 h-3.5 text-black" />}
                       </div>
                       <span className={`text-xs font-bold leading-tight ${formData.report?.actionsFuture.includes(item) ? 'text-white' : 'text-slate-600'}`}>{item}</span>
                     </label>
                   ))}
                 </div>
               </div>

               {/* Notes */}
               <div className="bg-yellow-50/50 p-6 rounded-sm border border-yellow-100">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <PenSquare className="w-4 h-4 text-[#FFE900]" /> Note Interne
                  </h4>
                  <textarea 
                    value={formData.note}
                    onChange={(e) => handleInputChange('note', e.target.value)}
                    disabled={!isEditing}
                    className={`w-full h-32 p-4 text-sm leading-relaxed resize-none transition-all rounded-sm font-medium ${isEditing ? 'bg-white border border-slate-300 focus:border-[#FFE900] focus:ring-1 focus:ring-[#FFE900]' : 'bg-transparent border border-transparent text-slate-800'}`}
                    placeholder={isEditing ? "Inserisci note aggiuntive sulla conversazione o dettagli tecnici..." : "Nessuna nota aggiuntiva."}
                  />
               </div>

             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
