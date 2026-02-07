import React, { useState, useMemo, useEffect } from 'react';
import { Student, TimeTableEntry, SubjectResult, SemesterResultDetailed, StaffAssignment } from '../types';
import { 
  User as UserIcon, Calendar, Activity, Award, CheckCircle, Save, Plus, GraduationCap, 
  Trash2, Phone, MapPin, Droplets, BookOpen, Clock, CheckCircle2, AlertCircle, TrendingUp,
  Mail, FileText, Upload, ShieldCheck
} from 'lucide-react';

interface StudentDashboardProps {
  context: { deptId: string, yearId: string, section: string };
  studentId: string;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  assignmentTracker: Record<string, Record<string, {a1: boolean, a2: boolean}>>;
  timeTables: TimeTableEntry[];
  staffAssignments: StaffAssignment[];
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
  context,
  studentId, 
  students, 
  setStudents, 
  timeTables,
  staffAssignments,
  assignmentTracker
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'timetable' | 'details'>('overview');
  const student = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);

  const [subjectRows, setSubjectRows] = useState<SubjectResult[]>(
    student?.semesterResultDetailed?.subjects || [{ subject: '', grade: 'O' }]
  );
  const [gpa, setGpa] = useState(student?.semesterResultDetailed?.gpa || '');
  const [cgpa, setCgpa] = useState(student?.semesterResultDetailed?.cgpa || '');

  const [profileData, setProfileData] = useState({
    name: student?.name || '',
    email: student?.email || '',
    dob: student?.dob || '',
    homeAddress: student?.homeAddress || '',
    bloodGroup: student?.bloodGroup || '',
    studentPhone: student?.studentPhone || '',
    parentPhone: student?.parentPhone || ''
  });

  const [docs, setDocs] = useState<Record<string, string>>(student?.documents || {});

  useEffect(() => {
    if (student) {
      setProfileData({
        name: student.name,
        email: student.email || '',
        dob: student.dob || '',
        homeAddress: student.homeAddress || '',
        bloodGroup: student.bloodGroup || '',
        studentPhone: student.studentPhone || '',
        parentPhone: student.parentPhone || ''
      });
      setDocs(student.documents || {});
      if (student.semesterResultDetailed) {
        setSubjectRows(student.semesterResultDetailed.subjects);
        setGpa(student.semesterResultDetailed.gpa);
        setCgpa(student.semesterResultDetailed.cgpa);
      }
    }
  }, [studentId, student]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocs(prev => ({ ...prev, [key]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      alert("Institutional rule: Please upload PDF format only.");
    }
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...profileData, documents: docs } : s));
    alert("Profile information and digital documents updated successfully.");
  };

  const handleDetailedResultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: SemesterResultDetailed = { 
      subjects: subjectRows.filter(r => r.subject.trim() !== ''), 
      gpa, 
      cgpa 
    };
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, semesterResultDetailed: newRecord } : s));
    alert("Semester results have been successfully updated.");
  };

  const addSubjectRow = () => setSubjectRows([...subjectRows, { subject: '', grade: 'O' }]);
  const deleteSubjectRow = (idx: number) => setSubjectRows(subjectRows.filter((_, i) => i !== idx));
  const updateSubjectRow = (index: number, field: keyof SubjectResult, value: string) => {
    const updated = [...subjectRows];
    updated[index] = { ...updated[index], [field]: value };
    setSubjectRows(updated);
  };

  const getFacultyForSubject = (subjectName: string) => {
    const match = staffAssignments.find(sa => sa.subject.toLowerCase() === subjectName.toLowerCase());
    return match ? match.staffName : "TBA";
  };

  if (!student) return <div className="p-20 text-center font-black uppercase text-slate-400">Record Offline.</div>;

  return (
    <div className="p-4 lg:p-10 space-y-8 bg-slate-50 min-h-screen">
      <div className="bg-slate-900 p-8 lg:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white border border-white/5">
        <div className="absolute -top-10 -right-10 p-20 opacity-5 rotate-12"><GraduationCap className="h-64 w-64" /></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-8">
            <div className="h-24 w-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center font-black text-3xl shadow-xl">
               {student.name.charAt(0)}
            </div>
            <div className="space-y-1">
               <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{student.name}</h2>
               <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">{student.id} • {student.department}</p>
               <div className="flex gap-3 mt-4">
                  <span className="px-4 py-1.5 bg-white/10 rounded-full text-[8px] font-black uppercase border border-white/5">{student.year}</span>
                  <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[8px] font-black uppercase border border-emerald-500/5">Attendance: {student.attendancePercentage}%</span>
               </div>
            </div>
          </div>
          
          <div className="flex bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-2 border border-white/10 gap-1 overflow-x-auto max-w-full">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'results', label: 'Semester Upload', icon: Award },
              { id: 'timetable', label: 'Timetable', icon: Calendar },
              { id: 'details', label: 'Details', icon: UserIcon }
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><tab.icon className="h-4 w-4" /> {tab.label}</button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 flex flex-col">
                 <h3 className="text-xl font-black uppercase mb-8 flex items-center gap-4 text-slate-900"><TrendingUp className="h-6 w-6 text-indigo-600" /> Internal Performance</h3>
                 <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left">
                       <thead className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b">
                          <tr><th className="py-4">Subject Course</th><th className="py-4 text-center">CAT 1</th><th className="py-4 text-center">CAT 2</th></tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {Object.entries(student.subjectMarks || {}).map(([sub, m]) => (
                             <tr key={sub} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="py-6 pr-4">
                                   <p className="font-black text-slate-800 text-xs uppercase">{sub}</p>
                                   <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Instructor: {getFacultyForSubject(sub)}</p>
                                </td>
                                <td className="py-6 text-center"><span className={`px-4 py-1.5 rounded-xl font-black text-xs ${m.semester1.cat1 >= 50 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{m.semester1.cat1}</span></td>
                                <td className="py-6 text-center"><span className={`px-4 py-1.5 rounded-xl font-black text-xs ${m.semester1.cat2 >= 50 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{m.semester1.cat2}</span></td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

              {/* Assignment Tracker Card with Status logic */}
              <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 flex flex-col">
                 <h3 className="text-xl font-black uppercase mb-8 flex items-center gap-4 text-slate-900">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" /> Subject Assignments
                 </h3>
                 <div className="space-y-4 overflow-y-auto max-h-[500px]">
                    {staffAssignments.filter(sa => sa.departmentId === context.deptId && sa.section === context.section).map((sa, i) => {
                       const status = assignmentTracker[sa.subject]?.[studentId] || { a1: false, a2: false };
                       return (
                          <div key={i} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 group hover:bg-white hover:shadow-lg transition-all">
                             <div className="flex items-center gap-6">
                                <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-sm uppercase shadow-sm">{sa.subject.charAt(0)}</div>
                                <div>
                                   <p className="font-black text-slate-800 text-xs uppercase leading-none">{sa.subject}</p>
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Faculty: {sa.staffName}</p>
                                </div>
                             </div>
                             <div className="flex gap-3">
                                {/* Assignment 1 Logic */}
                                <div className={`px-5 py-2 rounded-xl flex items-center gap-2 border ${status.a1 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                   {status.a1 ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                                   <span className="text-[9px] font-black uppercase tracking-widest">
                                      ASGN 1: {status.a1 ? 'Completed' : 'Pending'}
                                   </span>
                                </div>
                                {/* Assignment 2 Logic */}
                                <div className={`px-5 py-2 rounded-xl flex items-center gap-2 border ${status.a2 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                   {status.a2 ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                                   <span className="text-[9px] font-black uppercase tracking-widest">
                                      ASGN 2: {status.a2 ? 'Completed' : 'Pending'}
                                   </span>
                                </div>
                             </div>
                          </div>
                       );
                    })}
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="max-w-5xl mx-auto animate-in zoom-in-95 duration-500">
           <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-12">
                 <div className="space-y-1"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Result Repository</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update course grades</p></div>
                 <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-inner"><Award className="h-8 w-8" /></div>
              </div>
              <form onSubmit={handleDetailedResultSubmit} className="space-y-10">
                 <div className="space-y-3">
                    {subjectRows.map((row, idx) => (
                       <div key={idx} className="flex gap-4 group">
                          <div className="flex-1 relative"><BookOpen className="absolute left-5 top-5 h-5 w-5 text-slate-300" /><input value={row.subject} onChange={e => updateSubjectRow(idx, 'subject', e.target.value)} placeholder="Full Subject Name" className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[2rem] font-bold text-sm focus:border-indigo-600 outline-none" required /></div>
                          <select value={row.grade} onChange={e => updateSubjectRow(idx, 'grade', e.target.value)} className="w-32 p-5 bg-white border-2 border-slate-50 rounded-[2rem] font-black text-xs uppercase cursor-pointer">{['O', 'A+', 'A', 'B+', 'B', 'C', 'U', 'RA'].map(g => <option key={g} value={g}>{g}</option>)}</select>
                          <button type="button" onClick={() => deleteSubjectRow(idx)} className="p-5 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 className="h-6 w-6" /></button>
                       </div>
                    ))}
                    <button type="button" onClick={addSubjectRow} className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-full font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all"><Plus className="h-3.5 w-3.5" /> Add Course</button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                    <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">GPA</label><input type="number" step="0.01" value={gpa} onChange={e=>setGpa(e.target.value)} placeholder="0.00" className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2.5rem] font-black text-2xl focus:border-emerald-600 outline-none" required /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">CGPA</label><input type="number" step="0.01" value={cgpa} onChange={e=>setCgpa(e.target.value)} placeholder="0.00" className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2.5rem] font-black text-2xl focus:border-emerald-600 outline-none" required /></div>
                 </div>
                 <button type="submit" className="w-full py-7 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.4em] shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 group"><Save className="h-6 w-6 group-hover:scale-125 transition-transform" /> Publish Results</button>
              </form>
           </div>
        </div>
      )}

      {activeTab === 'timetable' && (
        <div className="bg-white p-12 rounded-[5rem] shadow-2xl border border-slate-100 overflow-x-auto">
           <table className="w-full border-separate border-spacing-3">
              <thead><tr><th className="p-6 bg-slate-50 rounded-[2rem] text-[10px] font-black text-slate-400 uppercase">Day</th>{Array(8).fill(0).map((_, i) => <th key={i} className="p-6 bg-slate-100/50 rounded-[2rem] text-xs font-black">P {i+1}</th>)}</tr></thead>
              <tbody>{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => { const entry = timeTables.find(t=>t.year === student.year && t.section === student.section); const sch = entry?.schedule?.[day] || Array(8).fill('—'); return (<tr key={day} className="group"><td className="p-6 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black uppercase text-center shadow-lg">{day}</td>{sch.map((p, idx) => (<td key={idx} className={`p-4 rounded-[2rem] text-center border-2 min-w-[140px] ${p !== '—' && p !== '' ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50/30 border-transparent text-slate-200'}`}><p className="font-black text-slate-800 text-[11px] uppercase truncate">{p || '—'}</p>{p !== '—' && p !== '' && <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-2 truncate">{getFacultyForSubject(p)}</p>}</td>))}</tr>); })}</tbody></table>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
           <form onSubmit={handleProfileUpdate} className="space-y-8">
              <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100">
                 <div className="flex items-center gap-6 mb-12"><div className="h-16 w-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white"><UserIcon className="h-8 w-8" /></div><div><h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Personal Profile</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Dossier Registry</p></div></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Legal Full Name</label><input value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2.5rem] font-bold focus:border-indigo-600 outline-none transition-all" required /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</label><div className="relative"><Mail className="absolute left-6 top-6 h-5 w-5 text-slate-400" /><input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent rounded-[2.5rem] font-bold focus:border-indigo-600 outline-none transition-all" required /></div></div>
                    <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Date of Birth</label><input type="date" value={profileData.dob} onChange={e => setProfileData({...profileData, dob: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2.5rem] font-bold outline-none" required /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Blood Group</label><input value={profileData.bloodGroup} onChange={e => setProfileData({...profileData, bloodGroup: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2.5rem] font-bold outline-none" placeholder="e.g. O+" /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Mobile</label><input value={profileData.studentPhone} onChange={e => setProfileData({...profileData, studentPhone: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2.5rem] font-bold outline-none" /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Parent Mobile</label><input value={profileData.parentPhone} onChange={e => setProfileData({...profileData, parentPhone: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2.5rem] font-bold outline-none" /></div>
                    <div className="md:col-span-2 space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Home Address Registry</label><textarea value={profileData.homeAddress} onChange={e => setProfileData({...profileData, homeAddress: e.target.value})} className="w-full p-8 bg-slate-50 border-2 border-transparent rounded-[2.5rem] font-bold outline-none min-h-[120px]" /></div>
                 </div>

                 <div className="mt-16 pt-12 border-t border-slate-100">
                    <h4 className="text-xl font-black text-slate-900 uppercase mb-8 flex items-center gap-4"><ShieldCheck className="text-indigo-600" /> Digital Document Vault</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {[
                         { label: 'Aadhar Card', key: 'aadhar' },
                         { label: 'Community Certificate', key: 'community' },
                         { label: 'First Graduate Certificate', key: 'firstGraduate' },
                         { label: 'Bank Passbook', key: 'passbook' }
                       ].map(doc => (
                          <div key={doc.key} className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center gap-4 group hover:border-indigo-600 transition-all">
                             <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center">{docs[doc.key] ? <FileText className="text-emerald-500" /> : <Upload className="text-slate-300" />}</div>
                             <p className="text-[10px] font-black text-slate-900 uppercase">{doc.label}</p>
                             <input type="file" accept=".pdf" onChange={e => handleFileUpload(e, doc.key)} className="hidden" id={`up-${doc.key}`} />
                             <label htmlFor={`up-${doc.key}`} className={`px-8 py-2.5 rounded-full text-[9px] font-black uppercase cursor-pointer transition-all shadow-md ${docs[doc.key] ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}>{docs[doc.key] ? 'Update PDF' : 'Upload PDF'}</label>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="mt-16 flex justify-end">
                    <button type="submit" className="px-16 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-emerald-600 transition-all flex items-center gap-3"><Save className="h-5 w-5" /> Save Changes</button>
                 </div>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;