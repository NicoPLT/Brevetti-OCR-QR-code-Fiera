import React, { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === 'brevetti') {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-none border-l-8 border-[#FFE900] shadow-2xl overflow-hidden">
        <div className="bg-slate-800 p-8 text-center">
           <h1 className="text-3xl font-black text-[#FFE900] tracking-tighter uppercase mb-1">
             Brevetti Stendalto
           </h1>
           <p className="text-xs text-white tracking-[0.3em] font-bold uppercase opacity-80">
             Energy in Motion
           </p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 uppercase mb-2">Codice Accesso</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  className="block w-full pl-10 pr-3 py-3 border-2 border-slate-200 focus:border-[#FFE900] focus:ring-0 outline-none transition-colors bg-slate-50 font-mono text-lg"
                  placeholder="Inserisci password..."
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 font-bold animate-pulse">
                  Codice errato. Riprova.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#FFE900] text-slate-900 font-black uppercase py-4 hover:bg-[#E6D200] transition-colors flex items-center justify-center gap-2 group"
            >
              Accedi al CRM
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
      <p className="mt-8 text-slate-500 text-xs">Internal Use Only &bull; v2.0.0</p>
    </div>
  );
};

export default LoginScreen;
