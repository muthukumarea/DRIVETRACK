// src/pages/Dashboard.jsx
import React, { useMemo } from 'react';
import { StatCard, Card, Badge, Avatar, Empty, LiveDot } from '../components/UI';
import { fmtDate, fmt12, calcDuration, todayStr, REMARK_COLORS } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function Dashboard({ students, attendance, schedules, instructors, onNav }) {
  const { user, logout } = useAuth();
  const today = todayStr();

  const stats = useMemo(() => {
    const todayAtt = attendance.filter(a => a.date === today);
    const todaySlots = schedules.filter(s => s.date === today);
    return {
      total:     students.length,
      active:    students.filter(s => s.status === 'Active').length,
      todayAtt:  todayAtt.length,
      available: todaySlots.filter(s => s.status === 'available').length,
      booked:    todaySlots.filter(s => s.status === 'booked').length,
    };
  }, [students, attendance, schedules, today]);

  const recentAtt = useMemo(() =>
    [...attendance].sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)).slice(0,6),
    [attendance]
  );

  const todayScheduled = useMemo(() =>
    schedules.filter(s => s.date === today && s.studentId).sort((a,b)=>a.timeIn?.localeCompare(b.timeIn)),
    [schedules, today]
  );

  const getStudent   = id => students.find(s=>s.id===id);
  const getInstructor= id => instructors.find(i=>i.id===id);

  const remarkCounts = useMemo(() => {
    const keys = Object.keys(REMARK_COLORS);
    return keys.map(k => ({
      key:k, count:attendance.filter(a=>a.remark===k).length,
      pct: attendance.length ? Math.round(attendance.filter(a=>a.remark===k).length/attendance.length*100) : 0,
      color: REMARK_COLORS[k].color,
    })).filter(x=>x.count>0);
  }, [attendance]);

  return (
    <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Greeting */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontSize:18, fontWeight:700, color:'var(--text)' }}>Hello, {user?.name?.split(' ')[0]} 👋</div>
          <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <LiveDot />
          <button onClick={logout} style={{ background:'rgba(255,92,92,0.1)', border:'1px solid rgba(255,92,92,0.2)', color:'var(--red)', borderRadius:8, padding:'5px 11px', cursor:'pointer', fontSize:12, fontFamily:'var(--font)' }}>Sign Out</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <StatCard label="Total Students" value={stats.total}    sub="Enrolled"       color="var(--blue)"  />
        <StatCard label="Active"         value={stats.active}   sub="Training now"   color="var(--green)" />
        <StatCard label="Today's Classes"value={stats.todayAtt} sub="Sessions logged" color="var(--teal)" />
        <StatCard label="Slots Open"     value={stats.available}sub="Available today" color="var(--amber)" />
      </div>

      {/* Today's schedule preview */}
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>Today's Bookings</div>
          <button onClick={()=>onNav('schedule')} style={{ fontSize:12, color:'var(--blue2)', background:'none', border:'none', cursor:'pointer' }}>View all →</button>
        </div>
        {!todayScheduled.length
          ? <Empty icon="📅" text="No bookings for today yet" />
          : todayScheduled.slice(0,5).map(slot => {
              const st   = getStudent(slot.studentId);
              const inst = getInstructor(slot.instructorId);
              return (
                <div key={slot.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ width:54, flexShrink:0, textAlign:'center' }}>
                    <div style={{ fontSize:11, fontWeight:600, fontFamily:'var(--mono)', color:'var(--blue2)' }}>{fmt12(slot.timeIn)}</div>
                    <div style={{ fontSize:9.5, color:'var(--text3)', marginTop:1 }}>{fmt12(slot.timeOut)}</div>
                  </div>
                  <Avatar name={st?.name||'?'} size="sm" />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{st?.name||'—'}</div>
                    <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>👤 {inst?.name||'—'}</div>
                  </div>
                  <Badge label={slot.status==='booked'?'Booked':'Done'} />
                </div>
              );
            })
        }
      </Card>

      {/* Remark breakdown */}
      {remarkCounts.length > 0 && (
        <Card>
          <div style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:14 }}>Attendance Breakdown</div>
          {remarkCounts.map(r => (
            <div key={r.key} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:12.5, color:'var(--text2)' }}>{r.key}</span>
                <span style={{ fontFamily:'var(--mono)', fontSize:11.5, color:'var(--text3)' }}>{r.count} ({r.pct}%)</span>
              </div>
              <div style={{ height:4, background:'rgba(255,255,255,0.05)', borderRadius:4, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${r.pct}%`, background:r.color, borderRadius:4, transition:'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Recent attendance */}
      <Card style={{ marginBottom:8 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>Recent Sessions</div>
          <button onClick={()=>onNav('records')} style={{ fontSize:12, color:'var(--blue2)', background:'none', border:'none', cursor:'pointer' }}>See all →</button>
        </div>
        {!recentAtt.length
          ? <Empty icon="📭" text="No sessions yet" />
          : recentAtt.map(a => {
              const nm = a.studentName || getStudent(a.studentId)?.name || 'Unknown';
              const inst = getInstructor(a.instructorId);
              return (
                <div key={a.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
                  <Avatar name={nm} size="sm" />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{nm}</div>
                    <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{fmtDate(a.date)} · {inst?.name||'—'}</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                    <Badge label={a.remark} />
                    {calcDuration(a.timeIn,a.timeOut) && <span style={{ fontSize:10.5, color:'var(--teal)', fontFamily:'var(--mono)', background:'rgba(0,201,167,0.1)', padding:'1px 7px', borderRadius:20 }}>{calcDuration(a.timeIn,a.timeOut)}</span>}
                  </div>
                </div>
              );
            })
        }
      </Card>
    </div>
  );
}
