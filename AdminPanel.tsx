import React, { useState } from 'react';
import { DepartmentStructure, FacultyAdvisorAccount, StaffAssignment, TimeTableEntry, HODAccount, SystemConfig, Student, AcademicArchive } from '../types';
import { 
  Trash2, Plus, School, 
  Settings, Layers,
  X, UserCircle, UserPlus, Upload,
  CalendarDays, History, Archive, RefreshCw, Eye, ShieldCheck, Database, Search, UserMinus,
  ArrowRight, CheckCircle, Save, ChevronRight, LayoutGrid, Briefcase, GraduationCap, Mail
} from 'lucide-react';

interface AdminPanelProps {
  departments: DepartmentStructure[];
  setDepartments: React.Dispatch<React.SetStateAction<DepartmentStructure[]>>;
  facultyAdvisors: FacultyAdvisorAccount[];
  setFacultyAdvisors: React.Dispatch<React.SetStateAction<FacultyAdvisorAccount[]>>;
  hodAccounts: HODAccount[];
  setHodAccounts: React.Dispatch<React.SetStateAction<HODAccount[]>>;
  staffAssignments: StaffAssignment[];
  setStaffAssignments: React.Dispatch<React.SetStateAction<StaffAssignment[]>>;
  timeTables: TimeTableEntry[];
  setTimeTables: React.Dispatch<React.SetStateAction<TimeTableEntry[]>>;
  config: SystemConfig;
  setConfig: React.Dispatch<React.SetStateAction<SystemConfig>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  archives: AcademicArchive[];
  onInitializeNewCycle: (year: string, sem: '1st' | '2nd') => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  departments, 
  setDepartments, 
  facultyAdvisors,
  setFacultyAdvisors,
  hodAccounts,
  setHodAccounts,
  staffAssignments,
  setStaffAssignments,
  config,
  setConfig,
  archives,
  onInitializeNewCycle,
  students
}) => {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'accounts' | 'progression' | 'achieves' | 'system'>('hierarchy');
  
  
  const [newDeptName, setNewDeptName] = useState('');
  const [newYearName, setNewYearName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);

  
  const [hodForm, setHodForm] = useState({ name: '', email: '', pass: '', dept: '' });
  const [faForm, setFaForm] = useState({ name: '', email: '', pass: '', dept: '', year: '', sec: '' });

  
  const [targetYear, setTargetYear] = useState(config.currentYear);
  const [targetSem, setTargetSem] = useState<'1st' | '2nd'>(config.currentSemester === '1st' ? '2nd' : '1st');

  
  const [selectedArchive, setSelectedArchive] = useState<AcademicArchive | null>(null);
  const [drillDeptId, setDrillDeptId] = useState<string | null>(null);

  
  const handleAddDept = () => {
    if (!newDeptName) return;
    const id = newDeptName.toLowerCase().replace(/\s+/g, '-');
    const newDepartment: DepartmentStructure = { 
      id, 
      name: newDeptName, 
      subModules: [{ id: `${id}-hod`, name: 'HOD' }] 
    };
    setDepartments([...departments, newDepartment]);
    setNewDeptName('');
  };

  const handleAddYear = (deptId: string) => {
    if (!newYearName) return;
    setDepartments(prev => prev.map(d => d.id === deptId ? {
      ...d, 
      subModules: [...d.subModules, { id: `${deptId}-y-${Date.now()}`, name: newYearName, sections: [] }]
    } : d));
    setNewYearName('');
  };

  const handleAddSection = (deptId: string, yearId: string) => {
    if (!newSectionName) return;
    setDepartments(prev => prev.map(d => d.id === deptId ? {
      ...d,
      subModules: d.subModules.map(sm => sm.id === yearId ? {
        ...sm, sections: [...(sm.sections || []), newSectionName]
      } : sm)
    } : d));
    setNewSectionName('');
  };

  const deleteDept = (id: string) => setDepartments(prev => prev.filter(d => d.id !== id));
  const deleteYear = (deptId: string, yearId: string) => setDepartments(prev => prev.map(d => d.id === deptId ? { ...d, subModules: d.subModules.filter(sm => sm.id !== yearId) } : d));
  const deleteSection = (deptId: string, yearId: string, sec: string) => setDepartments(prev => prev.map(d => d.id === deptId ? { ...d, subModules: d.subModules.map(sm => sm.id === yearId ? { ...sm, sections: (sm.sections || []).filter(s => s !== sec) } : sm) } : d));

  
  const handleAddHOD = (e: React.FormEvent) => {
    e.preventDefault();
    const newHOD: HODAccount = { id: hodForm.email || `hod-${Date.now()}`, name: hodForm.name, email: hodForm.email, password: hodForm.pass, deptId: hodForm.dept };
    setHodAccounts([...hodAccounts, newHOD]);
    setHodForm({ name: '', email: '', pass: '', dept: '' });
  };

  const deleteHOD = (email: string) => {
    if (window.confirm("Revoke HOD access for this account?")) {
      setHodAccounts(prev => prev.filter(h => h.email !== email));
    }
  };

  const handleAddFA = (e: React.FormEvent) => {
    e.preventDefault();
    const newFA: FacultyAdvisorAccount = { id: faForm.email || `fa-${Date.now()}`, name: faForm.name, email: faForm.email, password: faForm.pass, deptId: faForm.dept, yearId: faForm.year, section: faForm.sec };
    setFacultyAdvisors([...facultyAdvisors, newFA]);
    setFaForm({ name: '', email: '', pass: '', dept: '', year: '', sec: '' });
  };

  const deleteFA = (email: string) => {
    if (window.confirm("Revoke Faculty Advisor access?")) {
      setFacultyAdvisors(prev => prev.filter(fa => fa.email !== email));
    }
  };

  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoLeft' | 'logoRight') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setConfig(prev => ({ ...prev, [field]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8 lg:p-12 space-y-10 min-h-screen bg-slate-50">
      
      {/* Navigation Tabs */}
      <div className="flex bg-white rounded-3xl p-2 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-slate-200 flex-wrap gap-2 max-w-fit mx-auto lg:mx-0 sticky top-4 z-40 backdrop-blur-xl">
         {[
           { id: 'hierarchy', label: 'Unit Hierarchy', icon: Layers, color: 'text-indigo-600' },
           { id: 'accounts', label: 'Auth Registry', icon: UserCircle, color: 'text-emerald-600' },
           { id: 'progression', label: 'Progression Engine', icon: RefreshCw, color: 'text-amber-600' },
           { id: 'achieves', label: 'Vault Achieves', icon: History, color: 'text-rose-600' },
           { id: 'system', label: 'System Control', icon: Settings, color: 'text-slate-600' }
         ].map((tab) => (
           <button 
             key={tab.id}
             onClick={() => { setActiveTab(tab.id as any); setSelectedArchive(null); }}
             className={`flex items-center gap-4 px-8 py-4 rounded-[1.4rem] text-[10px] font-black uppercase tracking-[0.1em] transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-2xl scale-105' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
           >
             <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-white' : tab.color}`} /> {tab.label}
           </button>
         ))}
      </div>

      {/* Hierarchy Tab (Unchanged) */}
      {activeTab === 'hierarchy' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 h-fit">
              <h3 className="text-xl font-black uppercase mb-10 flex items-center gap-4"><School className="h-7 w-7 text-indigo-600" /> Departments</h3>
              <div className="flex gap-3 mb-10">
                 <input value={newDeptName} onChange={e=>setNewDeptName(e.target.value)} placeholder="Dept Name" className="flex-1 p-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-bold focus:border-indigo-600 outline-none shadow-inner" />
                 <button onClick={handleAddDept} className="p-5 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-indigo-600 transition-all active:scale-95"><Plus className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                 {departments.map(d => (
                    <div key={d.id} onClick={() => { setSelectedDeptId(d.id); setSelectedYearId(null); }} className={`p-6 rounded-[2rem] flex justify-between items-center cursor-pointer transition-all ${selectedDeptId === d.id ? 'bg-indigo-600 text-white shadow-2xl translate-x-2' : 'bg-slate-50 hover:bg-white border border-transparent hover:border-indigo-100'}`}>
                       <span className="font-black uppercase text-xs tracking-tight">{d.name}</span>
                       <button onClick={(e) => { e.stopPropagation(); deleteDept(d.id); }} className={`${selectedDeptId === d.id ? 'text-white/50 hover:text-white' : 'text-rose-400'} p-1 transition-colors`}><Trash2 className="h-4 w-4" /></button>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 h-fit">
              <h3 className="text-xl font-black uppercase mb-10 flex items-center gap-4"><CalendarDays className="h-7 w-7 text-indigo-600" /> Academic Years</h3>
              {!selectedDeptId ? (
                <div className="py-24 text-center opacity-30 font-black uppercase text-[10px] tracking-[0.4em] flex flex-col items-center gap-4">
                  <ChevronRight className="h-10 w-10 animate-pulse" />
                  Select Unit First
                </div>
              ) : (
                <>
                  <div className="flex gap-3 mb-10">
                     <input value={newYearName} onChange={e=>setNewYearName(e.target.value)} placeholder="Year Name" className="flex-1 p-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-bold focus:border-indigo-600 outline-none shadow-inner" />
                     <button onClick={() => handleAddYear(selectedDeptId)} className="p-5 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-indigo-600 transition-all active:scale-95"><Plus className="h-5 w-5" /></button>
                  </div>
                  <div className="space-y-4">
                     {departments.find(d=>d.id===selectedDeptId)?.subModules.filter(sm=>sm.name!=='HOD').map(sm => (
                        <div key={sm.id} onClick={() => setSelectedYearId(sm.id)} className={`p-6 rounded-[2rem] flex justify-between items-center cursor-pointer transition-all ${selectedYearId === sm.id ? 'bg-indigo-600 text-white shadow-2xl translate-x-2' : 'bg-slate-50 hover:bg-white border border-transparent hover:border-indigo-100'}`}>
                           <span className="font-black uppercase text-xs tracking-tight">{sm.name}</span>
                           <button onClick={(e) => { e.stopPropagation(); deleteYear(selectedDeptId, sm.id); }} className={`${selectedYearId === sm.id ? 'text-white/50 hover:text-white' : 'text-rose-400'} p-1 transition-colors`}><Trash2 className="h-4 w-4" /></button>
                        </div>
                     ))}
                  </div>
                </>
              )}
           </div>

           <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 h-fit">
              <h3 className="text-xl font-black uppercase mb-10 flex items-center gap-4"><LayoutGrid className="h-7 w-7 text-indigo-600" /> Sections</h3>
              {!selectedYearId ? (
                <div className="py-24 text-center opacity-30 font-black uppercase text-[10px] tracking-[0.4em] flex flex-col items-center gap-4">
                  <ChevronRight className="h-10 w-10 animate-pulse" />
                  Select Year First
                </div>
              ) : (
                <>
                  <div className="flex gap-3 mb-10">
                     <input value={newSectionName} onChange={e=>setNewSectionName(e.target.value)} placeholder="Sec Name" className="flex-1 p-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-bold focus:border-indigo-600 outline-none shadow-inner" />
                     <button onClick={() => handleAddSection(selectedDeptId!, selectedYearId)} className="p-5 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-indigo-600 transition-all active:scale-95"><Plus className="h-5 w-5" /></button>
                  </div>
                  <div className="space-y-4">
                     {departments.find(d=>d.id===selectedDeptId)?.subModules.find(sm=>sm.id===selectedYearId)?.sections?.map(sec => (
                        <div key={sec} className="p-6 bg-slate-50 rounded-[2rem] flex justify-between items-center border border-transparent hover:border-indigo-100 hover:bg-white transition-all hover:shadow-lg">
                           <span className="font-black uppercase text-xs tracking-tight">{sec}</span>
                           <button onClick={() => deleteSection(selectedDeptId!, selectedYearId, sec)} className="text-rose-400 hover:text-rose-600 p-1 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </div>
                     ))}
                  </div>
                </>
              )}
           </div>
        </div>
      )}

      {/* Auth Registry Tab (UPDATED with List and Delete) */}
      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
           
           {/* HOD Management */}
           <div className="space-y-10">
              <div className="bg-white p-10 lg:p-12 rounded-[4rem] shadow-2xl border border-slate-100">
                 <h3 className="text-2xl font-black uppercase mb-10 flex items-center gap-5"><ShieldCheck className="h-9 w-9 text-indigo-600" /> Appoint Department Head</h3>
                 <form onSubmit={handleAddHOD} className="space-y-5">
                    <input value={hodForm.name} onChange={e=>setHodForm({...hodForm, name: e.target.value})} placeholder="Full Professional Name" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-indigo-600 outline-none shadow-inner" required />
                    <input value={hodForm.email} onChange={e=>setHodForm({...hodForm, email: e.target.value})} placeholder="Official Identity ID" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-indigo-600 outline-none shadow-inner" required />
                    <input value={hodForm.pass} onChange={e=>setHodForm({...hodForm, pass: e.target.value})} type="password" placeholder="Terminal Passkey" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-indigo-600 outline-none shadow-inner" required />
                    <select value={hodForm.dept} onChange={e=>setHodForm({...hodForm, dept: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black text-xs uppercase cursor-pointer" required>
                       <option value="">Grant Dept Privilege</option>
                       {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <button className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-xl hover:bg-indigo-600 transition-all">Confirm Appointment</button>
                 </form>

                 {/* HOD List */}
                 <div className="mt-12 space-y-4 pt-10 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Active HOD Registry</h4>
                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
                       {hodAccounts.map(h => (
                          <div key={h.email} className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center group">
                             <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xs">
                                   <Briefcase className="h-5 w-5" />
                                </div>
                                <div>
                                   <p className="font-black text-slate-800 text-xs uppercase leading-none">{h.name}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Dept: {h.deptId}</p>
                                </div>
                             </div>
                             <button onClick={() => deleteHOD(h.email)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                          </div>
                       ))}
                       {hodAccounts.length === 0 && <p className="text-center py-10 opacity-20 font-black uppercase text-[10px]">No HOD Appointed</p>}
                    </div>
                 </div>
              </div>
           </div>
           
           {/* Faculty Advisor Management */}
           <div className="space-y-10">
              <div className="bg-white p-10 lg:p-12 rounded-[4rem] shadow-2xl border border-slate-100">
                 <h3 className="text-2xl font-black uppercase mb-10 flex items-center gap-5"><UserPlus className="h-9 w-9 text-emerald-600" /> Appoint Faculty Advisor</h3>
                 <form onSubmit={handleAddFA} className="space-y-5">
                    <input value={faForm.name} onChange={e=>setFaForm({...faForm, name: e.target.value})} placeholder="Faculty Name" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-emerald-600 outline-none shadow-inner" required />
                    <input value={faForm.email} onChange={e=>setFaForm({...faForm, email: e.target.value})} placeholder="Institutional ID" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-emerald-600 outline-none shadow-inner" required />
                    <input value={faForm.pass} onChange={e=>setFaForm({...faForm, pass: e.target.value})} type="password" placeholder="Passkey" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-emerald-600 outline-none shadow-inner" required />
                    <div className="grid grid-cols-2 gap-4">
                       <select value={faForm.dept} onChange={e=>setFaForm({...faForm, dept: e.target.value})} className="p-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase" required>
                          <option value="">Dept</option>
                          {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                       </select>
                       <select value={faForm.year} onChange={e=>setFaForm({...faForm, year: e.target.value})} className="p-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase" required>
                          <option value="">Year</option>
                          {departments.find(d=>d.id===faForm.dept)?.subModules.filter(sm=>sm.name!=='HOD').map(sm=><option key={sm.id} value={sm.name}>{sm.name}</option>)}
                       </select>
                    </div>
                    <select value={faForm.sec} onChange={e=>setFaForm({...faForm, sec: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black text-[10px] uppercase cursor-pointer" required>
                       <option value="">Authorize Section Control</option>
                       {departments.find(d=>d.id===faForm.dept)?.subModules.find(sm=>sm.name===faForm.year)?.sections?.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-xl hover:bg-slate-900 transition-all">Confirm Appointment</button>
                 </form>

                 {/* Faculty Advisor List */}
                 <div className="mt-12 space-y-4 pt-10 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Active Advisor Registry</h4>
                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
                       {facultyAdvisors.map(fa => (
                          <div key={fa.email} className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center group">
                             <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-xs">
                                   <GraduationCap className="h-5 w-5" />
                                </div>
                                <div>
                                   <p className="font-black text-slate-800 text-xs uppercase leading-none">{fa.name}</p>
                                   <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{fa.yearId} • {fa.section}</p>
                                </div>
                             </div>
                             <button onClick={() => deleteFA(fa.email)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                          </div>
                       ))}
                       {facultyAdvisors.length === 0 && <p className="text-center py-10 opacity-20 font-black uppercase text-[10px]">No Advisor Appointed</p>}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Progression Engine Tab (Unchanged) */}
      {activeTab === 'progression' && (
        <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-700">
           <div className="bg-white p-16 rounded-[5rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-slate-100 text-center space-y-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-20 opacity-[0.03] rotate-12 pointer-events-none"><RefreshCw className="h-64 w-64" /></div>
              <div className="h-24 w-24 bg-amber-50 text-amber-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner"><RefreshCw className="h-12 w-12" /></div>
              <div className="space-y-4">
                 <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Academic Progression</h3>
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] max-w-lg mx-auto leading-relaxed">Transition the institution to a new term.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Next Session Year</label>
                    <input value={targetYear} onChange={e=>setTargetYear(e.target.value)} placeholder="e.g. 2026-2027" className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2.5rem] font-black text-3xl outline-none focus:border-amber-600 shadow-inner" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Target Term Cycle</label>
                    <div className="flex bg-slate-100 p-2 rounded-[2.5rem] shadow-inner">
                       <button onClick={()=>setTargetSem('1st')} className={`flex-1 py-5 rounded-[2rem] font-black uppercase text-[10px] transition-all ${targetSem === '1st' ? 'bg-white text-amber-600 shadow-xl' : 'text-slate-400'}`}>1st Semester</button>
                       <button onClick={()=>setTargetSem('2nd')} className={`flex-1 py-5 rounded-[2rem] font-black uppercase text-[10px] transition-all ${targetSem === '2nd' ? 'bg-white text-amber-600 shadow-xl' : 'text-slate-400'}`}>2nd Semester</button>
                    </div>
                 </div>
              </div>
              <button onClick={() => onInitializeNewCycle(targetYear, targetSem)} className="w-full py-8 bg-slate-900 text-white rounded-[3rem] font-black uppercase text-xs tracking-[0.5em] shadow-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-4"><ArrowRight className="h-6 w-6" /> Initialize New Cycle</button>
           </div>
        </div>
      )}

      {/* Vault Achieves Tab (Unchanged) */}
      {activeTab === 'achieves' && (
        <div className="space-y-12 animate-in fade-in duration-700">
           {!selectedArchive ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                 {archives.map((arc, i) => (
                    <button key={i} onClick={() => setSelectedArchive(arc)} className="group p-12 bg-white border border-slate-100 rounded-[4rem] hover:shadow-2xl transition-all text-left relative overflow-hidden">
                       <h4 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{arc.year}</h4>
                       <p className="text-rose-500 font-black uppercase text-[10px] tracking-widest mt-3">{arc.semester} Sem Snapshot</p>
                    </button>
                 ))}
                 {archives.length === 0 && (
                    <div className="col-span-full py-48 text-center opacity-10 font-black uppercase tracking-[0.6em] flex flex-col items-center gap-8"><Database className="h-32 w-32" /><p className="text-xl">Institutional Vault is Empty</p></div>
                 )}
              </div>
           ) : (
              <div className="bg-white p-14 rounded-[5rem] shadow-2xl border border-slate-100">
                 <button onClick={() => { setSelectedArchive(null); setDrillDeptId(null); }} className="p-5 bg-slate-100 rounded-full hover:bg-slate-200 transition-all mb-10"><X className="h-6 w-6" /></button>
                 <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Vault Access: {selectedArchive.year}</h3>
                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mt-10">
                    <div className="space-y-4">
                       {selectedArchive.data.departments.map(d => (
                          <button key={d.id} onClick={() => setDrillDeptId(d.id)} className={`w-full p-6 rounded-3xl text-[10px] font-black uppercase text-left transition-all ${drillDeptId === d.id ? 'bg-rose-600 text-white shadow-2xl' : 'bg-slate-50'}`}>{d.name}</button>
                       ))}
                    </div>
                    {drillDeptId && (
                       <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                          {selectedArchive.data.departments.find(d=>d.id===drillDeptId)?.subModules.filter(sm=>sm.name!=='HOD').map(sm => (
                             <div key={sm.id} className="p-10 bg-slate-50 rounded-[3.5rem] border border-slate-100">
                                <h4 className="font-black text-slate-900 text-xl uppercase mb-6">{sm.name}</h4>
                                {sm.sections?.map(sec => {
                                   const count = selectedArchive.data.students.filter(s => s.department.toLowerCase() === drillDeptId.toLowerCase() && s.year === sm.name && s.section === sec).length;
                                   return (
                                      <div key={sec} className="flex justify-between items-center p-4 bg-white rounded-2xl mb-2"><span className="text-[10px] font-black uppercase text-slate-500">{sec}</span><span className="text-xs font-black text-rose-600">{count} Enrolled</span></div>
                                   );
                                })}
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
              </div>
           )}
        </div>
      )}

      {/* System Control Tab (UPDATED: Only College Name and Left Logo) */}
      {activeTab === 'system' && (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
           <div className="bg-white p-16 rounded-[5rem] shadow-2xl border border-slate-100 space-y-16">
              <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tight">System Configuration</h3>
              
              {/* Institution Name */}
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-8">Institution Name</label>
                 <input 
                    value={config.collegeName} 
                    onChange={e=>setConfig({...config, collegeName: e.target.value})} 
                    className="w-full p-12 bg-slate-50 border-2 border-transparent rounded-[3.5rem] font-black text-slate-800 text-3xl outline-none focus:border-indigo-600 shadow-inner" 
                    placeholder="Enter College Name"
                 />
              </div>

              {/* Only Left Logo Upload */}
              <div className="p-16 border-4 border-dashed border-slate-100 rounded-[4.5rem] flex flex-col items-center gap-10">
                 <div className="h-48 w-48 bg-white rounded-full shadow-2xl border-8 border-slate-50 overflow-hidden flex items-center justify-center">
                    {config.logoLeft ? <img src={config.logoLeft} className="h-full w-full object-contain p-6" /> : <Upload className="h-14 w-14 text-slate-200" />}
                 </div>
                 <input type="file" accept="image/*" onChange={e => handleLogoUpload(e, 'logoLeft')} className="hidden" id="logoL" />
                 <label htmlFor="logoL" className="px-12 py-6 bg-slate-900 text-white rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.3em] cursor-pointer hover:bg-indigo-600 transition-all shadow-xl">Update Institutional Logo</label>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Supports JPG, PNG format</p>
              </div>

              <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100 flex items-center gap-4">
                 <ShieldCheck className="h-6 w-6 text-indigo-600" />
                 <p className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest leading-relaxed">Changes to identity and logo are global and persistent.</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;