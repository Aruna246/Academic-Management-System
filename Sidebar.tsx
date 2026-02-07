import React, { useState } from 'react';
import { DepartmentStructure } from '../types'; // Path fixed from ../college-ams/src/types to ../types
import { 
  ChevronDown, ChevronRight, School, User, LayoutGrid, KeyRound, 
  ArrowRight, Calculator
} from 'lucide-react';

interface SidebarProps {
  departments: DepartmentStructure[];
  onSelectView: (view: 'dashboard' | 'hod' | 'admin', deptId?: string) => void;
  onRoleSelect: (role: string, context: { deptId: string, yearId: string, section: string }) => void;
  onOpenCalculator: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ departments, onSelectView, onRoleSelect, onOpenCalculator }) => {
  const [openDept, setOpenDept] = useState<string | null>('cse');
  const [openYear, setOpenYear] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleDept = (id: string) => {
    setOpenDept(openDept === id ? null : id);
    setOpenYear(null);
    setOpenSection(null);
  };

  const toggleYear = (yearId: string, deptId: string, name: string) => {
    if (name === 'HOD') {
      onSelectView('hod', deptId);
    } else {
      setOpenYear(openYear === yearId ? null : yearId);
      setOpenSection(null);
    }
  };

  const toggleSection = (sectionName: string) => {
    setOpenSection(openSection === sectionName ? null : sectionName);
  };

  const handleRoleClick = (role: string, deptId: string, yearId: string, section: string) => {
    const dept = departments.find(d => d.id === deptId);
    const subModule = dept?.subModules.find(s => s.id === yearId);
    const yearName = subModule?.name || yearId;
    onRoleSelect(role, { deptId, yearId: yearName, section });
  };

  return (
    <aside className="w-72 bg-slate-900 text-white min-h-screen overflow-y-auto flex-shrink-0 hidden md:flex flex-col border-r border-slate-800">
      <div className="p-8 border-b border-slate-800 flex items-center gap-4">
        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <School className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-tighter">Academic Units</h2>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Institutional Registry</p>
        </div>
      </div>

      {/* Internal Calculator Link */}
      <div className="px-4 pt-6">
        <button 
          onClick={onOpenCalculator}
          className="w-full flex items-center gap-4 p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl hover:bg-indigo-600 transition-all group"
        >
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-white group-hover:text-indigo-600 transition-colors">
            <Calculator className="h-4 w-4" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-black uppercase tracking-widest">Internal Calculator</span>
            <span className="text-[8px] font-bold text-indigo-400 group-hover:text-white/70 uppercase">Convert CAT Marks</span>
          </div>
        </button>
      </div>

      <nav className="p-4 flex-1 space-y-4 py-8">
        {departments.map((dept) => (
          <div key={dept.id} className="space-y-2">
            <button
              onClick={() => toggleDept(dept.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                openDept === dept.id 
                  ? 'bg-slate-800 text-white shadow-xl ring-1 ring-slate-700' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <School className={`h-5 w-5 transition-colors ${openDept === dept.id ? 'text-indigo-400' : 'text-slate-600'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-left">{dept.name.length > 20 ? dept.name.substring(0, 18) + '..' : dept.name}</span>
              </div>
              {openDept === dept.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4 opacity-30" />}
            </button>

            {openDept === dept.id && (
              <div className="ml-6 space-y-1 border-l border-slate-800 pl-4 py-2">
                {dept.subModules.map((sub) => (
                  <div key={sub.id} className="space-y-1">
                    <button
                      onClick={() => toggleYear(sub.id, dept.id, sub.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        openYear === sub.id ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                         {sub.name === 'HOD' ? <User className="h-4 w-4 text-orange-400" /> : <div className={`h-1.5 w-1.5 rounded-full ${openYear === sub.id ? 'bg-indigo-400' : 'bg-slate-700'}`} />}
                         {sub.name}
                      </span>
                      {sub.name !== 'HOD' && sub.sections && sub.sections.length > 0 ? (
                        openYear === sub.id ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3 opacity-30" />
                      ) : (
                        sub.name === 'HOD' && <ArrowRight className="h-3 w-3 opacity-30" />
                      )}
                    </button>

                    {openYear === sub.id && sub.name !== 'HOD' && sub.sections && (
                      <div className="ml-6 mt-1 space-y-1 border-l border-slate-800/50 pl-4 py-1">
                        {sub.sections.map((sec) => (
                          <div key={sec} className="space-y-1">
                            <button 
                              onClick={() => toggleSection(sec)}
                              className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                                openSection === sec ? 'text-white bg-slate-800' : 'text-slate-600 hover:text-slate-400'
                              }`}
                            >
                               <span className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                  <LayoutGrid className="h-3.5 w-3.5 opacity-50" />
                                  {sec}
                               </span>
                               {openSection === sec ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3 opacity-20" />}
                            </button>

                            {openSection === sec && (
                              <div className="ml-6 mt-2 space-y-1">
                                {[
                                  { label: 'Faculty Advisor', color: 'text-emerald-400' },
                                  { label: 'Staff', color: 'text-indigo-400' },
                                  { label: 'Student', color: 'text-sky-400' }
                                ].map((role) => (
                                  <button 
                                    key={role.label}
                                    onClick={() => handleRoleClick(role.label, dept.id, sub.id, sec)}
                                    className="w-full flex items-center gap-3 p-2 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white cursor-pointer group transition-all"
                                  >
                                    <KeyRound className={`h-3 w-3 opacity-30 group-hover:opacity-100 ${role.color}`} />
                                    {role.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="p-8 border-t border-slate-800 text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] text-center">
        Secure Terminal Access
      </div>
    </aside>
  );
};

export default Sidebar;