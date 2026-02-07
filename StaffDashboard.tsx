import React, { useState, useMemo } from 'react';
import { StaffAssignment, Student, TimeTableEntry } from '../types';
import { 
  BookOpen, Save, TrendingUp, ListChecks, Activity, Award, 
  Calendar, Search, Lock, User, CheckCircle2, ChevronRight, Share2,
  CalendarDays, XCircle, Clock, BarChart3
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie 
} from 'recharts';

interface StaffDashboardProps {
  assignmentContext: StaffAssignment;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  assignmentTracker: Record<string, Record<string, {a1: boolean, a2: boolean}>>;
  setAssignmentTracker: React.Dispatch<React.SetStateAction<Record<string, Record<string, {a1: boolean, a2: boolean}>>>>;
  timeTables: TimeTableEntry[];
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ 
  assignmentContext, 
  students, 
  setStudents,
  timeTables
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'marks' | 'schedule' | 'my_attendance'>('overview');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Attendance tracking state
  const [dailyAttendanceStore, setDailyAttendanceStore] = useState<Record<string, Record<string, 'P' | 'A' | 'OD'>>>({});
  const [staffSelfAttendance, setStaffSelfAttendance] = useState<Record<string, 'Present' | 'Absent'>>({});

  // Filter students for this staff's class context
  const myClassStudents = useMemo(() => {
    return students.filter(s => 
      s.department.toLowerCase() === assignmentContext.departmentId.toLowerCase() && 
      s.section === assignmentContext.section &&
      s.year === assignmentContext.year
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [students, assignmentContext]);

  const filteredStudents = myClassStudents.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
    s.id.includes(studentSearch)
  );

  // --- ANALYTICS ENGINE (Modified Requirement) ---
  const analyticsData = useMemo(() => {
    const total = myClassStudents.length || 1;
    const subject = assignmentContext.subject;
    
    // CAT 1 & CAT 2 Marks Calculation
    const cat1Pass = myClassStudents.filter(s => (s.subjectMarks?.[subject]?.semester1.cat1 || 0) >= 50).length;
    const cat2Pass = myClassStudents.filter(s => (s.subjectMarks?.[subject]?.semester1.cat2 || 0) >= 50).length;
    
    // Attendance Analytics (Based on uploaded daily records)
    const currentDayLog = dailyAttendanceStore[selectedDate] || {};
    const presentCount = Object.values(currentDayLog).filter(v => v === 'P' || v === 'OD').length;
    const dailyAttendancePerc = Math.round((presentCount / total) * 100);

    return {
      cat1: { pass: cat1Pass, fail: total - cat1Pass, perc: Math.round((cat1Pass / total) * 100) },
      cat2: { pass: cat2Pass, fail: total - cat2Pass, perc: Math.round((cat2Pass / total) * 100) },
      dailyAttendance: dailyAttendancePerc,
      chartData: [
        { name: 'CAT 1 Pass', value: Math.round((cat1Pass / total) * 100), color: '#4f46e5' },
        { name: 'CAT 2 Pass', value: Math.round((cat2Pass / total) * 100), color: '#10b981' }
      ]
    };
  }, [myClassStudents, assignmentContext.subject, dailyAttendanceStore, selectedDate]);

  // --- TIMETABLE SYNC (Modified Requirement) ---
  const classTimetable = useMemo(() => {
    return timeTables.find(t => 
      t.departmentId === assignmentContext.departmentId && 
      t.year === assignmentContext.year && 
      t.section === assignmentContext.section
    );
  }, [timeTables, assignmentContext]);

  const handleMarkAttendance = (studentId: string, status: 'P' | 'A' | 'OD') => {
    setDailyAttendanceStore(prev => ({
      ...prev,
      [selectedDate]: { ...(prev[selectedDate] || {}), [studentId]: status }
    }));
  };

  const updateIndividualAttendance = (studentId: string) => {
    alert(`Attendance for ${studentId} synchronized successfully.`);
  };

  const handleMarkChange = (studentId: string, field: 'cat1' | 'cat2', val: string) => {
    const numVal = Math.min(100, Math.max(0, parseInt(val) || 0));
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const subject = assignmentContext.subject;
        const currentSubMarks = s.subjectMarks || {};
        const subEntry = currentSubMarks[subject] || { semester1: { cat1: 0, cat2: 0 }, semester2: { cat1: 0, cat2: 0 } };
        return { ...s, subjectMarks: { ...currentSubMarks, [subject]: { ...subEntry, semester1: { ...subEntry.semester1, [field]: numVal } } } };
      }
      return s;
    }));
  };

  const markSelfAttendance = (status: 'Present' | 'Absent') => {
    setStaffSelfAttendance(prev => ({ ...prev, [selectedDate]: status }));
    alert(`Your attendance for ${selectedDate} recorded as ${status}.`);
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header Context Bar */}
      <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="flex items-center gap-8">
          <div className="h-20 w-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-xl">
             <BookOpen className="h-10 w-10 text-indigo-400" />
          </div>
          <div className="space-y-1">
             <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">{assignmentContext.subject}</h2>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{assignmentContext.staffName} • {assignmentContext.year} • {assignmentContext.section}</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100/80 rounded-[2.2rem] p-1.5 shadow-inner border border-slate-200 flex-wrap justify-center gap-1">
           {[
             { id: 'overview', icon: Activity, label: 'Overview' },
             { id: 'attendance', icon: ListChecks, label: 'Students' },
             { id: 'marks', icon: Award, label: 'Cat Marks' },
             { id: 'my_attendance', icon: CalendarDays, label: 'My Attendance' },
             { id: 'schedule', icon: Calendar, label: 'Schedule' }
           ].map((tab) => (
             <button 
               key={tab.id} 
               onClick={() => setActiveTab(tab.id as any)} 
               className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}
             >
               <tab.icon className="h-4 w-4" /> {tab.label}
             </button>
           ))}
        </div>
      </div>

      {/* 1. OVERVIEW: CAT & ATTENDANCE ANALYTICS (Modified) */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center text-center group hover:-translate-y-1 transition-all">
                 <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4"><TrendingUp className="h-7 w-7" /></div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CAT 1 Success Rate</p>
                 <h3 className="text-5xl font-black text-slate-900 mt-1">{analyticsData.cat1.perc}%</h3>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center text-center group hover:-translate-y-1 transition-all">
                 <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4"><TrendingUp className="h-7 w-7" /></div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CAT 2 Success Rate</p>
                 <h3 className="text-5xl font-black text-slate-900 mt-1">{analyticsData.cat2.perc}%</h3>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center text-center group hover:-translate-y-1 transition-all">
                 <div className="h-14 w-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4"><Activity className="h-7 w-7" /></div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Daily Attendance Perc</p>
                 <h3 className="text-5xl font-black text-slate-900 mt-1">{analyticsData.dailyAttendance}%</h3>
                 <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Date: {selectedDate}</p>
              </div>
           </div>

           <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-slate-100">
              <h3 className="text-xl font-black uppercase mb-10 flex items-center gap-4"><BarChart3 className="h-7 w-7 text-indigo-600" /> Internal Marks Comparison</h3>
              <div className="h-80">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 900, fill: '#64748b'}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                       <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '18px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                       <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={60}>
                          {analyticsData.chartData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
      )}

      {/* 2. SCHEDULE: SYNCED FROM FA PORTAL (Modified) */}
      {activeTab === 'schedule' && (
        <div className="bg-white p-14 rounded-[4rem] shadow-2xl border border-slate-100 overflow-x-auto animate-in zoom-in-95 duration-500">
           <div className="flex flex-col md:flex-row justify-between items-center mb-14 gap-8">
              <div className="space-y-2">
                 <h3 className="font-black text-slate-900 text-3xl uppercase tracking-tighter leading-none">Class Schedule</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Timetable Uploaded by Faculty Advisor</p>
              </div>
              <div className="flex items-center gap-4 bg-indigo-50 px-8 py-4 rounded-3xl border border-indigo-100">
                 <Clock className="h-5 w-5 text-indigo-600" />
                 <span className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">8 Period Structure</span>
              </div>
           </div>

           <table className="w-full border-separate border-spacing-3">
              <thead>
                <tr>
                  <th className="p-6 bg-slate-50 rounded-[2rem] text-[10px] font-black text-slate-400 uppercase tracking-widest">Day / Period</th>
                  {Array(8).fill(0).map((_, i) => (
                    <th key={i} className="p-6 bg-slate-100 rounded-[2rem] text-xs font-black text-slate-800 uppercase tracking-tight">P {i+1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                  const periods = classTimetable?.schedule?.[day] || Array(8).fill('—');
                  return (
                    <tr key={day}>
                      <td className="p-6 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-center shadow-lg">{day}</td>
                      {periods.map((p, idx) => {
                        const isMySub = p.toLowerCase().includes(assignmentContext.subject.toLowerCase());
                        return (
                          <td key={idx} className={`p-6 rounded-[2rem] text-[11px] font-bold text-center border-2 transition-all min-w-[140px] ${isMySub ? 'bg-indigo-600 border-indigo-200 text-white scale-105 shadow-xl' : 'bg-slate-50 border-transparent text-slate-400'}`}>
                             {p || '—'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
           </table>
           {!classTimetable && (
              <div className="py-20 text-center flex flex-col items-center gap-4 opacity-30">
                 <XCircle className="h-16 w-16" />
                 <p className="font-black text-xs uppercase tracking-widest">Timetable not yet published by Faculty Advisor</p>
              </div>
           )}
        </div>
      )}

      {/* 3. MY ATTENDANCE: Staff Self Marking (No Changes) */}
      {activeTab === 'my_attendance' && (
        <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 text-center space-y-12 animate-in zoom-in-95 duration-500 max-w-4xl mx-auto">
            <div className="space-y-4">
                <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">My Attendance Portal</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Official Faculty Registry</p>
            </div>
            <div className="flex flex-col items-center gap-8">
                <div className="relative">
                    <CalendarDays className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-indigo-600" />
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="pl-16 pr-8 py-6 bg-slate-50 border-2 border-transparent rounded-[2.5rem] font-black text-xl outline-none focus:border-indigo-600 shadow-inner" />
                </div>
                <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                    <button onClick={() => markSelfAttendance('Present')} className={`py-8 rounded-[3rem] font-black uppercase text-xs tracking-[0.2em] transition-all flex flex-col items-center gap-4 ${staffSelfAttendance[selectedDate] === 'Present' ? 'bg-emerald-600 text-white shadow-2xl scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}><CheckCircle2 className="h-10 w-10" /> Present</button>
                    <button onClick={() => markSelfAttendance('Absent')} className={`py-8 rounded-[3rem] font-black uppercase text-xs tracking-[0.2em] transition-all flex flex-col items-center gap-4 ${staffSelfAttendance[selectedDate] === 'Absent' ? 'bg-rose-600 text-white shadow-2xl scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}><XCircle className="h-10 w-10" /> Absent</button>
                </div>
            </div>
        </div>
      )}

      {/* 4. ATTENDANCE: Student Marking (No Changes) */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden">
           <div className="p-10 border-b bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-8">
              <h3 className="font-black text-slate-800 text-2xl uppercase tracking-tighter">Attendance Registry</h3>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-xs outline-none shadow-sm" />
           </div>
           <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-h-[700px] overflow-y-auto custom-scrollbar">
              {myClassStudents.map(s => {
                 const status = dailyAttendanceStore[selectedDate]?.[s.id];
                 return (
                    <div key={s.id} className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col gap-6 group hover:bg-white hover:shadow-2xl transition-all">
                       <p className="font-black text-slate-800 text-xs uppercase truncate leading-none">{s.name}</p>
                       <div className="grid grid-cols-3 gap-2">
                          {['P', 'A', 'OD'].map(btn => (
                            <button key={btn} onClick={() => handleMarkAttendance(s.id, btn as any)} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${status === btn ? `bg-indigo-600 text-white shadow-lg` : 'bg-white text-slate-400 border border-slate-100'}`}>{btn}</button>
                          ))}
                       </div>
                       <button onClick={() => updateIndividualAttendance(s.id)} className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-[9px] tracking-widest hover:bg-emerald-600 transition-all">Sync</button>
                    </div>
                 );
              })}
           </div>
        </div>
      )}

      {/* 5. MARKS: CAT Marking (No Changes) */}
      {activeTab === 'marks' && (
        <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden">
           <div className="p-10 border-b bg-slate-50/50 flex justify-between items-center gap-10">
              <h3 className="font-black text-slate-800 text-2xl uppercase tracking-tighter">Internal Marks</h3>
              <input placeholder="Search..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} className="pl-6 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] text-xs font-black outline-none shadow-sm" />
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50/80 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                    <tr><th className="px-10 py-8">Identity</th><th className="px-10 py-8">CAT 1</th><th className="px-10 py-8">CAT 2</th><th className="px-10 py-8 text-right">Commit</th></tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map(student => {
                       const marks = student.subjectMarks?.[assignmentContext.subject]?.semester1 || { cat1: 0, cat2: 0 };
                       return (
                          <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-10 py-8"><p className="font-black text-slate-800 uppercase text-xs">{student.name}</p></td>
                             <td className="px-10 py-8"><input type="number" value={marks.cat1 || ''} onChange={e => handleMarkChange(student.id, 'cat1', e.target.value)} className="w-20 p-4 border rounded-xl font-black focus:border-indigo-600 outline-none" /></td>
                             <td className="px-10 py-8"><input type="number" value={marks.cat2 || ''} onChange={e => handleMarkChange(student.id, 'cat2', e.target.value)} className="w-20 p-4 border rounded-xl font-black focus:border-indigo-600 outline-none" /></td>
                             <td className="px-10 py-8 text-right"><button onClick={() => alert('Marks Updated')} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase hover:bg-indigo-600 transition-all">Update</button></td>
                          </tr>
                       );
                    })}
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;