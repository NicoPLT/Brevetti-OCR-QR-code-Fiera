
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md shadow-2xl rounded-sm border-t-8 border-[#FFE900]">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 p-3 rounded-full shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-slate-900 uppercase mb-2">{title}</h3>
              <p className="text-slate-600 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold uppercase text-xs hover:bg-slate-100 transition-colors rounded-sm"
          >
            Annulla
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white font-bold uppercase text-xs hover:bg-red-700 transition-colors shadow-sm rounded-sm"
          >
            Elimina Definitivamente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
