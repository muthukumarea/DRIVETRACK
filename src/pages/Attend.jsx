// src/pages/Attend.jsx
import React, { useState, useMemo } from 'react';
import { Card, Btn, Badge, Avatar, Modal, ModalFooter, Field, SectionLabel, SearchInput, Empty } from '../components/UI';
import { addAttendance, updateAttendance } from '../firebase/db';
import { fmtDate, fmt12, calcDuration, todayStr, nowTime } from '../utils/helpers';
import toast from 'react-hot-toast';

const REMARKS = ['On Time','Late','Very Late','Left Early','Make-up Class','Absent'];

export default function Attend({ students, attendance, instructors, onRefresh, writeAuditLog, user }) {
  const [search,      setSearch]      = useState('');
  const [selected,    setSelected]    = useState(null);
  const [selInst,     setSelInst]     = useState('');
  const [form,        setForm]        = useState({ date:todayStr(), timeIn:nowTime(), timeOut:'', remark:'On Time', notes:'' });
  const [saving,      setSaving]      = useState(false);
  const [editSession, setEditSession] = useState(null);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return students.filter(s=>(s.name||'').toLowerCase().includes(q)||(s.phone||'').includes(q)).slice(0,6);
  }, [search, students]);

  const prevSessions = useMemo(() =>
    !selected ? [] : attendance.filter(a=>a.studentId===selected.id).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)),
    [selected, attendance]
  );

  const getInstructor = id => instructors.find(i=>i.id===id);

  function pick(s) { setSelected(s); setSearch(s.name); }
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  async function handleSave() {
    if (!selected) { toast.error('Select a student first'); return; }
    if (!selInst)  { toast.error('Select an instructor'); return; }
    if (!form.date||!form.timeIn) { toast.error('Date and Time In required'); return; }
    setSaving(true);
    const inst = getInstructor(selInst);
    try {
      const ref = await addAttendance({ ...form, studentId:selected.id, studentName:selected.name, instructorId:selInst, instructorName:inst?.name||'', loggedBy:user?.name||'Admin' });
      if (writeAuditLog) {
        await writeAuditLog({
          action: 'MARK_ATTENDANCE',
          entity: 'attendance',
          entityId: ref?.id,
          adminId: user?.id,
          adminName: user?.name,
          details: {
            studentName: selected.name,
            instructorName: inst?.name || '',
            date: form.date,
            timeIn: form.timeIn,
            remark: form.remark,
          },
        });
      }
      toast.success('✅ Attendance saved!');
      setForm(f=>({...f, timeOut:'', notes:''}));
      onRefresh();
    } catch(e) { toast.error('Error saving. Check Firebase.'); }
    setSaving(false);
  }

  async function handleEditSave() {
    if (!editSession) return;
    setSaving(true);
    try {
      await updateAttendance(editSession.id, { date:editSession.date, timeIn:editSession.timeIn, timeOut:editSession.timeOut, remark:editSession.remark, notes:editSession.notes, instructorId:editSession.instructorId });
      toast.success('Session updated!'); setEditSession(null); onRefresh();
    } catch(e) { toast.error('Error updating'); }
    setSaving(false);
  }

  return (
    <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Search */}
      <Card>
        <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:3 }}>Mark Attendance</div>
        <div style={{ fontSize:12, color:'var(--text3)', marginBottom:14 }}>Search student → select instructor → log session</div>
        <SearchInput placeholder="Search student by name or phone…" value={search} onChange={v=>{ setSearch(v); if(!v) setSelected(null); }} />

        {/* Search results */}
        {searchResults.length > 0 && !selected && (
          <div style={{ marginTop:8 }}>
            {searchResults.map(s=>(
              <div key={s.id} onClick={()=>pick(s)} style={{ display:'flex', alignItems:'center', gap:11, padding:'10px 12px', borderRadius:10, cursor:'pointer', border:'1px solid var(--border)', marginBottom:6, background:'rgba(255,255,255,0.02)', transition:'all 0.12s' }}>
                <Avatar name={s.name} size="sm" />
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13.5, color:'var(--text)' }}>{s.name}</div>
                  <div style={{ fontSize:11.5, color:'var(--text3)' }}>{s.phone} · {s.licenseType||'—'}</div>
                </div>
                <Badge label={s.status} type="status" />
              </div>
            ))}
          </div>
        )}

        {/* Selected student */}
        {selected && (
          <div style={{ background:'rgba(59,123,255,0.07)', border:'1px solid rgba(59,123,255,0.2)', borderRadius:12, padding:'12px 14px', display:'flex', alignItems:'center', gap:12, marginTop:12 }}>
            <Avatar name={selected.name} size="md" />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text)' }}>{selected.name}</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>📞 {selected.phone} · {selected.licenseType||'—'}</div>
              <div style={{ marginTop:5 }}><Badge label={selected.status} type="status" /></div>
            </div>
            <button onClick={()=>{ setSelected(null); setSearch(''); }} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid var(--border2)', borderRadius:8, padding:'5px 10px', color:'var(--text3)', cursor:'pointer', fontSize:12, fontFamily:'var(--font)' }}>✕</button>
          </div>
        )}
      </Card>

      {/* Instructor selector (always visible when student selected) */}
      {selected && (
        <Card className="fade-up">
          <SectionLabel>Select Instructor *</SectionLabel>
          {!instructors.length
            ? <Empty icon="👤" text="No instructors found. Add some in Settings." />
            : <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9 }}>
                {instructors.map(inst=>(
                  <div key={inst.id} onClick={()=>setSelInst(inst.id)} style={{ padding:'11px 12px', borderRadius:10, border:`1.5px solid ${selInst===inst.id?'var(--blue)':'var(--border2)'}`, background: selInst===inst.id?'rgba(59,123,255,0.1)':'rgba(255,255,255,0.02)', cursor:'pointer', transition:'all 0.15s' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                      <Avatar name={inst.name} size="sm" color={selInst===inst.id?'linear-gradient(135deg,#3B7BFF,#6C8FFF)':undefined} />
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, color: selInst===inst.id?'var(--text)':'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{inst.name}</div>
                        <div style={{ fontSize:10.5, color:'var(--text3)', marginTop:1 }}>{inst.vehicle||'—'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </Card>
      )}

      {/* Session form */}
      {selected && selInst && (
        <Card className="fade-up">
          <SectionLabel>Session Details</SectionLabel>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Date *"><input type="date" value={form.date} onChange={set('date')} /></Field>
            <Field label="Remark">
              <select value={form.remark} onChange={set('remark')}>
                {REMARKS.map(r=><option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Time In *"><input type="time" value={form.timeIn}  onChange={set('timeIn')} /></Field>
            <Field label="Time Out">  <input type="time" value={form.timeOut} onChange={set('timeOut')} /></Field>
          </div>
          <Field label="Notes (optional)" style={{marginTop:12}}>
            <input value={form.notes} onChange={set('notes')} placeholder="e.g. Good progress on parking…" />
          </Field>
          <div style={{ marginTop:12, padding:'10px 12px', background:'rgba(59,123,255,0.07)', borderRadius:10, border:'1px solid rgba(59,123,255,0.15)', fontSize:12, color:'var(--text3)' }}>
            👤 Instructor: <span style={{ color:'var(--blue2)', fontWeight:600 }}>{getInstructor(selInst)?.name}</span> · Logged by: <span style={{ color:'var(--text2)' }}>{user?.name}</span>
          </div>
          <Btn full onClick={handleSave} disabled={saving} style={{ marginTop:14, padding:13, fontSize:14.5 }}>
            {saving ? 'Saving…' : '✓ Save Attendance'}
          </Btn>
        </Card>
      )}

      {/* Previous sessions */}
      {selected && (
        <Card className="fade-up">
          <div style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:3 }}>Previous Sessions</div>
          <div style={{ fontSize:12, color:'var(--text3)', marginBottom:12 }}>{prevSessions.length} session{prevSessions.length!==1?'s':''} recorded</div>
          {!prevSessions.length
            ? <Empty icon="📭" text="No previous sessions" />
            : prevSessions.map(a => {
                const inst = getInstructor(a.instructorId);
                return (
                  <div key={a.id} style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'11px 0', borderBottom:'1px solid var(--border)', gap:10 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13.5, fontWeight:600, color:'var(--text)' }}>{fmtDate(a.date)}</div>
                      <div style={{ fontSize:11.5, color:'var(--text3)', fontFamily:'var(--mono)', marginTop:2 }}>{fmt12(a.timeIn)} → {fmt12(a.timeOut)}</div>
                      {inst && <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>👤 {inst.name}</div>}
                      {a.notes && <div style={{ fontSize:11, color:'var(--text3)', marginTop:3 }}>📝 {a.notes}</div>}
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5 }}>
                      <Badge label={a.remark} />
                      {calcDuration(a.timeIn,a.timeOut) && <span style={{ fontSize:10.5, color:'var(--teal)', fontFamily:'var(--mono)', background:'rgba(0,201,167,0.1)', padding:'1px 7px', borderRadius:20 }}>{calcDuration(a.timeIn,a.timeOut)}</span>}
                      <Btn variant="ghost" size="sm" onClick={()=>setEditSession({...a})}>✏️ Edit</Btn>
                    </div>
                  </div>
                );
              })
          }
        </Card>
      )}

      {/* Edit session modal */}
      <Modal open={!!editSession} onClose={()=>setEditSession(null)} title="Edit Session">
        {editSession && <>
          <Field label="Date"><input type="date" value={editSession.date} onChange={e=>setEditSession(s=>({...s,date:e.target.value}))} /></Field>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12 }}>
            <Field label="Time In"> <input type="time" value={editSession.timeIn}    onChange={e=>setEditSession(s=>({...s,timeIn:e.target.value}))} /></Field>
            <Field label="Time Out"><input type="time" value={editSession.timeOut||''} onChange={e=>setEditSession(s=>({...s,timeOut:e.target.value}))} /></Field>
          </div>
          <Field label="Instructor" style={{marginTop:12}}>
            <select value={editSession.instructorId||''} onChange={e=>setEditSession(s=>({...s,instructorId:e.target.value}))}>
              <option value="">— Select —</option>
              {instructors.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </Field>
          <Field label="Remark" style={{marginTop:12}}>
            <select value={editSession.remark} onChange={e=>setEditSession(s=>({...s,remark:e.target.value}))}>
              {REMARKS.map(r=><option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Notes" style={{marginTop:12}}>
            <input value={editSession.notes||''} onChange={e=>setEditSession(s=>({...s,notes:e.target.value}))} placeholder="Notes…" />
          </Field>
          <ModalFooter>
            <Btn variant="ghost" onClick={()=>setEditSession(null)}>Cancel</Btn>
            <Btn onClick={handleEditSave} disabled={saving}>{saving?'Saving…':'Save Changes'}</Btn>
          </ModalFooter>
        </>}
      </Modal>
    </div>
  );
}
