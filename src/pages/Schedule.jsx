// src/pages/Schedule.jsx
import React, { useState, useMemo } from 'react';
import { Card, Btn, Modal, ModalFooter, Field, Empty } from '../components/UI';
import { generateDaySchedule, updateSchedule, deleteSchedule, addSchedule } from '../firebase/db';
import { fmtDate, fmt12, todayStr, SLOT_STATUS_COLORS } from '../utils/helpers';
import toast from 'react-hot-toast';

const SESSION_CONFIG = [
  { label:'🌅 Early Morning', color:'var(--amber)',  slots:['04:00','04:30','05:00','05:30'] },
  { label:'🌄 Morning',       color:'var(--teal)',   slots:['06:00','06:30','07:00','07:30'] },
  { label:'☀️ Midday',        color:'var(--blue2)',  slots:['10:00','10:30','11:00','11:30','12:00','12:30'] },
  { label:'🌆 Evening',       color:'var(--purple)', slots:['16:00','16:30','17:00'] },
];

function timeOut(tin) {
  const [h,m] = tin.split(':').map(Number);
  const em = m+30; const eh = em>=60?h+1:h;
  return `${String(eh).padStart(2,'0')}:${String(em%60).padStart(2,'0')}`;
}

export default function Schedule({ schedules, students, instructors, onRefresh, writeAuditLog, user }) {
  const [date, setDate]               = useState(todayStr());
  const [selInstructor, setSelInstructor] = useState('');
  const [generating, setGenerating]   = useState(false);
  const [editSlot, setEditSlot]       = useState(null);
  const [saving, setSaving]           = useState(false);
  const [addSlotModal, setAddSlotModal] = useState(false);
  const [newSlot, setNewSlot]         = useState({ timeIn:'', instructorId:'', studentId:'', notes:'' });

  const daySchedules = useMemo(() =>
    schedules.filter(s => s.date === date && (!selInstructor || s.instructorId === selInstructor))
      .sort((a,b) => a.timeIn?.localeCompare(b.timeIn)),
    [schedules, date, selInstructor]
  );

  const getStudent    = id => students.find(s=>s.id===id);
  const getInstructor = id => instructors.find(i=>i.id===id);

  async function handleGenerate() {
    if (!instructors.length) { toast.error('Add instructors first'); return; }
    const existing = schedules.filter(s=>s.date===date);
    if (existing.length > 0) {
      if (!window.confirm(`${existing.length} slots already exist for ${fmtDate(date)}. Generate additional slots?`)) return;
    }
    setGenerating(true);
    try {
      const ids = instructors.filter(i=>i.available!==false).map(i=>i.id);
      await generateDaySchedule(date, ids);
      if (writeAuditLog) {
        await writeAuditLog({
          action: 'GENERATE_SCHEDULE',
          entity: 'schedule',
          entityId: null,
          adminId: user?.id,
          adminName: user?.name,
          details: {
            date,
            instructorCount: ids.length,
            description: `Auto-generated schedule for ${date}`,
          },
        });
      }
      toast.success(`✅ Schedule generated for ${fmtDate(date)}!`);
      onRefresh();
    } catch(e) { toast.error('Error generating schedule'); }
    setGenerating(false);
  }

  async function handleEditSave() {
    if (!editSlot) return;
    setSaving(true);
    try {
      await updateSchedule(editSlot.id, {
        studentId:   editSlot.studentId   || null,
        studentName: editSlot.studentId   ? getStudent(editSlot.studentId)?.name : null,
        instructorId:editSlot.instructorId,
        timeIn:      editSlot.timeIn,
        timeOut:     timeOut(editSlot.timeIn),
        status:      editSlot.status,
        notes:       editSlot.notes || '',
      });
      if (writeAuditLog) {
        await writeAuditLog({
          action: 'UPDATE',
          entity: 'schedule',
          entityId: editSlot.id,
          adminId: user?.id,
          adminName: user?.name,
          details: {
            date,
            timeIn: editSlot.timeIn,
            status: editSlot.status,
            studentName: editSlot.studentId ? getStudent(editSlot.studentId)?.name : 'None',
            description: 'Updated schedule slot',
          },
        });
      }
      toast.success('Slot updated!');
      setEditSlot(null); onRefresh();
    } catch(e) { toast.error('Error saving'); }
    setSaving(false);
  }

  async function handleDeleteSlot(id) {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await deleteSchedule(id);
      if (writeAuditLog) {
        await writeAuditLog({
          action: 'DELETE',
          entity: 'schedule',
          entityId: id,
          adminId: user?.id,
          adminName: user?.name,
          details: {
            date,
            description: 'Deleted schedule slot',
          },
        });
      }
      toast.success('Slot deleted'); onRefresh();
    }
    catch(e) { toast.error('Error deleting'); }
  }

  async function handleAddSlot() {
    if (!newSlot.timeIn || !newSlot.instructorId) { toast.error('Time and instructor required'); return; }
    setSaving(true);
    try {
      const st = newSlot.studentId ? getStudent(newSlot.studentId) : null;
      await addSchedule({
        date, timeIn: newSlot.timeIn, timeOut: timeOut(newSlot.timeIn),
        instructorId: newSlot.instructorId,
        studentId:   newSlot.studentId || null,
        studentName: st?.name || null,
        status:      newSlot.studentId ? 'booked' : 'available',
        notes:       newSlot.notes || '',
      });
      toast.success('Slot added!'); setAddSlotModal(false);
      setNewSlot({ timeIn:'', instructorId:'', studentId:'', notes:'' }); onRefresh();
    } catch(e) { toast.error('Error adding slot'); }
    setSaving(false);
  }

  // Group by session
  const slotsBySession = useMemo(() => {
    return SESSION_CONFIG.map(sess => ({
      ...sess,
      items: daySchedules.filter(s => sess.slots.includes(s.timeIn)),
    }));
  }, [daySchedules]);

  const totals = useMemo(() => ({
    total:    daySchedules.length,
    booked:   daySchedules.filter(s=>s.status==='booked').length,
    available:daySchedules.filter(s=>s.status==='available').length,
    completed:daySchedules.filter(s=>s.status==='completed').length,
  }), [daySchedules]);

  return (
    <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Date picker + Generate */}
      <Card>
        <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:12 }}>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{ flex:1, fontSize:13 }} />
          <Btn size="sm" onClick={handleGenerate} disabled={generating} style={{ whiteSpace:'nowrap' }}>
            {generating ? '⏳ …' : '⚡ Auto Generate'}
          </Btn>
        </div>
        <select value={selInstructor} onChange={e=>setSelInstructor(e.target.value)} style={{ fontSize:13, marginBottom:0 }}>
          <option value="">All Instructors</option>
          {instructors.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
        </select>

        {/* Summary chips */}
        {daySchedules.length > 0 && (
          <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
            {[
              { l:`${totals.total} Total`,     c:'var(--text3)'   },
              { l:`${totals.booked} Booked`,   c:'var(--blue2)'   },
              { l:`${totals.available} Free`,  c:'var(--green)'   },
              { l:`${totals.completed} Done`,  c:'var(--teal)'    },
            ].map(x=>(
              <span key={x.l} style={{ fontSize:11.5, color:x.c, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:20, padding:'3px 11px' }}>{x.l}</span>
            ))}
          </div>
        )}
      </Card>

      {/* Add custom slot button */}
      <Btn variant="outline" full onClick={()=>setAddSlotModal(true)}>+ Add Custom Slot</Btn>

      {/* Schedule grid by session */}
      {daySchedules.length === 0 ? (
        <Card>
          <Empty icon="📅" text={`No schedule for ${fmtDate(date)}. Tap "⚡ Auto Generate" to create slots.`} />
        </Card>
      ) : (
        slotsBySession.map(sess => sess.items.length === 0 ? null : (
          <div key={sess.label}>
            <div style={{ fontSize:12, fontWeight:600, color:sess.color, marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>
              {sess.label}
              <div style={{ flex:1, height:1, background:`${sess.color}33` }} />
              <span style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--text3)' }}>{sess.items.length} slots</span>
            </div>
            {sess.items.map(slot => {
              const sc = SLOT_STATUS_COLORS[slot.status] || SLOT_STATUS_COLORS.available;
              const st = getStudent(slot.studentId);
              const inst = getInstructor(slot.instructorId);
              return (
                <div key={slot.id} style={{ display:'flex', gap:10, padding:'10px 12px', borderRadius:'var(--r)', background:sc.bg, border:`1px solid ${sc.border}`, marginBottom:7, alignItems:'center' }}>
                  {/* Time */}
                  <div style={{ width:52, flexShrink:0 }}>
                    <div style={{ fontSize:11.5, fontWeight:700, fontFamily:'var(--mono)', color:sc.color }}>{fmt12(slot.timeIn)}</div>
                    <div style={{ fontSize:10, color:'var(--text3)', marginTop:1 }}>{fmt12(slot.timeOut)}</div>
                  </div>
                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    {st ? (
                      <>
                        <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{st.name}</div>
                        <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>👤 {inst?.name||'—'}{st.licenseType ? ` · ${st.licenseType}` : ''}</div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize:12.5, color:'var(--text3)' }}>Available</div>
                        <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>👤 {inst?.name||'—'}</div>
                      </>
                    )}
                    {slot.notes && <div style={{ fontSize:11, color:'var(--text3)', marginTop:3 }}>📝 {slot.notes}</div>}
                  </div>
                  {/* Status + actions */}
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5 }}>
                    <span style={{ fontSize:11, fontWeight:600, color:sc.color, textTransform:'capitalize' }}>{slot.status}</span>
                    <div style={{ display:'flex', gap:5 }}>
                      <Btn variant="outline" size="sm" onClick={()=>setEditSlot({...slot})}>Edit</Btn>
                      <Btn variant="danger"  size="sm" onClick={()=>handleDeleteSlot(slot.id)}>✕</Btn>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}

      {/* Edit Slot Modal */}
      <Modal open={!!editSlot} onClose={()=>setEditSlot(null)} title="Edit Slot" desc="Update booking, instructor, or status.">
        {editSlot && <>
          <Grid2>
            <Field label="Time In"><input type="time" value={editSlot.timeIn} onChange={e=>setEditSlot(s=>({...s,timeIn:e.target.value}))} /></Field>
            <Field label="Status">
              <select value={editSlot.status} onChange={e=>setEditSlot(s=>({...s,status:e.target.value}))}>
                <option value="available">Available</option><option value="booked">Booked</option>
                <option value="completed">Completed</option><option value="cancelled">Cancelled</option>
              </select>
            </Field>
          </Grid2>
          <Field label="Instructor" style={{marginTop:12}}>
            <select value={editSlot.instructorId||''} onChange={e=>setEditSlot(s=>({...s,instructorId:e.target.value}))}>
              <option value="">— Select Instructor —</option>
              {instructors.map(i=><option key={i.id} value={i.id}>{i.name} ({i.vehicle||'—'})</option>)}
            </select>
          </Field>
          <Field label="Assign Student" style={{marginTop:12}}>
            <select value={editSlot.studentId||''} onChange={e=>setEditSlot(s=>({...s,studentId:e.target.value}))}>
              <option value="">— No student —</option>
              {students.filter(s=>s.status==='Active').map(s=><option key={s.id} value={s.id}>{s.name} ({s.licenseType||'—'})</option>)}
            </select>
          </Field>
          <Field label="Notes" style={{marginTop:12}}>
            <input value={editSlot.notes||''} onChange={e=>setEditSlot(s=>({...s,notes:e.target.value}))} placeholder="Optional note…" />
          </Field>
          <ModalFooter>
            <Btn variant="ghost" onClick={()=>setEditSlot(null)}>Cancel</Btn>
            <Btn onClick={handleEditSave} disabled={saving}>{saving?'Saving…':'Save Changes'}</Btn>
          </ModalFooter>
        </>}
      </Modal>

      {/* Add Custom Slot Modal */}
      <Modal open={addSlotModal} onClose={()=>setAddSlotModal(false)} title="Add Custom Slot">
        <Field label="Time In"><input type="time" value={newSlot.timeIn} onChange={e=>setNewSlot(s=>({...s,timeIn:e.target.value}))} /></Field>
        <Field label="Instructor" style={{marginTop:12}}>
          <select value={newSlot.instructorId} onChange={e=>setNewSlot(s=>({...s,instructorId:e.target.value}))}>
            <option value="">— Select —</option>
            {instructors.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </Field>
        <Field label="Assign Student (optional)" style={{marginTop:12}}>
          <select value={newSlot.studentId} onChange={e=>setNewSlot(s=>({...s,studentId:e.target.value}))}>
            <option value="">— No student —</option>
            {students.filter(s=>s.status==='Active').map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="Notes" style={{marginTop:12}}>
          <input value={newSlot.notes} onChange={e=>setNewSlot(s=>({...s,notes:e.target.value}))} placeholder="Optional…" />
        </Field>
        <ModalFooter>
          <Btn variant="ghost" onClick={()=>setAddSlotModal(false)}>Cancel</Btn>
          <Btn onClick={handleAddSlot} disabled={saving}>{saving?'Adding…':'Add Slot'}</Btn>
        </ModalFooter>
      </Modal>
    </div>
  );
}

function Grid2({ children, style={} }) {
  return <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, ...style }}>{children}</div>;
}
