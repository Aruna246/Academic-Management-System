import React, { useState, useEffect } from 'react';
import { Calculator, X, BookOpen, Percent, Award, Info } from 'lucide-react';

interface InternalCalculatorProps {
  onClose: () => void;
}

const InternalCalculator: React.FC<InternalCalculatorProps> = ({ onClose }) => {
  const [subject, setSubject] = useState('');
  const [type, setType] = useState<'theory' | 'both'>('theory');
  const [attendance, setAttendance] = useState<number>(0);
  const [cat1, setCat1] = useState<number>(0);
  const [cat2, setCat2] = useState<number>(0);
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    // Logic: Convert Attendance to 5 marks
    const attendanceScore = (attendance / 100) * 5;
    
    let internal = 0;
    if (type === 'theory') {
      // Theory: CAT 1 (17.5) + CAT 2 (17.5) + Attendance (5) = 40
      const c1 = (cat1 / 100) * 17.5;
      const c2 = (cat2 / 100) * 17.5;
      internal = c1 + c2 + attendanceScore;
    } else {
      // Theory + Lab: CAT 1 (22.5) + CAT 2 (22.5) + Attendance (5) = 50
      const c1 = (cat1 / 100) * 22.5;
      const c2 = (cat2 / 100) * 22.5;
      internal = c1 + c2 + attendanceScore;
    }
    
    setResult(Number(internal.toFixed(2)));
  }, [attendance, cat1, cat2, type]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300 border border-slate-200">
        <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Internal Calculator</h2>
              <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Academic Mark Converter</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Course Registry</label>
              <div className="relative">
                 <BookOpen className="absolute left-5 top-5 h-4 w-4 text-slate-400" />
                 <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Enter Subject Name" className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-indigo-600 outline-none transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Module Structure</label>
              <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                <button onClick={()=>setType('theory')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${type === 'theory' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Theory (40)</button>
                <button onClick={()=>setType('both')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${type === 'both' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Theory + Lab (50)</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Attendance %</label>
                  <div className="relative">
                    <Percent className="absolute left-5 top-4 h-4 w-4 text-slate-400" />
                    <input type="number" value={attendance || ''} onChange={e=>setAttendance(Number(e.target.value))} placeholder="0" className="w-full pl-14 pr-6 py-3 bg-slate-50 rounded-2xl font-black text-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">CAT 1 (/100)</label>
                    <input type="number" value={cat1 || ''} onChange={e=>setCat1(Number(e.target.value))} placeholder="0" className="w-full p-3 bg-slate-50 rounded-2xl font-black text-lg outline-none focus:ring-2 focus:ring-indigo-500 text-center" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">CAT 2 (/100)</label>
                    <input type="number" value={cat2 || ''} onChange={e=>setCat2(Number(e.target.value))} placeholder="0" className="w-full p-3 bg-slate-50 rounded-2xl font-black text-lg outline-none focus:ring-2 focus:ring-indigo-500 text-center" />
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden border border-slate-100">
             <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12"><Award className="h-32 w-32" /></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Calculated Internal</p>
             <div className="relative">
                <h3 className="text-8xl font-black text-slate-900 tracking-tighter tabular-nums">{result}</h3>
                <span className="absolute -right-10 top-0 text-indigo-600 font-black text-xl">/{type === 'theory' ? '40' : '50'}</span>
             </div>
             <div className="mt-10 flex items-center gap-2 bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm">
                <Info className="h-3 w-3 text-indigo-600" />
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Formula: Attd + (Scaled CAT 1 & 2)</span>
             </div>
          </div>
        </div>

        <div className="bg-slate-50 px-10 py-6 text-center border-t">
           <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em]">Institutional Mark Conversion System</p>
        </div>
      </div>
    </div>
  );
};

export default InternalCalculator;