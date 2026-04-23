// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { listenStudents, listenAttendance, listenSchedules, listenInstructors, listenAuditLogs, writeAuditLog } from './firebase/db';
import BottomNav from './components/BottomNav';
import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import Schedule   from './pages/Schedule';
import Students   from './pages/Students';
import Attend     from './pages/Attend';
import Records    from './pages/Records';
import AuditLog   from './pages/AuditLog';
import { Spinner } from './components/UI';
import './index.css';

const PAGE_INFO = {
  dashboard: ['EKR Driving Institute Attendance Tracker', ''],
  schedule:  ['Class Schedule', 'Manage daily slots'],
  students:  ['Students', 'Enrolled student registry'],
  attend:    ['Mark Attendance', 'Log a session'],
  records:   ['Records', 'All attendance history'],
  auditlog:  ['Audit Logs', 'Track every admin action'],
};

function Inner() {
  const { user } = useAuth();
  const [page,        setPage]        = useState('dashboard');
  const [students,    setStudents]    = useState([]);
  const [attendance,  setAttendance]  = useState([]);
  const [schedules,   setSchedules]   = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [auditLogs,   setAuditLogs]   = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const fallback = setTimeout(() => setLoading(false), 5000);
    // Real-time listeners — all 5 admins see updates instantly
    const u1 = listenStudents(data    => { setStudents(data);    setLoading(false); });
    const u2 = listenAttendance(data  => setAttendance(data));
    const u3 = listenSchedules(data   => setSchedules(data));
    const u4 = listenInstructors(data => setInstructors(data));
    const u5 = listenAuditLogs(data   => setAuditLogs(data));
    return () => { clearTimeout(fallback); u1(); u2(); u3(); u4(); u5(); };
  }, [user]);

  if (!user) return <Login />;

  const [title] = PAGE_INFO[page] || ['EKR Driving Institute Attendance Tracker', ''];

  const refresh = () => {}; // listeners auto-refresh in real-time

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100dvh', minHeight:0, background:'var(--bg)', overflow:'hidden' }}>
      {/* Top bar */}
      <div style={{ flexShrink:0, background:'rgba(10,15,30,0.95)', backdropFilter:'blur(14px)', borderBottom:'1px solid var(--border)', padding:'12px 16px', paddingTop:`max(12px, calc(var(--safe-top) + 8px))`, display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ fontSize:18, fontWeight:800, color:'var(--text)', letterSpacing:-0.4 }}>{title}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--green)', animation:'pulse 1.5s ease infinite' }} />
          <span style={{ fontSize:11, color:'var(--text3)' }}>{user.name}</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex:1, minHeight:0, overflowY:'auto', overscrollBehavior:'contain', scrollPadding:'24px 0 140px', padding:'14px 14px 120px', WebkitOverflowScrolling:'touch' }}>
        {loading
          ? <Spinner />
          : <>
              {page==='dashboard' && <Dashboard students={students} attendance={attendance} schedules={schedules}  instructors={instructors} onNav={setPage} />}
              {page==='schedule'  && <Schedule  schedules={schedules}  students={students}  instructors={instructors} onRefresh={refresh} writeAuditLog={writeAuditLog} user={user} />}
              {page==='students'  && <Students  students={students}    attendance={attendance} onRefresh={refresh} writeAuditLog={writeAuditLog} user={user} />}
              {page==='attend'    && <Attend    students={students}    attendance={attendance} instructors={instructors} onRefresh={refresh} writeAuditLog={writeAuditLog} user={user} />}
              {page==='records'   && <Records   students={students}    attendance={attendance} instructors={instructors} onRefresh={refresh} writeAuditLog={writeAuditLog} user={user} />}
              {page==='auditlog'  && <AuditLog  logs={auditLogs} />}
            </>
        }
        <div style={{ height:14 }} />
      </div>

      {/* Bottom nav */}
      <BottomNav active={page} onNav={setPage} />

      <Toaster position="top-center" toastOptions={{ duration:2400, style:{ background:'var(--bg2)', color:'var(--text)', border:'1px solid var(--border2)', fontFamily:'var(--font)', fontSize:13.5, borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.5)' } }} />
    </div>
  );
}

export default function App() {
  return <AuthProvider><Inner /></AuthProvider>;
}
