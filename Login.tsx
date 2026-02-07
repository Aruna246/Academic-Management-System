
import React, { useState } from 'react';
import { Lock, Mail, ChevronRight, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@gmail.com' && password === '12345') {
      onLogin(email);
    } else {
      setError('Login Failed');
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-8 bg-gray-50 min-h-[600px]">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-indigo-50">
        <div className="bg-indigo-600 p-10 text-center">
          <div className="mx-auto bg-indigo-500 w-16 h-16 rounded-3xl flex items-center justify-center mb-4">
             <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-1 uppercase tracking-tighter">Login Access</h1>
          <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Administrative Authentication</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Enter Identity"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Passkey</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Enter Passkey"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-rose-600 text-[10px] font-black uppercase tracking-widest bg-rose-50 p-4 rounded-xl text-center border border-rose-100">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl uppercase text-xs tracking-widest active:scale-95"
          >
            Authorize Session <ChevronRight className="h-4 w-4" />
          </button>
        </form>
        <div className="bg-slate-50 px-10 py-6 text-center text-[9px] font-black uppercase tracking-widest text-slate-400">
           Restricted access portal. Log out after every session.
        </div>
      </div>
    </div>
  );
};

export default Login;
