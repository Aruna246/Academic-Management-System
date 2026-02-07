import React, { useState, useMemo, useEffect } from 'react';
import { StaffAssignment, TimeTableEntry, Student } from '../types';
import { 
  Users, Calendar, UserCheck, Trash2, Save, X, Search, UserPlus, 
  GraduationCap, ListChecks, PieChart, TrendingUp, Award, BookOpen,
  CheckCircle2, AlertCircle, Eye, Clock, Phone, MapPin, Droplets, User as UserIcon,
  Activity, RefreshCcw, ChevronRight, CheckCircle, Share2, Database,
  ArrowRight, ArrowLeft, MoreHorizontal, UserMinus, ClipboardCheck, Mail, FileText, ExternalLink
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePie, Pie, Cell, Legend } from 'recharts';

interface FacultyAdvisorDashboardProps {
  context: { deptId: string, yearId: string, section: string };
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  staffAssignments: StaffAssignment[];
  timeTables: TimeTableEntry[];
  setTimeTables: React.Dispatch<React.SetStateAction<TimeTableEntry[]>>;
}

const FacultyAdvisorDashboard: React.FC<FacultyAdvisorDashboardProps> = ({
  context,
  students,
  setStudents,
  staffAssignments,
  timeTables,
  setTimeTables
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'enroll' | 'schedule' | 'attendance' | 'details'>('overview');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);
  
  // Attendance tracking state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyAttendanceStore, setDailyAttendanceStore] = useState<Record<string, Record<string, 'Present' | 'Absent' | 'OD'>>>({});

  // Filter relevant students for this section
  const myStudents = useMemo(() => {
    return students
      .filter(s => (s.department.toLowerCase() === context.deptId.toLowerCase() || s.department === context.deptId.toUpperCase()) && s.section === context.section && s.year === context.yearId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, context]);

  // Helper to open PDF in a new window
  const viewPDF = (data: string) => {
    const win = window.open();
    win?.document.write(`<iframe src="${data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
  };

  // Daily Attendance Stats
  const attendanceStats = useMemo(() => {
    const total = myStudents.length || 1;
    const currentDayLog = dailyAttendanceStore[selectedDate] || {};
    const presentCount = Object.values(currentDayLog).filter(v => v === 'Present' || v === 'OD').length;
    const absentCount = Object.values(currentDayLog).filter(v => v === 'Absent').length;
    
    return {
      presentPerc: Math.round((presentCount / total) * 100),
      absentPerc: Math.round((absentCount / total) * 100),
      notMarked: total - (presentCount + absentCount)
    };
  }, [myStudents, dailyAttendanceStore, selectedDate]);

  // Analytics Logic
  const catAnalytics = useMemo(() => {
    const subjects = Array.from(new Set(staffAssignments.filter(sa => sa.departmentId === context.deptId).map(sa => sa.subject)));
    return subjects.map(sub => {
      const studsWithMarks = myStudents.filter(s => s.subjectMarks?.[sub]);
      const passCount = studsWithMarks.filter(s => (s.subjectMarks?.[sub]?.semester1.cat1 || 0) >= 50).length;
      return { 
        name: sub.length > 12 ? sub.substring(0, 10) + '..' : sub, 
        passRate: studsWithMarks.length ? Math.round((passCount / studsWithMarks.length) * 100) : 0 
      };
    });
  }, [myStudents, staffAssignments, context.deptId]);

  const semAnalytics = useMemo(() => {
    const studsWithRes = myStudents.filter(s => s.semesterResultDetailed);
    const pass = studsWithRes.filter(s => parseFloat(s.semesterResultDetailed?.gpa || '0') >= 5.0).length;
    const fail = studsWithRes.length - pass;
    return [
      { name: 'Pass', value: pass, color: '#10b981' },
      { name: 'Arrear', value: fail, color: '#ef4444' }
    ].filter(d => d.value > 0 || studsWithRes.length === 0);
  }, [myStudents]);

  // Timetable Sync
  const [localTimetable, setLocalTimetable] = useState<Record<string, string[]>>({});
  useEffect(() => {
    const existing = timeTables.find(t => t.departmentId === context.deptId && t.year === context.yearId && t.section === context.section);
    if (existing?.schedule) {
      setLocalTimetable(existing.schedule);
    } else {
      setLocalTimetable({
        'Monday': Array(8).fill(''), 'Tuesday': Array(8).fill(''), 'Wednesday': Array(8).fill(''), 'Thursday': Array(8).fill(''), 'Friday': Array(8).fill('')
      });
    }
  }, [timeTables, context]);

  const updateTT = (day: string, periodIdx: number, val: string) => {
    setLocalTimetable(prev => ({ ...prev, [day]: prev[day].map((v, i) => i === periodIdx ? val : v) }));
  };

  const publishTimetable = () => {
    const newEntry: TimeTableEntry = {
      id: `tt-${context.deptId}-${context.yearId}-${context.section}`,
      departmentId: context.deptId, year: context.yearId, section: context.section, schedule: localTimetable,
    };
    setTimeTables(prev => [...prev.filter(t => t.id !== newEntry.id), newEntry]);
    alert("Timetable Published.");
  };

  // Enrollment & Attendance Actions
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const name = target.elements.name.value;
    const id = target.elements.id.value;
    const dob = target.elements.dob.value;
    if (students.some(s => s.id === id)) { alert("Roll No exists."); return; }
    const newStudent: Student = {
      id, name, dob, department: context.deptId.toUpperCase(), year: context.yearId, section: context.section,
      grade: 'O', attendancePercentage: 100, bloodGroup: '', homeAddress: '', studentPhone: '', parentPhone: ''
    };
    setStudents(prev => [...prev, newStudent]);
    target.reset();
  };

  const deleteStudent = (id: string) => {
    if (window.confirm("Remove student?")) setStudents(prev => prev.filter(s => s.id !== id));
  };

  const markAttendance = (studentId: string, status: 'Present' | 'Absent' | 'OD') => {
    setDailyAttendanceStore(prev => ({ ...prev, [selectedDate]: { ...(prev[selectedDate] || {}), [studentId]: status } }));
  };

  const syncAttendance = () => {
    const currentLogs = dailyAttendanceStore[selectedDate];
    if (!currentLogs) return;
    setStudents(prev => prev.map(s => {
      const status = currentLogs[s.id];
      if (status) {
        let current = s.attendancePercentage;
        if (status === 'Present' || status === 'OD') current = Math.min(100, current + 0.1);
        else current = Math.max(0, current - 0.5);
        return { ...s, attendancePercentage: Math.round(current * 10) / 10 };
      }
      return s;
    }));
    alert("Attendance Synced.");
  };

  return (
    <div className="p-4 lg:p-10 space-y-10 bg-slate-50 min-h-screen">
      {/* Header Bio Card */}
      <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-8">
          <div className="h-20 w-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-xl">
             <UserCheck className="h-10 w-10 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">FA Console</h2>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-2">{context.yearId} • {context.section}</p>
          </div>
        </div>

        <div className="flex bg-slate-100/80 rounded-[2.2rem] p-1.5 shadow-inner border border-slate-200 flex-wrap justify-center gap-1">
           {[
             { id: 'overview', icon: PieChart, label: 'Overview' },
             { id: 'enroll', icon: UserPlus, label: 'Enroll' },
             { id: 'schedule', icon: Calendar, label: 'Schedule' },
             { id: 'attendance', icon: ListChecks, label: 'Attendance' },
             { id: 'details', icon: Eye, label: 'Student Portfolio' }
           ].map((tab) => (
             <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}>
               <tab.icon className="h-4 w-4" /> {tab.label}
             </button>
           ))}
        </div>
      </div>

      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-10 animate-in fade-in duration-500">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex items-center gap-8">
                 <div className="h-20 w-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center shadow-inner"><Users className="h-10 w-10" /></div>
                 <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strength</p><h3 className="text-5xl font-black text-slate-900">{myStudents.length}</h3></div>
              </div>
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex items-center gap-8">
                 <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-inner"><Activity className="h-10 w-10" /></div>
                 <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance</p><h3 className="text-5xl font-black text-slate-900">{attendanceStats.presentPerc}%</h3></div>
              </div>
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex items-center gap-8">
                 <div className="h-20 w-20 bg-rose-50 text-rose-600 rounded-[2rem] flex items-center justify-center shadow-inner"><X className="h-10 w-10" /></div>
                 <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Absent</p><h3 className="text-5xl font-black text-slate-900">{attendanceStats.absentPerc}%</h3></div>
              </div>
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-slate-100">
                 <h3 className="text-xl font-black uppercase mb-10 flex items-center gap-3"><TrendingUp className="h-6 w-6 text-indigo-600" /> Staff CAT Updates</h3>
                 <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={catAnalytics}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800}} /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="passRate" fill="#4f46e5" radius={[10, 10, 0, 0]} barSize={40} /></BarChart></ResponsiveContainer></div>
              </div>
              <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-slate-100">
                 <h3 className="text-xl font-black uppercase mb-10 flex items-center gap-3"><Award className="h-6 w-6 text-emerald-600" /> Student Sem Updates</h3>
                 <div className="h-72 flex items-center justify-center">{myStudents.some(s=>s.semesterResultDetailed) ? (<ResponsiveContainer width="100%" height="100%"><RePie><Pie data={semAnalytics} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" stroke="none">{semAnalytics.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Pie><Tooltip /><Legend iconType="circle" /></RePie></ResponsiveContainer>) : (<div className="text-center flex flex-col items-center gap-4 opacity-30"><Database className="h-12 w-12" /><p className="uppercase font-black text-xs">Waiting for Data</p></div>)}</div>
              </div>
           </div>
        </div>
      )}

      {/* 2. ENROLLMENT */}
      {activeTab === 'enroll' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-6 duration-500">
           <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 h-fit">
              <h3 className="font-black text-slate-900 text-2xl uppercase mb-10 flex items-center gap-4"><UserPlus className="h-8 w-8 text-indigo-600" /> Enrollment Form</h3>
              <form onSubmit={handleAddStudent} className="space-y-6">
                 <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4">Legal Name</label><input name="name" required className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] font-bold focus:border-indigo-600 outline-none" /></div>
                 <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4">Roll Number</label><input name="id" required className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] font-bold focus:border-indigo-600 outline-none" /></div>
                 <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4">DOB</label><input name="dob" type="date" className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] font-bold focus:border-indigo-600 outline-none" /></div>
                 <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all">Enroll Student</button>
              </form>
           </div>
           <div className="bg-white rounded-[4rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col h-[600px]">
              <div className="p-10 border-b bg-slate-50/50 flex justify-between items-center"><h3 className="font-black text-xl uppercase">Class Roll</h3><span className="text-xs font-black text-indigo-600">{myStudents.length} Enrolled</span></div>
              <div className="p-8 space-y-4 overflow-y-auto custom-scrollbar">
                 {myStudents.map(s => (
                    <div key={s.id} className="p-6 bg-slate-50 rounded-[2.5rem] flex justify-between items-center group hover:bg-white hover:shadow-xl transition-all">
                       <div><p className="font-black text-sm uppercase">{s.name}</p><p className="text-[10px] text-slate-400 font-bold">{s.id}</p></div>
                       <button onClick={() => deleteStudent(s.id)} className="text-slate-200 hover:text-rose-600 transition-colors"><UserMinus className="h-6 w-6" /></button>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* 3. SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="bg-white p-12 rounded-[5rem] shadow-2xl border border-slate-100 overflow-x-auto animate-in zoom-in-95 duration-500">
           <div className="flex justify-between items-center mb-10"><h3 className="font-black text-3xl uppercase tracking-tighter">Timetable Sync</h3><button onClick={publishTimetable} className="bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl">Sync to Institution</button></div>
           <table className="w-full border-separate border-spacing-3">
              <thead><tr><th className="p-6 bg-slate-50 rounded-[2rem] text-[10px] font-black text-slate-400 uppercase">Day</th>{Array(8).fill(0).map((_, i) => <th key={i} className="p-6 bg-slate-100/50 rounded-[2rem] text-xs font-black">P {i+1}</th>)}</tr></thead>
              <tbody>{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                 <tr key={day} className="group"><td className="p-6 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black uppercase text-center">{day}</td>{Array(8).fill(0).map((_, idx) => (
                    <td key={idx}><input value={localTimetable[day]?.[idx] || ''} onChange={e => updateTT(day, idx, e.target.value)} placeholder="Empty" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] text-[10px] font-bold text-center focus:border-indigo-600 outline-none" /></td>
                 ))}</tr>
              ))}</tbody>
           </table>
        </div>
      )}

      {/* 4. ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in duration-500">
           <div className="p-10 border-b bg-slate-50/50 flex justify-between items-center gap-8">
              <h3 className="font-black text-2xl uppercase">Daily Attendance</h3>
              <div className="flex items-center gap-6">
                 <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-6 py-4 bg-white border rounded-2xl font-black text-xs outline-none" />
                 <button onClick={syncAttendance} className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl">Publish Records</button>
              </div>
           </div>
           <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-h-[600px] overflow-y-auto custom-scrollbar">
              {myStudents.map(s => {
                 const status = dailyAttendanceStore[selectedDate]?.[s.id];
                 return (
                    <div key={s.id} className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col gap-6 group hover:bg-white hover:shadow-2xl transition-all">
                       <p className="font-black text-xs uppercase truncate leading-none">{s.name}</p>
                       <div className="grid grid-cols-3 gap-2">
                          {['Present', 'Absent', 'OD'].map(btn => (
                            <button key={btn} onClick={() => markAttendance(s.id, btn as any)} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${status === btn ? `bg-indigo-600 text-white shadow-lg` : 'bg-white text-slate-400 border border-slate-100'}`}>{btn.charAt(0)}</button>
                          ))}
                       </div>
                    </div>
                 );
              })}
           </div>
        </div>
      )}

      {/* 5. STUDENT PORTFOLIO: Updated with Email and Document View */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in slide-in-from-bottom-4 duration-500">
           <div className="lg:col-span-1 bg-white p-10 rounded-[4rem] shadow-xl border border-slate-100 h-fit sticky top-32">
              <h3 className="font-black text-xl uppercase mb-8">Registry Search</h3>
              <div className="relative mb-8"><Search className="absolute left-6 top-5 h-4 w-4 text-slate-400" /><input value={studentSearch} onChange={e => setStudentSearch(e.target.value)} placeholder="Quick search..." className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-[1.8rem] font-bold text-xs outline-none" /></div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                 {myStudents.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase())).map(s => (
                    <button key={s.id} onClick={() => setSelectedStudentDetail(s)} className={`w-full p-6 rounded-[2.2rem] flex items-center justify-between transition-all group ${selectedStudentDetail?.id === s.id ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-50 hover:bg-white hover:shadow-lg border border-transparent hover:border-indigo-100'}`}><span className="font-black uppercase text-[10px] tracking-tight">{s.name}</span><ChevronRight className={`h-4 w-4 ${selectedStudentDetail?.id === s.id ? 'translate-x-1' : 'opacity-20'}`} /></button>
                 ))}
              </div>
           </div>

           <div className="lg:col-span-2 space-y-10">
              {selectedStudentDetail ? (
                 <div className="space-y-10 animate-in zoom-in-95 duration-500">
                    <div className="bg-slate-900 p-12 rounded-[5rem] shadow-2xl relative overflow-hidden text-white border border-white/5">
                       <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                          <div className="h-32 w-32 bg-indigo-600 rounded-[3rem] flex items-center justify-center font-black text-5xl shadow-2xl">{selectedStudentDetail.name.charAt(0)}</div>
                          <div className="text-center md:text-left">
                             <h4 className="text-4xl font-black uppercase tracking-tighter">{selectedStudentDetail.name}</h4>
                             <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] mt-2">{selectedStudentDetail.id} • {selectedStudentDetail.email || 'No Email registered'}</p>
                             <div className="flex gap-3 mt-6 justify-center md:justify-start">
                                <span className="px-5 py-2 bg-white/10 rounded-full text-[8px] font-black uppercase border border-white/10">{selectedStudentDetail.year}</span>
                                <span className="px-5 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-[8px] font-black uppercase border border-emerald-500/10">Standing: {selectedStudentDetail.attendancePercentage}%</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* DOCUMENT VAULT VIEW FOR FACULTY ADDED */}
                    <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-slate-100">
                       <h3 className="text-xl font-black uppercase mb-8 flex items-center gap-4 text-emerald-600"><FileText className="h-6 w-6" /> Verification Documents</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { label: 'Aadhar Card', key: 'aadhar' },
                            { label: 'Community Certificate', key: 'community' },
                            { label: 'First Graduate', key: 'firstGraduate' },
                            { label: 'Bank Passbook', key: 'passbook' }
                          ].map((doc) => {
                             const data = selectedStudentDetail.documents?.[doc.key as keyof typeof selectedStudentDetail.documents];
                             return (
                               <div key={doc.key} className={`p-6 rounded-[2.5rem] border-2 flex justify-between items-center ${data ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                                  <div className="flex items-center gap-4"><FileText className={`h-5 w-5 ${data ? 'text-emerald-600' : 'text-slate-400'}`} /><span className="text-[10px] font-black uppercase text-slate-800">{doc.label}</span></div>
                                  {data && <button onClick={() => viewPDF(data)} className="p-3 bg-white text-emerald-600 rounded-2xl shadow-sm hover:scale-110 transition-transform"><ExternalLink className="h-4 w-4" /></button>}
                               </div>
                             );
                          })}
                       </div>
                    </div>

                    <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-slate-100">
                       <h3 className="text-xl font-black uppercase mb-8 flex items-center gap-4 text-indigo-600">
                          <ClipboardCheck className="h-6 w-6" /> Internal Performance (CAT)
                       </h3>
                       <div className="overflow-x-auto">
                          <table className="w-full text-left">
                             <thead className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b">
                                <tr>
                                   <th className="py-4">Subject</th>
                                   <th className="py-4 text-center">CAT 1</th>
                                   <th className="py-4 text-center">CAT 2</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-50">
                                {Object.entries(selectedStudentDetail.subjectMarks || {}).map(([sub, m]) => (
                                   <tr key={sub} className="group">
                                      <td className="py-5 font-black text-slate-800 text-xs uppercase">{sub}</td>
                                      <td className="py-5 text-center"><span className={`px-4 py-1.5 rounded-xl font-black text-xs ${m.semester1.cat1 >= 50 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{m.semester1.cat1}</span></td>
                                      <td className="py-5 text-center"><span className={`px-4 py-1.5 rounded-xl font-black text-xs ${m.semester1.cat2 >= 50 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{m.semester1.cat2}</span></td>
                                   </tr>
                                ))}
                                {(!selectedStudentDetail.subjectMarks || Object.keys(selectedStudentDetail.subjectMarks).length === 0) && (
                                   <tr><td colSpan={3} className="py-10 text-center opacity-30 uppercase font-black text-xs">No CAT Marks Uploaded by Staff</td></tr>
                                )}
                             </tbody>
                          </table>
                       </div>
                    </div>

                    <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-slate-100">
                       <div className="flex justify-between items-center mb-8">
                          <h3 className="text-xl font-black uppercase flex items-center gap-4 text-emerald-600">
                             <Award className="h-6 w-6" /> Academic Portfolio (Semester)
                          </h3>
                          {selectedStudentDetail.semesterResultDetailed && (
                             <div className="flex gap-4">
                                <div className="px-4 py-2 bg-slate-50 rounded-2xl border text-center">
                                   <p className="text-[8px] font-black text-slate-400 uppercase">GPA</p>
                                   <p className="text-sm font-black text-slate-800">{selectedStudentDetail.semesterResultDetailed.gpa}</p>
                                </div>
                                <div className="px-4 py-2 bg-slate-50 rounded-2xl border text-center">
                                   <p className="text-[8px] font-black text-slate-400 uppercase">CGPA</p>
                                   <p className="text-sm font-black text-slate-800">{selectedStudentDetail.semesterResultDetailed.cgpa}</p>
                                </div>
                             </div>
                          )}
                       </div>
                       <div className="overflow-x-auto">
                          <table className="w-full text-left">
                             <thead className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b">
                                <tr>
                                   <th className="py-4">Course Registry</th>
                                   <th className="py-4 text-right">Grade Point</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-50">
                                {selectedStudentDetail.semesterResultDetailed?.subjects.map((row, i) => (
                                   <tr key={i}>
                                      <td className="py-5 font-black text-slate-800 text-xs uppercase">{row.subject}</td>
                                      <td className="py-5 text-right"><span className={`px-4 py-1.5 rounded-xl font-black text-xs ${['O', 'A+', 'A'].includes(row.grade) ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>{row.grade}</span></td>
                                   </tr>
                                ))}
                                {!selectedStudentDetail.semesterResultDetailed && (
                                   <tr><td colSpan={2} className="py-10 text-center opacity-30 uppercase font-black text-xs">No Semester Records Uploaded by Student</td></tr>
                                )}
                             </tbody>
                          </table>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {[
                         { icon: Phone, label: 'Personal Mobile', val: selectedStudentDetail.studentPhone, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                         { icon: Phone, label: 'Parent/Guardian', val: selectedStudentDetail.parentPhone, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                         { icon: Droplets, label: 'Blood Group', val: selectedStudentDetail.bloodGroup, color: 'text-rose-600', bg: 'bg-rose-50' },
                         { icon: Calendar, label: 'Birth Registry', val: selectedStudentDetail.dob, color: 'text-amber-600', bg: 'bg-amber-50' }
                       ].map((item, i) => (
                         <div key={i} className="bg-white p-8 rounded-[3.5rem] shadow-xl border border-slate-100 flex items-center gap-6">
                            <div className={`h-12 w-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center shadow-inner`}><item.icon className="h-6 w-6" /></div>
                            <div><p className="text-[9px] font-black text-slate-400 uppercase">{item.label}</p><h5 className="text-sm font-black text-slate-800">{item.val || '—'}</h5></div>
                         </div>
                       ))}
                       <div className="md:col-span-2 bg-white p-8 rounded-[4rem] shadow-xl border border-slate-100 flex items-center gap-8">
                          <div className="h-12 w-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0"><MapPin className="h-6 w-6" /></div>
                          <div><p className="text-[9px] font-black text-slate-400 uppercase">Home Address Registry</p><h5 className="text-sm font-bold text-slate-800 leading-tight">{selectedStudentDetail.homeAddress || 'Update Pending'}</h5></div>
                       </div>
                    </div>
                 </div>
              ) : (
                 <div className="h-full bg-white rounded-[5rem] shadow-xl border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center p-20 opacity-30">
                    <UserIcon className="h-20 w-20 mb-6" />
                    <h4 className="text-xl font-black uppercase tracking-[0.4em]">Select Record</h4>
                 </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default FacultyAdvisorDashboard;