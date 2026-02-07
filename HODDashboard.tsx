import React, { useState, useMemo } from 'react';
import { StaffAssignment, DepartmentStructure, Student, TimeTableEntry } from '../types';
import { 
  Users, Trash2, Activity, UserPlus, ShieldCheck, 
  BarChart3, Target, Calendar, Clock, Plus, Monitor, Layout, Briefcase, 
  Award, CheckCircle2, UserCheck, CalendarDays, Filter, School, LayoutGrid
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

interface HODDashboardProps {
  department: DepartmentStructure;
  staffAssignments: StaffAssignment[];
  setStaffAssignments: React.Dispatch<React.SetStateAction<StaffAssignment[]>>;
  students: Student[];
  timeTables: TimeTableEntry[];
  departments: DepartmentStructure[];
}

const HODDashboard: React.FC<HODDashboardProps> = ({ 
  department, 
  staffAssignments,
  setStaffAssignments,
  students,
  timeTables,
  departments
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'allocate' | 'schedules' | 'staff_attendance'>('overview');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // --- SCHEDULE VIEW STATE (Year & Section Selectors) ---
  const [viewYear, setViewYear] = useState('I Year');
  const [viewSection, setViewSection] = useState('Section A');

  // --- ALLOCATION FORM STATE ---
  const [sName, setSName] = useState('');
  const [sEmail, setSEmail] = useState(''); 
  const [sPass, setSPass] = useState('');
  const [sSubCode, setSSubCode] = useState('');
  const [sSubName, setSSubName] = useState('');
  const [sDept, setSDept] = useState(department.id); 
  const [sYear, setSYear] = useState('I Year');
  const [sSec, setSSec] = useState('Section A');
  const [sSemester, setSSemester] = useState('1st Semester');

  // Filter students belonging to this department
  const myDeptStudents = useMemo(() => students.filter(s => 
    s.department.toLowerCase() === department.id.toLowerCase() || s.department === department.name
  ), [students, department]);

  // 1. OVERVIEW DATA (Preserved logic)
  const resultStats = useMemo(() => {
    const studentsWithRes = myDeptStudents.filter(s => s.semesterResultDetailed && s.semesterResultDetailed.subjects.length > 0);
    const gradeCounts: Record<string, number> = { 'O': 0, 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'U': 0, 'RA': 0 };
    let passCount = 0;
    let arrearCount = 0;

    studentsWithRes.forEach(s => {
      s.semesterResultDetailed?.subjects.forEach(sub => {
        if (gradeCounts[sub.grade] !== undefined) gradeCounts[sub.grade]++;
        if (sub.grade === 'RA' || sub.grade === 'U') arrearCount++;
        else passCount++;
      });
    });

    return {
      gradeData: Object.keys(gradeCounts).map(key => ({ name: key, count: gradeCounts[key] })),
      passArrearData: [
        { name: 'Pass Subjects', value: passCount, color: '#10b981' },
        { name: 'Arrear Subjects', value: arrearCount, color: '#ef4444' }
      ].filter(d => d.value > 0)
    };
  }, [myDeptStudents]);

  const yearWiseStats = useMemo(() => {
    const years = ['I Year', 'II Year', 'III Year', 'IV Year'];
    return years.map(yr => ({ name: yr, students: myDeptStudents.filter(s => s.year === yr).length }));
  }, [myDeptStudents]);

  const uniqueStaffList = useMemo(() => {
    const deptStaff = staffAssignments.filter(s => s.departmentId.toLowerCase() === department.id.toLowerCase());
    const unique = [];
    const map = new Map();
    for (const item of deptStaff) {
      if(!map.has(item.staffName.toLowerCase())){
          map.set(item.staffName.toLowerCase(), true);
          unique.push({ name: item.staffName, id: item.email });
      }
    }
    return unique;
  }, [staffAssignments, department.id]);

  // --- 2. SCHEDULE SYNC LOGIC (FIXED) ---
  const activeTimetable = useMemo(() => {
    // Exact matching logic with normalized strings
    return timeTables.find(t => 
      t.departmentId.toLowerCase().trim() === department.id.toLowerCase().trim() && 
      t.year === viewYear && 
      t.section === viewSection
    );
  }, [timeTables, department.id, viewYear, viewSection]);

  const getFacultyForPeriod = (subName: string) => {
    if (!subName || subName === '—' || subName === '') return null;
    const match = staffAssignments.find(sa => 
      sa.subject.toLowerCase().trim() === subName.toLowerCase().trim() && 
      sa.departmentId.toLowerCase() === department.id.toLowerCase()
    );
    return match ? match.staffName : null;
  };

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    const newAssignment: StaffAssignment = {
      id: `staff-${Date.now()}`, departmentId: sDept, year: sYear, section: sSec,
      staffName: sName, email: sEmail, password: sPass, subject: sSubName, subjectCode: sSubCode, semester: sSemester
    };
    setStaffAssignments(prev => [...prev, newAssignment]);
    setSName(''); setSEmail(''); setSPass(''); setSSubCode(''); setSSubName('');
    alert("Allocation Saved.");
  };

  const removeAssignment = (id: string) => {
    if(window.confirm("Revoke this assignment?")) {
      setStaffAssignments(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <div className="p-4 lg:p-10 space-y-10 bg-slate-50 min-h-screen animate-in fade-in duration-500">
      
      {/* Header Context Bar */}
      <div className="bg-white p-8 rounded-[3.5rem] shadow-2xl border border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-8">
          <div className="h-20 w-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-xl">
            <ShieldCheck className="h-10 w-10 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">HOD Panel</h2>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">{department.name}</p>
          </div>
        </div>

        <div className="flex bg-slate-100/80 rounded-[2rem] p-1.5 shadow-inner border border-slate-200 gap-1 flex-wrap justify-center">
           {[
             { id: 'overview', label: 'Overview', icon: Monitor },
             { id: 'allocate', label: 'Allocations', icon: UserPlus },
             { id: 'schedules', label: 'Schedules', icon: Layout },
             { id: 'staff_attendance', label: 'Staff Roster', icon: UserCheck }
           ].map((tab) => (
             <button 
               key={tab.id} 
               onClick={() => setActiveTab(tab.id as any)} 
               className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}
             >
               <tab.icon className="h-4 w-4" /> {tab.label}
             </button>
           ))}
        </div>
      </div>

      {/* 1. OVERVIEW TAB (Preserved Design) */}
      {activeTab === 'overview' && (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex items-center gap-8 group hover:-translate-y-1 transition-all">
                 <div className="h-20 w-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all"><Users className="h-10 w-10" /></div>
                 <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strength</p><h3 className="text-5xl font-black text-slate-900">{myDeptStudents.length}</h3></div>
              </div>
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex items-center gap-8 group hover:-translate-y-1 transition-all">
                 <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all"><Activity className="h-10 w-10" /></div>
                 <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance</p><h3 className="text-5xl font-black text-slate-900">{Math.round(myDeptStudents.reduce((a,b)=>a+(b.attendancePercentage||0),0)/(myDeptStudents.length||1))}%</h3></div>
              </div>
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex items-center gap-8 group hover:-translate-y-1 transition-all">
                 <div className="h-20 w-20 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center shadow-inner group-hover:bg-amber-600 group-hover:text-white transition-all"><Briefcase className="h-10 w-10" /></div>
                 <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Portal</p><h3 className="text-5xl font-black text-slate-900">{uniqueStaffList.length}</h3></div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-slate-100">
                  <h3 className="text-xl font-black uppercase mb-8 flex items-center gap-3"><BarChart3 className="h-6 w-6 text-indigo-600" /> Grade Distribution</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={resultStats.gradeData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '15px', border: 'none'}} />
                        <Bar dataKey="count" fill="#4f46e5" radius={[10, 10, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
              </div>
              <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-slate-100">
                  <h3 className="text-xl font-black uppercase mb-8 flex items-center gap-3"><Award className="h-6 w-6 text-emerald-600" /> Pass / Arrear Standing</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={resultStats.passArrearData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value">
                          {resultStats.passArrearData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
              </div>
           </div>
        </div>
      )}

      {/* 2. ALLOCATIONS TAB (Preserved Design) */}
      {activeTab === 'allocate' && (
         <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100">
               <h3 className="text-xl font-black uppercase mb-10 flex items-center gap-4"><Target className="h-7 w-7 text-indigo-600" /> Faculty Allocation</h3>
               <form onSubmit={handleAllocate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase ml-2">Faculty Name</label><input value={sName} onChange={e=>setSName(e.target.value)} placeholder="Full Name" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" required /></div>
                  <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase ml-2">Faculty ID</label><input value={sEmail} onChange={e=>setSEmail(e.target.value)} placeholder="Official ID" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" required /></div>
                  <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase ml-2">Assign Password</label><input value={sPass} onChange={e=>setSPass(e.target.value)} type="password" placeholder="Passkey" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" required /></div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><School className="h-3 w-3" /> Select Department</label>
                    <select value={sDept} onChange={e=>setSDept(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase cursor-pointer">
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase ml-2">Subject Name</label><input value={sSubName} onChange={e=>setSSubName(e.target.value)} placeholder="Subject" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" required /></div>
                  <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase ml-2">Year</label><select value={sYear} onChange={e=>setSYear(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase">{['I Year', 'II Year', 'III Year', 'IV Year'].map(y=><option key={y} value={y}>{y}</option>)}</select></div>
                  <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase ml-2">Section</label><select value={sSec} onChange={e=>setSSec(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase">{['Section A', 'Section B', 'Section C'].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                  <div className="flex items-end"><button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all"><Plus className="h-4 w-4" /> Finalize</button></div>
               </form>
            </div>
            <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {staffAssignments.filter(a=>a.departmentId.toLowerCase() === department.id.toLowerCase()).map(assign => (
                  <div key={assign.id} className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col gap-6 relative group hover:bg-white hover:shadow-2xl transition-all">
                     <button onClick={() => removeAssignment(assign.id)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                     <div><h4 className="font-black text-slate-900 text-lg uppercase leading-none">{assign.staffName}</h4><p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">Subject: {assign.subject}</p></div>
                     <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-2 text-[8px] font-black uppercase">
                        <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl text-center">{assign.year}</div>
                        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl text-center">{assign.section}</div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* 3. SCHEDULES TAB (FIXED: 8 PERIODS PER DAY STRUCTURE) */}
      {activeTab === 'schedules' && (
         <div className="bg-white p-12 rounded-[5rem] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-500 overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-center mb-14 gap-8">
               <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Timetable Master Sync</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institutional schedules synchronized from Faculty Advisors</p>
               </div>
               {/* Filters */}
               <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-[2.5rem] shadow-inner border border-slate-200">
                  <div className="flex items-center gap-3 px-6 py-2 border-r border-slate-200">
                     <CalendarDays className="h-4 w-4 text-indigo-600" />
                     <select value={viewYear} onChange={e=>setViewYear(e.target.value)} className="bg-transparent font-black text-[10px] uppercase outline-none cursor-pointer">
                        {['I Year', 'II Year', 'III Year', 'IV Year'].map(y=><option key={y} value={y}>{y}</option>)}
                     </select>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-2">
                     <Filter className="h-4 w-4 text-indigo-600" />
                     <select value={viewSection} onChange={e=>setViewSection(e.target.value)} className="bg-transparent font-black text-[10px] uppercase outline-none cursor-pointer">
                        {['Section A', 'Section B', 'Section C'].map(s=><option key={s} value={s}>{s}</option>)}
                     </select>
                  </div>
               </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar pb-6">
              {activeTimetable ? (
                 <table className="w-full border-separate border-spacing-2 min-w-[1200px]">
                    <thead>
                      <tr>
                        <th className="p-6 bg-slate-50 rounded-[2rem] text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Session Day</th>
                        {/* Headers for 8 periods */}
                        {Array(8).fill(0).map((_, i) => (
                          <th key={i} className="p-6 bg-slate-100/50 rounded-[2rem] text-xs font-black text-slate-800 uppercase tracking-tight">Period {i+1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                        const sch = activeTimetable.schedule?.[day] || Array(8).fill('—');
                        return (
                          <tr key={day} className="group">
                             <td className="p-6 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-center shadow-lg group-hover:bg-indigo-600 transition-colors">{day}</td>
                             {/* Correct mapping of 8 periods with faculty info */}
                             {sch.map((p, idx) => {
                               const faculty = getFacultyForPeriod(p);
                               return (
                                 <td key={idx} className={`p-6 rounded-[2rem] text-center border-2 transition-all ${p !== '—' && p !== '' ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50/50 border-transparent text-slate-300'}`}>
                                    <p className="font-black text-slate-900 text-[11px] uppercase truncate">{p || '—'}</p>
                                    {faculty && (
                                      <p className="text-[8px] font-bold text-indigo-500 uppercase mt-2 tracking-widest border-t border-slate-50 pt-2">{faculty}</p>
                                    )}
                                 </td>
                               );
                             })}
                          </tr>
                        );
                      })}
                    </tbody>
                 </table>
              ) : (
                 <div className="py-32 text-center flex flex-col items-center gap-6 opacity-20">
                    <Calendar className="h-20 w-20" />
                    <p className="font-black text-sm uppercase tracking-[0.3em]">No published schedule found for {viewYear} - {viewSection}</p>
                 </div>
              )}
            </div>
         </div>
      )}

      {/* 4. STAFF ROSTER TAB (Preserved Design) */}
      {activeTab === 'staff_attendance' && (
        <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 animate-in fade-in duration-500">
           <div className="flex justify-between items-center mb-12">
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Institutional Staff Roster</h3>
              <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border">
                 <CalendarDays className="h-5 w-5 text-indigo-600" />
                 <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-transparent font-black text-xs uppercase outline-none cursor-pointer" />
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniqueStaffList.map(staff => (
                <div key={staff.id} className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-2xl transition-all">
                   <div className="flex items-center gap-6">
                      <div className="h-14 w-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg group-hover:rotate-6 transition-transform">{staff.name.charAt(0)}</div>
                      <div>
                        <p className="font-black text-slate-800 text-sm uppercase leading-none">{staff.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tight">ID: {staff.id}</p>
                      </div>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shadow-sm">
                        <CheckCircle2 className="h-3 w-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Present</span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default HODDashboard;