
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Student, DepartmentStructure } from '../types';
import { 
  Users, Clock, GraduationCap, 
  CheckCircle2, AlertCircle, History, TrendingUp, BarChart3, CalendarDays,
  Percent, Activity, Zap, RefreshCcw, LayoutDashboard, Database
} from 'lucide-react';

interface DashboardProps {
  students: Student[];
  departments: DepartmentStructure[];
}

const Dashboard: React.FC<DashboardProps> = ({ students, departments }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- REACTIVE ANALYTICS ENGINE ---
  const analytics = useMemo(() => {
    const total = students.length;
    if (total === 0) return { 
      pass: 0, arrear: 0, ra: 0, 
      passPerc: 0, arrearPerc: 0, raPerc: 0, 
      avgAttendance: 0,
      totalResultEntered: 0
    };

    let pass = 0;
    let arrear = 0;
    let ra = 0;
    let resultEnteredCount = 0;
    let totalAttendance = 0;

    students.forEach(s => {
      totalAttendance += (s.attendancePercentage || 0);
      
      if (s.semesterResultDetailed) {
        resultEnteredCount++;
        const gpa = parseFloat(s.semesterResultDetailed.gpa || '0');
        if (gpa >= 5.0) pass++;
        else if (gpa > 0) arrear++;
        else ra++;
      }
    });

    // Percentages are relative to students who actually ENTERED results
    const divisor = resultEnteredCount || 1;

    return {
      pass,
      arrear,
      ra,
      passPerc: resultEnteredCount ? Math.round((pass / divisor) * 100) : 0,
      arrearPerc: resultEnteredCount ? Math.round((arrear / divisor) * 100) : 0,
      raPerc: resultEnteredCount ? Math.round((ra / divisor) * 100) : 0,
      avgAttendance: Math.round(totalAttendance / total),
      totalResultEntered: resultEnteredCount
    };
  }, [students]);

  const gradeDistribution = useMemo(() => {
    const counts: Record<string, number> = { 'O': 0, 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'U': 0, 'RA': 0 };
    students.forEach(s => {
      if (s.semesterResultDetailed) {
        // Use the most recent grade from detailed results if available
        const latestGrade = s.semesterResultDetailed.subjects[0]?.grade || s.grade;
        if (counts[latestGrade] !== undefined) counts[latestGrade]++;
      } else if (counts[s.grade] !== undefined) {
        // Fallback to initial grade but only if it's not a fresh enrollment
        counts[s.grade]++;
      }
    });
    return Object.keys(counts).map(key => ({ name: key, count: counts[key] }));
  }, [students]);

  const departmentPerformance = useMemo(() => {
    return departments.map(dept => {
      const deptStudents = students.filter(s => 
        s.department.toLowerCase() === dept.id.toLowerCase() || 
        s.department === dept.name
      );
      
      if (deptStudents.length === 0) return { name: dept.name, performance: 0, attendance: 0 };

      const studentsWithResults = deptStudents.filter(s => s.semesterResultDetailed);
      const passCount = studentsWithResults.filter(s => parseFloat(s.semesterResultDetailed?.gpa || '0') >= 5.0).length;
      
      const passRate = studentsWithResults.length ? (passCount / studentsWithResults.length) * 100 : 0;
      const avgAttendance = deptStudents.reduce((acc, s) => acc + (s.attendancePercentage || 0), 0) / deptStudents.length;

      // Weighted Performance Index: 60% Results + 40% Attendance
      const performanceIndex = Math.round((passRate * 0.6) + (avgAttendance * 0.4));

      return {
        name: dept.name.length > 18 ? dept.name.substring(0, 16) + '...' : dept.name,
        performance: performanceIndex,
        attendance: Math.round(avgAttendance)
      };
    });
  }, [students, departments]);

  const pieData = [
    { name: 'Pass', value: analytics.pass, color: '#10b981' },
    { name: 'Arrear', value: analytics.arrear, color: '#f59e0b' },
    { name: 'RA', value: analytics.ra, color: '#ef4444' }
  ].filter(d => d.value > 0);

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1700px] mx-auto bg-slate-50/30 min-h-screen">
      
      {/* TOP ROW: BENTO WELCOME & CLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 relative overflow-hidden bg-slate-900 rounded-[3.5rem] p-10 lg:p-14 text-white shadow-2xl border border-white/5">
          <div className="absolute -right-20 -top-20 opacity-10 pointer-events-none rotate-12">
            <Database className="w-96 h-96 text-indigo-400" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 backdrop-blur-xl px-5 py-2.5 rounded-full text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-8 border border-white/10">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></span>
              Live Data Stream Active
            </div>
            <h2 className="text-5xl lg:text-7xl font-black mb-6 tracking-tighter leading-none">
              Institutional <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-emerald-300 to-indigo-300 animate-gradient-x">Insights Hub</span>
            </h2>
            <div className="flex items-center gap-6 mt-4">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Session</span>
                  <span className="text-lg font-bold text-white">2025 - 2026 Academic Year</span>
               </div>
               <div className="w-[1px] h-10 bg-white/10"></div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Connected Depts</span>
                  <span className="text-lg font-bold text-emerald-400">{departments.length} Units</span>
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-[3.5rem] shadow-xl border border-slate-100 p-10 flex flex-col justify-center items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Network Time Protocol</p>
            <h3 className="text-6xl font-black text-slate-900 tabular-nums tracking-tighter">
              {currentTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </h3>
            <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold uppercase text-[11px] tracking-widest bg-indigo-50 px-4 py-2 rounded-2xl mt-4">
              <CalendarDays className="h-4 w-4" />
              {currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
          <div className="absolute bottom-6 flex items-center gap-2">
             <RefreshCcw className="h-3 w-3 text-emerald-500 animate-spin-slow" />
             <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Global Sync in Progress</span>
          </div>
        </div>
      </div>

      {/* QUICK METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Strength', val: students.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Avg Attendance', val: `${analytics.avgAttendance}%`, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pass Percent', val: `${analytics.passPerc}%`, icon: GraduationCap, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Reporting Units', val: departments.length, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100 flex items-center gap-6 group hover:shadow-2xl transition-all hover:-translate-y-1">
            <div className={`h-16 w-16 ${stat.bg} ${stat.color} rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
              <stat.icon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-4xl font-black text-slate-900 tabular-nums leading-none mt-1">{stat.val}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* ACADEMIC RESULT MATRIX */}
        <div className="xl:col-span-2 bg-white p-10 lg:p-14 rounded-[4rem] shadow-2xl border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            <div>
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Result Summary Matrix</h3>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                 <RefreshCcw className="h-3 w-3" /> Based on {analytics.totalResultEntered} student updates
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-3xl text-center min-w-[100px]">
                 <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Pass Rate</p>
                 <p className="text-2xl font-black text-slate-800">{analytics.passPerc}%</p>
              </div>
              <div className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-3xl text-center min-w-[100px]">
                 <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Backlogs</p>
                 <p className="text-2xl font-black text-slate-800">{analytics.arrearPerc + analytics.raPerc}%</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="h-80 w-full lg:w-1/2 relative flex items-center justify-center">
              {analytics.totalResultEntered > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      cx="50%" cy="50%" 
                      innerRadius={85} outerRadius={135} 
                      paddingAngle={10} dataKey="value" stroke="none"
                    >
                      {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                      itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-64 h-64 rounded-full border-8 border-dashed border-slate-100 flex flex-col items-center justify-center text-center p-8">
                   <Database className="h-10 w-10 text-slate-200 mb-4" />
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">Awaiting Semester Result Uploads from Students</p>
                </div>
              )}
              {analytics.totalResultEntered > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span className="text-5xl font-black text-slate-900 tabular-nums">{analytics.passPerc}%</span>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Institution GPA</span>
                </div>
              )}
            </div>

            <div className="w-full lg:w-1/2 space-y-6">
               {[
                 { label: 'Pass Students', count: analytics.pass, color: 'text-emerald-500', icon: CheckCircle2, desc: 'Eligible for session advancement' },
                 { label: 'Active Arrears', count: analytics.arrear, color: 'text-amber-500', icon: AlertCircle, desc: 'Subjects needing re-assessment' },
                 { label: 'Re-Arrear (RA)', count: analytics.ra, color: 'text-rose-500', icon: History, desc: 'Critical support required' }
               ].map((item, i) => (
                 <div key={i} className="p-7 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-2xl hover:border-indigo-100 transition-all cursor-default">
                    <div className="flex items-center gap-5">
                       <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${item.color.replace('text', 'bg').replace('500', '100')} ${item.color} shadow-sm group-hover:scale-110 transition-transform`}>
                          <item.icon className="h-6 w-6" />
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.label}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.desc}</p>
                       </div>
                    </div>
                    <span className={`text-3xl font-black ${item.color} tabular-nums`}>{item.count}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* DEPT PERFORMANCE RANKING */}
        <div className="bg-slate-900 p-12 rounded-[4rem] shadow-2xl text-white relative overflow-hidden group border border-white/5">
           <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-40 w-40" />
           </div>
           <h3 className="text-xl font-black uppercase tracking-[0.1em] mb-12 flex items-center gap-4">
              <Zap className="h-6 w-6 text-emerald-400" /> Success Scoreboard
           </h3>
           <div className="space-y-10 relative z-10">
              {departmentPerformance.length === 0 ? (
                 <div className="py-32 text-center border-4 border-dashed border-white/10 rounded-[3rem]">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Setup Hierarchy to Track</p>
                 </div>
              ) : (
                departmentPerformance.map((dept, i) => (
                   <div key={i} className="space-y-3">
                      <div className="flex justify-between items-end">
                         <div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-1">Sector Analysis</span>
                            <span className="text-sm font-black uppercase text-white leading-none">{dept.name}</span>
                         </div>
                         <div className="text-right">
                            <span className="text-2xl font-black text-emerald-400 block leading-none">{dept.performance}%</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">DPI Index</span>
                         </div>
                      </div>
                      <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                         <div 
                           className="h-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(52,211,153,0.2)]" 
                           style={{ width: `${dept.performance}%` }}
                         />
                      </div>
                      <div className="flex justify-between items-center px-1">
                         <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em]">Attendance: {dept.attendance}%</span>
                         <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Live Status</span>
                      </div>
                   </div>
                ))
              )}
           </div>
           <div className="mt-14 pt-8 border-t border-white/5 flex items-center justify-center gap-3">
              <RefreshCcw className="h-3.5 w-3.5 text-slate-600" />
              <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider text-center">
                 Sync: Integrated results & attendance telemetry
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* GRADE FREQUENCY CURVE */}
         <div className="bg-white p-12 lg:p-14 rounded-[4rem] shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-12">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Grade Curve Analysis</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                     <Database className="h-3 w-3" /> Real-time Grade Distribution
                  </p>
               </div>
               <BarChart3 className="h-7 w-7 text-indigo-200" />
            </div>
            <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis 
                       dataKey="name" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fontSize: 11, fontWeight: 900, fill: '#64748b'}} 
                     />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                     <Tooltip 
                       cursor={{fill: '#f8fafc'}}
                       contentStyle={{ borderRadius: '18px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                     />
                     <Bar dataKey="count" fill="#4f46e5" radius={[12, 12, 0, 0]} barSize={50}>
                        {gradeDistribution.map((entry, index) => (
                           <Cell 
                             key={index} 
                             fill={entry.count > 0 ? (entry.name === 'O' || entry.name === 'A+' ? '#10b981' : entry.name === 'RA' ? '#ef4444' : '#4f46e5') : '#f1f5f9'} 
                           />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* TOTAL COLLEGE ATTENDANCE STANDING */}
         <div className="bg-white p-12 lg:p-14 rounded-[4rem] shadow-xl border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-16 opacity-5 rotate-12 scale-150 pointer-events-none">
               <Activity className="h-64 w-64" />
            </div>
            
            <div className="h-24 w-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white mb-8 shadow-2xl group-hover:scale-110 transition-transform">
               <Activity className="h-12 w-12" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">College Attendance Standing</h3>
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] mb-12">Session: 2025 - 2026</p>
            
            <div className="relative h-72 w-72 flex items-center justify-center">
               <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="9" />
                  <circle 
                    cx="50" cy="50" r="45" fill="none" 
                    stroke="url(#attendanceGradient)" strokeWidth="9" 
                    strokeDasharray={`${analytics.avgAttendance * 2.82}, 282`} 
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="attendanceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-7xl font-black text-slate-900 tabular-nums">{analytics.avgAttendance}%</span>
                  <span className={`text-[11px] font-black uppercase tracking-[0.3em] mt-3 px-5 py-2 rounded-full border shadow-sm ${analytics.avgAttendance >= 75 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                     {analytics.avgAttendance >= 75 ? 'Optimal' : 'Intervention'}
                  </span>
               </div>
            </div>
            
            <div className="mt-12 p-8 bg-slate-50 rounded-[3rem] border border-slate-100 w-full flex justify-between items-center group-hover:bg-white group-hover:shadow-xl transition-all">
               <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Refresh Cycle</p>
                  <p className="text-sm font-black text-slate-800 flex items-center gap-2 mt-1">
                     <Clock className="h-4 w-4 text-indigo-600" />
                     14H : 32M : 11S
                  </p>
               </div>
               <div className="h-10 w-[1px] bg-slate-200"></div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Database Health</p>
                  <div className="flex items-center gap-2 justify-end mt-1">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                     <p className="text-sm font-black text-emerald-600 uppercase">Synchronized</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
