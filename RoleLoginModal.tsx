import React, { useState } from 'react';
import { Lock, ShieldCheck, X, User, BookOpen, Mail, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';
import { FacultyAdvisorAccount, HODAccount, StaffAssignment, Student } from '../types';

interface RoleLoginModalProps {
  role: string;
  context: { deptId: string, yearId: string, section: string } | null;
  students?: Student[];
  setStudents?: React.Dispatch<React.SetStateAction<Student[]>>; // New prop
  facultyAdvisors?: FacultyAdvisorAccount[];
  hodAccounts?: HODAccount[];
  staffAccounts?: StaffAssignment[];
  subjectName?: string; 
  onClose: () => void;
  onSuccess: (studentId?: string) => void;
}

const RoleLoginModal: React.FC<RoleLoginModalProps> = ({ 
  role, 
  context, 
  students = [],
  setStudents,
  facultyAdvisors = [],
  hodAccounts = [],
  staffAccounts = [],
  subjectName,
  onClose, 
  onSuccess 
}) => {
  const [view, setView] = useState<'login' | 'firstTimeSetup' | 'forgotPassword' | 'otpVerify' | 'resetPassword'>('login');
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Setup / Forgot State
  const [setupData, setSetupData] = useState({ email: '', newPass: '', confirmPass: '' });
  const [tempStudentId, setTempStudentId] = useState<string | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'Student') {
       const student = students.find(s => s.id.toLowerCase() === identity.trim().toLowerCase());
       
       if (!student) {
          setError('Roll Number not found in this section');
          return;
       }

       if (!student.password) {
          if (password === student.dob) {
             setTempStudentId(student.id);
             setView('firstTimeSetup');
          } else {
             setError('First login requires DOB (YYYY-MM-DD) as passkey');
          }
       } else {
          if (password === student.password) {
             onSuccess(student.id);
          } else {
             setError('Invalid Password');
          }
       }
    } else {
      handleStaffLogin();
    }
  };

  const handleStaffLogin = () => {
    const inputIdentity = identity.trim().toLowerCase();
    const inputPass = password;
    if (role === 'Faculty Advisor') {
       const account = facultyAdvisors.find(fa => (fa.email.toLowerCase() === inputIdentity || fa.name?.toLowerCase() === inputIdentity) && fa.password === inputPass && fa.deptId === context?.deptId && fa.yearId === context?.yearId && fa.section === context?.section);
       if (account) onSuccess(); else setError('Invalid Credentials');
    } else if (role === 'HOD') {
       const account = hodAccounts.find(h => (h.email.toLowerCase() === inputIdentity || h.name.toLowerCase() === inputIdentity) && h.password === inputPass && h.deptId === context?.deptId);
       if (account) onSuccess(); else setError('Invalid Credentials');
    } else if (role === 'Staff') {
       const account = staffAccounts.find(s => (s.email?.toLowerCase() === inputIdentity || s.staffName.toLowerCase() === inputIdentity) && s.password === inputPass && s.subject === subjectName && s.departmentId === context?.deptId && s.section === context?.section);
       if (account) onSuccess(); else setError('Invalid Credentials');
    }
  };

  const handleUpdateStudentAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (setupData.newPass !== setupData.confirmPass) { setError('Passwords do not match'); return; }
    
    if (tempStudentId && setStudents) {
       setStudents(prev => prev.map(s => 
          s.id === tempStudentId 
          ? { ...s, password: setupData.newPass, email: setupData.email, isFirstLogin: false } 
          : s
       ));
       alert("Security updated successfully!");
       onSuccess(tempStudentId);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.email?.toLowerCase() === setupData.email.toLowerCase());
    if (student) {
       const otp = Math.floor(1000 + Math.random() * 9000).toString();
       setGeneratedOtp(otp);
       setTempStudentId(student.id);
       alert(`OTP for reset is ${otp} (Mock Email System)`);
       setView('otpVerify');
    } else {
       setError('Email not found in system');
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp === generatedOtp) setView('resetPassword');
    else setError('Invalid OTP');
  };

  if (!context) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
        
        <div className={`${role === 'Student' ? 'bg-emerald-600' : 'bg-slate-900'} p-8 text-center relative`}>
          <button onClick={onClose} className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors"><X className="h-6 w-6" /></button>
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-4 backdrop-blur-sm shadow-inner">
             {role === 'Student' ? <User className="h-8 w-8 text-white" /> : <ShieldCheck className="h-8 w-8 text-white" />}
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            {view === 'login' ? 'Portal Access' : 'Security Check'}
          </h2>
          <p className="text-white/70 text-[9px] font-black uppercase tracking-[0.3em]">{role} Desk</p>
        </div>

        <div className="p-8">
          {view === 'login' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{role === 'Student' ? 'Roll Number' : 'Identity ID'}</label>
                 <input value={identity} onChange={e => setIdentity(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:border-emerald-500 outline-none transition-all" placeholder="Enter ID" required />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Credential</label>
                 <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:border-emerald-500 outline-none transition-all" placeholder="Password or DOB" required />
              </div>
              {error && <p className="text-rose-600 text-[9px] font-black uppercase bg-rose-50 p-3 rounded-xl text-center">{error}</p>}
              <button type="submit" className={`w-full ${role === 'Student' ? 'bg-emerald-600' : 'bg-slate-900'} text-white font-black py-5 rounded-2xl shadow-xl text-xs uppercase tracking-widest`}>Authorize Account</button>
              {role === 'Student' && <button type="button" onClick={() => setView('forgotPassword')} className="w-full text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline text-center">Forgot Credentials?</button>}
            </form>
          )}

          {view === 'firstTimeSetup' && (
            <form onSubmit={handleUpdateStudentAccount} className="space-y-5">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100"><p className="text-[10px] font-bold text-emerald-800 leading-tight">Identity verified via DOB. Setup your permanent password.</p></div>
              <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recovery Email</label><input type="email" value={setupData.email} onChange={e => setSetupData({...setupData, email: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm" required /></div>
              <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">New Password</label><input type="password" value={setupData.newPass} onChange={e => setSetupData({...setupData, newPass: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm" required /></div>
              <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Confirm</label><input type="password" value={setupData.confirmPass} onChange={e => setSetupData({...setupData, confirmPass: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm" required /></div>
              <button type="submit" className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl text-xs uppercase tracking-widest">Secure Account</button>
            </form>
          )}

          {view === 'forgotPassword' && (
            <form onSubmit={handleSendOtp} className="space-y-6">
               <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recovery Email</label><input type="email" value={setupData.email} onChange={e => setSetupData({...setupData, email: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm" placeholder="Enter registered email" required /></div>
               <button type="submit" className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl text-xs uppercase tracking-widest">Request OTP</button>
               <button type="button" onClick={() => setView('login')} className="w-full text-[9px] font-black text-slate-400 uppercase text-center">Back</button>
            </form>
          )}

          {view === 'otpVerify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
               <p className="text-[10px] font-bold text-slate-600 text-center uppercase tracking-widest">Code sent to {setupData.email}</p>
               <input value={enteredOtp} onChange={e => setEnteredOtp(e.target.value)} className="w-full p-6 bg-slate-50 rounded-2xl font-black text-3xl text-center tracking-[0.5em] border-2 border-emerald-100" maxLength={4} required />
               <button type="submit" className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl text-xs uppercase tracking-widest">Verify & Continue</button>
            </form>
          )}

          {view === 'resetPassword' && (
            <form onSubmit={handleUpdateStudentAccount} className="space-y-6">
               <div className="space-y-4">
                  <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">New Passkey</label><input type="password" value={setupData.newPass} onChange={e => setSetupData({...setupData, newPass: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm" required /></div>
                  <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Confirm</label><input type="password" value={setupData.confirmPass} onChange={e => setSetupData({...setupData, confirmPass: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm" required /></div>
               </div>
               <button type="submit" className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl text-xs uppercase tracking-widest">Reset Credentials</button>
            </form>
          )}
        </div>
        
        <div className="bg-slate-50 p-4 text-center border-t">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Authentication Gateway</p>
        </div>
      </div>
    </div>
  );
};

export default RoleLoginModal;