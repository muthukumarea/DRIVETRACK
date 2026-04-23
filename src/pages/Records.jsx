// src/pages/Records.jsx
import React, { useState, useMemo } from 'react';
import { Card, Btn, Badge, Avatar, Modal, ModalFooter, Field, Empty, SearchInput } from '../components/UI';
import { updateAttendance, deleteAttendance } from '../firebase/db';
import { fmtDate, fmt12, calcDuration } from '../utils/helpers';
import toast from 'react-hot-toast';

const REMARKS = ['On Time','Late','Very Late','Left Early','Make-up Class','Absent'];

export default function Records({ students, attendance, instructors, onRefresh, writeAuditLog, user }) {
  const [search,   setSearch]   = useState('');
  const [remarkF,  setRemarkF]  = useState('');
  const [dateF,    setDateF]    = useState('');
  const [instF,    setInstF]    = useState('');
  const [editSess, setEditSess] = useState(null);
  const [saving,   setSaving]   = useState(false);

  const getStudent    = id => students.find(s=>s.id===id);
  const getInstructor = id => instructors.find(i=>i.id===id);

  const filtered = useMemo(() => {
    let list = [...attendance].sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    if (search)  { const q=search.toLowerCase(); list=list.filter(a=>{ const s=students.find(st=>st.id===a.studentId); return s&&((s.name||'').toLowerCase().includes(q)||(s.phone||'').includes(q)); }); }
    if (remarkF) list=list.filter(a=>a.remark===remarkF);
    if (dateF)   list=list.filter(a=>a.date===dateF);
    if (instF)   list=list.filter(a=>a.instructorId===instF);
    return list;
  }, [attendance,students,search,remarkF,dateF,instF]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this session?')) return;
    try {
      await deleteAttendance(id);
      if (writeAuditLog) {
        await writeAuditLog({
          action: 'DELETE',
          entity: 'attendance',
          entityId: id,
          adminId: user?.id,
          adminName: user?.name,
          details: {
            description: 'Deleted attendance record',
          },
        });
      }
      toast.success('Deleted'); onRefresh();
    }
    catch(e) { toast.error('Error deleting'); }
  }

  async function handleEditSave() {
    setSaving(true);
    try {
      await updateAttendance(editSess.id, { date:editSess.date, timeIn:editSess.timeIn, timeOut:editSess.timeOut, remark:editSess.remark, notes:editSess.notes, instructorId:editSess.instructorId });
      if (writeAuditLog) {
        await writeAuditLog({
          action: 'UPDATE',
          entity: 'attendance',
          entityId: editSess.id,
          adminId: user?.id,
          adminName: user?.name,
          details: {
            description: 'Updated attendance record',
            remark: editSess.remark,
            date: editSess.date,
          },
        });
      }
      toast.success('Updated!'); setEditSess(null); onRefresh();
    } catch(e) { toast.error('Error'); }
    setSaving(false);
  }

  const onTime = filtered.filter(a=>a.remark==='On Time').length;
  const late   = filtered.filter(a=>a.remark==='Late'||a.remark==='Very Late').length;

  return (
    <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <Card>
        <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:14 }}>All Records</div>
        <SearchInput placeholder="Search student…" value={search} onChange={setSearch} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:10 }}>
          <select value={remarkF} onChange={e=>setRemarkF(e.target.value)} style={{ fontSize:12.5 }}>
            <option value="">All Remarks</option>
            {REMARKS.map(r=><option key={r}>{r}</option>)}
          </select>
          <select value={instF} onChange={e=>setInstF(e.target.value)} style={{ fontSize:12.5 }}>
            <option value="">All Instructors</option>
            {instructors.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        <input type="date" value={dateF} onChange={e=>setDateF(e.target.value)} style={{ marginTop:8, fontSize:12.5 }} />
        {(search||remarkF||dateF||instF) && (
          <button onClick={()=>{setSearch('');setRemarkF('');setDateF('');setInstF('');}} style={{ marginTop:8, background:'none', border:'none', color:'var(--blue2)', cursor:'pointer', fontSize:12, fontFamily:'var(--font)' }}>✕ Clear filters</button>
        )}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:12 }}>
          {[{l:`${filtered.length} sessions`,c:'var(--text3)'},{l:`${onTime} on time`,c:'var(--green)'},{l:`${late} late`,c:'var(--amber)'}].map(x=>(
            <span key={x.l} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:20, padding:'3px 11px', fontSize:11.5, color:x.c }}>{x.l}</span>
          ))}
        </div>
      </Card>

      {!filtered.length
        ? <Card><Empty icon="📋" text="No records match your filters" /></Card>
        : filtered.map(a => {
            const s    = getStudent(a.studentId);
            const name = s?.name || a.studentName || 'Unknown';
            const inst = getInstructor(a.instructorId);
            return (
              <Card key={a.id}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:11 }}>
                  <Avatar name={name} size="sm" />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                      <div>
                        <div style={{ fontSize:13.5, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160 }}>{name}</div>
                        <div style={{ fontSize:11.5, color:'var(--text3)', marginTop:2 }}>{fmtDate(a.date)}</div>
                      </div>
                      <Badge label={a.remark} />
                    </div>
                    <div style={{ display:'flex', gap:10, alignItems:'center', marginTop:7, flexWrap:'wrap' }}>
                      <span style={{ fontSize:12, color:'var(--text3)', fontFamily:'var(--mono)' }}>🕐 {fmt12(a.timeIn)} → {fmt12(a.timeOut)}</span>
                      {calcDuration(a.timeIn,a.timeOut) && <span style={{ fontSize:10.5, color:'var(--teal)', fontFamily:'var(--mono)', background:'rgba(0,201,167,0.1)', padding:'1px 8px', borderRadius:20 }}>{calcDuration(a.timeIn,a.timeOut)}</span>}
                    </div>
                    {inst && <div style={{ fontSize:11.5, color:'var(--text3)', marginTop:4 }}>👤 {inst.name}</div>}
                    {a.notes && <div style={{ fontSize:11.5, color:'var(--text3)', marginTop:4 }}>📝 {a.notes}</div>}
                    {a.loggedBy && <div style={{ fontSize:10.5, color:'var(--text3)', marginTop:4 }}>Logged by: {a.loggedBy}</div>}
                    <div style={{ display:'flex', gap:8, marginTop:10 }}>
                      <Btn variant="outline" size="sm" onClick={()=>setEditSess({...a})}>✏️ Edit</Btn>
                      <Btn variant="danger"  size="sm" onClick={()=>handleDelete(a.id)}>🗑 Delete</Btn>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
      }

      <Modal open={!!editSess} onClose={()=>setEditSess(null)} title="Edit Session">
        {editSess && <>
          <Field label="Date"><input type="date" value={editSess.date} onChange={e=>setEditSess(s=>({...s,date:e.target.value}))} /></Field>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12 }}>
            <Field label="Time In"> <input type="time" value={editSess.timeIn}    onChange={e=>setEditSess(s=>({...s,timeIn:e.target.value}))} /></Field>
            <Field label="Time Out"><input type="time" value={editSess.timeOut||''} onChange={e=>setEditSess(s=>({...s,timeOut:e.target.value}))} /></Field>
          </div>
          <Field label="Instructor" style={{marginTop:12}}>
            <select value={editSess.instructorId||''} onChange={e=>setEditSess(s=>({...s,instructorId:e.target.value}))}>
              <option value="">— Select —</option>
              {instructors.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </Field>
          <Field label="Remark" style={{marginTop:12}}>
            <select value={editSess.remark} onChange={e=>setEditSess(s=>({...s,remark:e.target.value}))}>
              {REMARKS.map(r=><option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Notes" style={{marginTop:12}}>
            <input value={editSess.notes||''} onChange={e=>setEditSess(s=>({...s,notes:e.target.value}))} placeholder="Notes…" />
          </Field>
          <ModalFooter>
            <Btn variant="ghost" onClick={()=>setEditSess(null)}>Cancel</Btn>
            <Btn onClick={handleEditSave} disabled={saving}>{saving?'Saving…':'Save'}</Btn>
          </ModalFooter>
        </>}
      </Modal>
    </div>
  );
}
