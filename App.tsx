import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import HODDashboard from './components/HODDashboard';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import RoleLoginModal from './components/RoleLoginModal';
import FacultyAdvisorDashboard from './components/FacultyAdvisorDashboard';
import StaffDashboard from './components/StaffDashboard';
import StudentDashboard from './components/StudentDashboard';
import SubjectSelectionModal from './components/SubjectSelectionModal';
import InternalCalculator from './components/InternalCalculator'; // New import

import { initialDepartments, mockStaffAssignments, mockExamResults, mockTimeTables, mockStudents, mockFacultyAdvisors, mockHODAccounts } from './services/mockData';
import { DepartmentStructure, StaffAssignment, ExamResult, TimeTableEntry, FacultyAdvisorAccount, Student, HODAccount, SystemConfig, AcademicArchive } from './types';
import { LayoutDashboard, Settings, ArrowLeft, RefreshCw, CalendarDays, LogOut, Lock } from 'lucide-react';

const App: React.FC = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false); 
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    collegeName: "Thanthai Periyar Government Institute of Technology",
    logoLeft: "/tpgit.png", 
    logoRight: "/tamilnadu.png",
    currentYear: "2025-2026",
    currentSemester: "1st"
  });

  const [departments, setDepartments] = useState<DepartmentStructure[]>(initialDepartments);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [staffAssignments, setStaffAssignments] = useState<StaffAssignment[]>(mockStaffAssignments);
  const [examResults, setExamResults] = useState<ExamResult[]>(mockExamResults);
  const [timeTables, setTimeTables] = useState<TimeTableEntry[]>(mockTimeTables);
  const [facultyAdvisors, setFacultyAdvisors] = useState<FacultyAdvisorAccount[]>(mockFacultyAdvisors);
  const [hodAccounts, setHodAccounts] = useState<HODAccount[]>(mockHODAccounts);
  const [archives, setArchives] = useState<AcademicArchive[]>([]);
  const [assignmentTracker, setAssignmentTracker] = useState<Record<string, Record<string, {a1: boolean, a2: boolean}>>>({});

  const [currentView, setCurrentView] = useState<'dashboard' | 'admin' | 'hod' | 'faculty' | 'staff_view' | 'student_view'>('dashboard');
  const [selectedHodDeptId, setSelectedHodDeptId] = useState<string>('');
  const [loggedInStudentId, setLoggedInStudentId] = useState<string>('');
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [calcModalOpen, setCalcModalOpen] = useState(false); // New State
  const [pendingRole, setPendingRole] = useState<{ role: string, context: { deptId: string, yearId: string, section: string } } | null>(null);
  const [currentRoleContext, setCurrentRoleContext] = useState<{ deptId: string, yearId: string, section: string } | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<StaffAssignment | null>(null);

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setCurrentView('dashboard');
    setCurrentRoleContext(null);
    setSelectedSubject(null);
    setLoggedInStudentId('');
  };

  const navigateTo = (view: typeof currentView) => {
    if (currentView === 'admin' && view !== 'admin') setIsAdminAuthenticated(false);
    setCurrentView(view);
  };

  const handleAdminLogin = (email: string) => {
    setIsAdminAuthenticated(true);
    setCurrentView('admin');
  };

  const handleSidebarSelect = (view: 'dashboard' | 'hod' | 'admin', deptId?: string) => {
     if (view === 'hod' && deptId) {
       setPendingRole({ role: 'HOD', context: { deptId, yearId: 'HOD', section: 'Main' } });
       setRoleModalOpen(true);
     } else if (view === 'admin') {
       navigateTo('admin');
     } else {
       navigateTo(view);
     }
  };

  const handleRoleSelect = (role: string, context: { deptId: string, yearId: string, section: string }) => {
    setPendingRole({ role, context });
    if (role === 'Staff') setSubjectModalOpen(true);
    else setRoleModalOpen(true);
  };

  const handleSubjectSelect = (assignment: StaffAssignment) => {
    setSelectedSubject(assignment);
    setSubjectModalOpen(false);
    setRoleModalOpen(true);
  };

  const handleRoleAuthSuccess = (studentId?: string) => {
    setRoleModalOpen(false);
    if (pendingRole) {
      setCurrentRoleContext(pendingRole.context);
      if (pendingRole.role === 'Faculty Advisor') navigateTo('faculty');
      else if (pendingRole.role === 'Staff') navigateTo('staff_view');
      else if (pendingRole.role === 'Student') {
        if (studentId) setLoggedInStudentId(studentId);
        navigateTo('student_view');
      }
      else if (pendingRole.role === 'HOD') {
        setSelectedHodDeptId(pendingRole.context.deptId);
        navigateTo('hod');
      }
    }
  };

  const handleInitializeNewCycle = (newYear: string, newSem: '1st' | '2nd') => {
    if (window.confirm(`WARNING: Proceed to ${newYear}?`)) {
      const newArchive: AcademicArchive = {
        year: systemConfig.currentYear,
        semester: systemConfig.currentSemester,
        archivedAt: new Date().toISOString(),
        data: { students: JSON.parse(JSON.stringify(students)), departments: JSON.parse(JSON.stringify(departments)) }
      };
      setArchives(prev => [newArchive, ...prev]);
      setSystemConfig(prev => ({ ...prev, currentYear: newYear, currentSemester: newSem }));
      setStudents([]); 
      setAssignmentTracker({});
      setExamResults([]);
      alert(`New academic cycle initialized.`);
      navigateTo('dashboard');
    }
  };

  const activeHodDept = departments.find(d => d.id === selectedHodDeptId);
  const relevantAssignments = pendingRole && pendingRole.role === 'Staff' 
    ? staffAssignments.filter(s => s.departmentId === pendingRole.context.deptId && s.section === pendingRole.context.section)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter']">
      <Header config={systemConfig} />
      
      {isAdminAuthenticated && (
        <div className="bg-rose-600 px-8 py-2.5 flex items-center justify-between text-white shadow-lg relative z-40 animate-in slide-in-from-top duration-300">
           <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 opacity-70" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Administrative Session Active</span>
           </div>
           <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-1.5 bg-white text-rose-600 rounded-full font-black text-[9px] uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm">
              Terminate Session <LogOut className="h-3 w-3" />
           </button>
        </div>
      )}

      <div className="bg-slate-900 px-8 py-3.5 flex items-center justify-start text-white shadow-2xl relative z-30">
         <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 bg-white/5 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-white/5 backdrop-blur-md">
               <CalendarDays className="h-4 w-4 text-indigo-400" /> 
               Session: <span className="text-white ml-1">{systemConfig.currentYear}</span>
            </div>
            <div className="flex items-center gap-3 bg-emerald-500/10 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/5 backdrop-blur-md">
               <RefreshCw className="h-4 w-4 text-emerald-400" /> 
               Semester: <span className="text-white ml-1">{systemConfig.currentSemester} Semester</span>
            </div>
         </div>
      </div>

      {/* Internal Calculator Modal */}
      {calcModalOpen && <InternalCalculator onClose={() => setCalcModalOpen(false)} />}
      
      {subjectModalOpen && <SubjectSelectionModal assignments={relevantAssignments} onSelect={handleSubjectSelect} onClose={() => setSubjectModalOpen(false)} />}
      
      {roleModalOpen && pendingRole && (
        <RoleLoginModal 
          role={pendingRole.role} 
          context={pendingRole.context} 
          students={students} 
          setStudents={setStudents}
          facultyAdvisors={facultyAdvisors} 
          hodAccounts={hodAccounts} 
          staffAccounts={staffAssignments} 
          subjectName={selectedSubject?.subject} 
          onClose={() => setRoleModalOpen(false)} 
          onSuccess={handleRoleAuthSuccess} 
        />
      )}
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          departments={departments} 
          onSelectView={handleSidebarSelect} 
          onRoleSelect={handleRoleSelect} 
          onOpenCalculator={() => setCalcModalOpen(true)} // Passed handler
        />
        
        <main className="flex-1 overflow-y-auto relative flex flex-col">
          <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-lg px-8 py-5 flex items-center justify-between border-b border-slate-200">
             <div className="flex items-center gap-5">
                {currentView !== 'dashboard' && (
                  <button onClick={() => navigateTo('dashboard')} className="p-3 bg-white shadow-sm border border-slate-200 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-slate-500">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                )}
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                  {currentView === 'dashboard' ? 'Insight Hub' : currentView === 'admin' ? 'System Control' : currentView === 'hod' ? `HOD Management` : currentView === 'faculty' ? 'Advisor Console' : currentView === 'staff_view' ? 'Faculty Desk' : 'Student Desk'}
                </h1>
             </div>
             <div className="flex bg-white rounded-2xl p-1.5 shadow-2xl border border-slate-200">
                <button onClick={() => navigateTo('dashboard')} className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${currentView === 'dashboard' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:text-slate-900'}`}>
                   <LayoutDashboard className="h-4 w-4" /> Overview
                </button>
                <button onClick={() => navigateTo('admin')} className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${currentView === 'admin' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:text-slate-900'}`}>
                   <Settings className="h-4 w-4" /> Control Panel
                </button>
             </div>
          </div>

          <div className="flex-1">
            {currentView === 'dashboard' && <Dashboard students={students} departments={departments} />}
            {currentView === 'hod' && activeHodDept && <HODDashboard department={activeHodDept} staffAssignments={staffAssignments} setStaffAssignments={setStaffAssignments} students={students} timeTables={timeTables} departments={departments} />}
            {currentView === 'faculty' && currentRoleContext && <FacultyAdvisorDashboard context={currentRoleContext} students={students} setStudents={setStudents} staffAssignments={staffAssignments} timeTables={timeTables} setTimeTables={setTimeTables} />}
            {currentView === 'staff_view' && selectedSubject && <StaffDashboard assignmentContext={selectedSubject} students={students} setStudents={setStudents} assignmentTracker={assignmentTracker} setAssignmentTracker={setAssignmentTracker} timeTables={timeTables} />}
            {currentView === 'student_view' && currentRoleContext && <StudentDashboard context={currentRoleContext} studentId={loggedInStudentId} students={students} setStudents={setStudents} assignmentTracker={assignmentTracker} timeTables={timeTables} staffAssignments={staffAssignments} />}
            {currentView === 'admin' && (!isAdminAuthenticated ? <Login onLogin={handleAdminLogin} /> : <AdminPanel departments={departments} setDepartments={setDepartments} facultyAdvisors={facultyAdvisors} setFacultyAdvisors={setFacultyAdvisors} hodAccounts={hodAccounts} setHodAccounts={setHodAccounts} staffAssignments={staffAssignments} setStaffAssignments={setStaffAssignments} timeTables={timeTables} setTimeTables={setTimeTables} config={systemConfig} setConfig={setSystemConfig} students={students} setStudents={setStudents} archives={archives} onInitializeNewCycle={handleInitializeNewCycle} />)}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;