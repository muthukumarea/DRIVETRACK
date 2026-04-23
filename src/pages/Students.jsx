// src/pages/Students.jsx
import React, { useState, useMemo } from 'react';
import { Card, Btn, Badge, Avatar, Modal, ModalFooter, Field, SectionLabel, SearchInput, Empty, ProgressBar, Tag } from '../components/UI';
import { addStudent, updateStudent } from '../firebase/db';
import { fmtDate, calcAge, todayStr } from '../utils/helpers';
import toast from 'react-hot-toast';

const EMPTY = { name:'',phone:'',dob:'',email:'',address:'',gender:'',licenseType:'',status:'Active',enrollDate:'',sessionsPaid:'',feePaid:'',vehicle:'',aadhaar:'',ecName:'',ecPhone:'' };

export default function Students({ students, attendance, onRefresh, writeAuditLog, user }) {
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [viewSt,  setViewSt]  = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [editId, setEditId]   = useState(null);
  const [saving, setSaving]   = useState(false);

  const filtered = useMemo(() => students.filter(s=>{
    const q=search.toLowerCase();
    return (!q||(s.name||'').toLowerCase().includes(q)||(s.phone||'').includes(q))
        && (!statusF||s.status===statusF);
  }), [students,search,statusF]);

  const sessCount = id => attendance.filter(a=>a.studentId===id).length;

  function openAdd() { setForm({...EMPTY,enrollDate:todayStr()}); setEditId(null); setShowAdd(true); }
  function openEdit(s) {
    setForm({name:s.name||'',phone:s.phone||'',dob:s.dob||'',email:s.email||'',address:s.address||'',gender:s.gender||'',licenseType:s.licenseType||'',status:s.status||'Active',enrollDate:s.enrollDate||'',sessionsPaid:s.sessionsPaid||'',feePaid:s.feePaid||'',vehicle:s.vehicle||'',aadhaar:s.aadhaar||'',ecName:s.ecName||'',ecPhone:s.ecPhone||''});
    setEditId(s.id); setShowAdd(true);
  }

  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  async function save() {
    if (!form.name.trim()||!form.phone.trim()) { toast.error('Name and phone required'); return; }
    setSaving(true);
    try {
      if (editId) {
        await updateStudent(editId,form);
        if (writeAuditLog) {
          await writeAuditLog({
            action: 'UPDATE',
            entity: 'student',
            entityId: editId,
            adminId: user?.id,
            adminName: user?.name,
            details: {
              studentName: form.name,
              description: 'Updated student profile',
            },
          });
        }
        toast.success('Updated!');
      }
      else {
        const ref = await addStudent(form);
        if (writeAuditLog) {
          await writeAuditLog({
            action: 'CREATE',
            entity: 'student',
            entityId: ref?.id,
            adminId: user?.id,
            adminName: user?.name,
            details: {
              studentName: form.name,
              description: 'Added new student',
            },
          });
        }
        toast.success('Student added!');
      }
      setShowAdd(false); onRefresh();
    } catch(e) { toast.error('Error saving'); }
    setSaving(false);
  }

  return (
    <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'var(--text)' }}>Students</div>
            <div style={{ fontSize:11.5, color:'var(--text3)', marginTop:2 }}>{students.length} enrolled</div>
          </div>
          <Btn onClick={openAdd}>+ Add Student</Btn>
        </div>
        <SearchInput placeholder="Search name or phone…" value={search} onChange={setSearch} />
        <select value={statusF} onChange={e=>setStatusF(e.target.value)} style={{ marginTop:10, fontSize:13 }}>
          <option value="">All Status</option>
          {['Active','Completed','Paused','Cancelled'].map(s=><option key={s}>{s}</option>)}
        </select>
      </Card>

      {!filtered.length
        ? <Card><Empty icon="👥" text={students.length?'No matches':'Add your first student!'} /></Card>
        : filtered.map(s => (
            <Card key={s.id} style={{ display:'flex', alignItems:'center', gap:12 }}>
              <Avatar name={s.name} size="md" />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</div>
                <div style={{ fontSize:11.5, color:'var(--text3)', fontFamily:'var(--mono)', marginTop:2 }}>{s.phone}</div>
                <div style={{ display:'flex', gap:6, alignItems:'center', marginTop:6, flexWrap:'wrap' }}>
                  <Badge label={s.status} type="status" />
                  {s.licenseType && <Tag>{s.licenseType}</Tag>}
                  <span style={{ fontSize:11, color:'var(--text3)' }}>{sessCount(s.id)}/{s.sessionsPaid||'?'} sessions</span>
                </div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <Btn variant="outline" size="sm" onClick={()=>setViewSt(s)}>View</Btn>
                <Btn variant="teal"    size="sm" onClick={()=>openEdit(s)}>Edit</Btn>
              </div>
            </Card>
          ))
      }

      {/* Add/Edit Modal */}
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title={editId?'Edit Student':'Add Student'} desc="* required fields">
        <SectionLabel>Personal Info</SectionLabel>
        <Field label="Full Name *"><input value={form.name}  onChange={set('name')}  placeholder="e.g. Arun Sharma" /></Field>
        <Field label="Mobile *" style={{marginTop:12}}><input type="tel" value={form.phone} onChange={set('phone')} placeholder="10-digit mobile" /></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12 }}>
          <Field label="Date of Birth"><input type="date" value={form.dob}  onChange={set('dob')} /></Field>
          <Field label="Gender">
            <select value={form.gender} onChange={set('gender')}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select>
          </Field>
        </div>
        <Field label="Email" style={{marginTop:12}}><input type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" /></Field>
        <Field label="Aadhaar / ID" style={{marginTop:12}}><input value={form.aadhaar} onChange={set('aadhaar')} placeholder="Optional" /></Field>
        <Field label="Address *" style={{marginTop:12}}><textarea value={form.address} onChange={set('address')} placeholder="Full address with PIN code…" /></Field>

        <SectionLabel>Course Details</SectionLabel>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="License Type">
            <select value={form.licenseType} onChange={set('licenseType')}>
              <option value="">Select</option>
              {['LMV (Car)','MCWG (Bike)','LMV + MCWG','HMV (Heavy)','LMV Gear','LMV Non-Gear'].map(l=><option key={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={set('status')}>{['Active','Completed','Paused','Cancelled'].map(s=><option key={s}>{s}</option>)}</select>
          </Field>
          <Field label="Enroll Date"><input type="date" value={form.enrollDate} onChange={set('enrollDate')} /></Field>
          <Field label="Sessions Paid"><input type="number" value={form.sessionsPaid} onChange={set('sessionsPaid')} placeholder="e.g. 20" /></Field>
          <Field label="Fee (₹)"><input type="number" value={form.feePaid} onChange={set('feePaid')} placeholder="e.g. 6000" /></Field>
          <Field label="Vehicle">
            <select value={form.vehicle} onChange={set('vehicle')}>
              <option value="">Select</option>
              {['Maruti Alto','Hyundai i10','Honda Activa','Maruti Wagon R','TATA Tiago','Own Vehicle'].map(v=><option key={v}>{v}</option>)}
            </select>
          </Field>
        </div>

        <SectionLabel>Emergency Contact</SectionLabel>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Name"><input value={form.ecName}  onChange={set('ecName')}  placeholder="Parent / Spouse" /></Field>
          <Field label="Phone"><input type="tel" value={form.ecPhone} onChange={set('ecPhone')} placeholder="Mobile" /></Field>
        </div>

        <ModalFooter>
          <Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn>
          <Btn onClick={save} disabled={saving}>{saving?'Saving…':'Save Student'}</Btn>
        </ModalFooter>
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewSt} onClose={()=>setViewSt(null)} title="Student Profile">
        {viewSt && (() => {
          const cnt = sessCount(viewSt.id);
          return <>
            <div style={{ display:'flex', alignItems:'center', gap:14, background:'rgba(59,123,255,0.07)', border:'1px solid rgba(59,123,255,0.15)', borderRadius:14, padding:16, marginBottom:16 }}>
              <Avatar name={viewSt.name} size="lg" />
              <div>
                <div style={{ fontSize:17, fontWeight:700, color:'var(--text)' }}>{viewSt.name}</div>
                <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginTop:6 }}><Badge label={viewSt.status} type="status" />{viewSt.licenseType&&<Tag>{viewSt.licenseType}</Tag>}</div>
                <div style={{ fontSize:12, color:'var(--text3)', marginTop:7 }}>📞 {viewSt.phone}{viewSt.email?` · ✉️ ${viewSt.email}`:''}</div>
              </div>
            </div>
            <ProgressBar value={cnt} max={parseInt(viewSt.sessionsPaid)||1} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:14 }}>
              {[['DOB',viewSt.dob?`${fmtDate(viewSt.dob)} (${calcAge(viewSt.dob)})`:'—'],['Gender',viewSt.gender||'—'],['Enrolled',fmtDate(viewSt.enrollDate)],['Vehicle',viewSt.vehicle||'—'],['Fee',viewSt.feePaid?`₹${parseInt(viewSt.feePaid).toLocaleString('en-IN')}`:'—'],['Aadhaar',viewSt.aadhaar||'—']].map(([l,v])=>(
                <div key={l} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 12px' }}>
                  <div style={{ fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{l}</div>
                  <div style={{ fontSize:13, color:'var(--text)', fontWeight:500 }}>{v}</div>
                </div>
              ))}
            </div>
            {viewSt.address&&<div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 12px', marginTop:10 }}><div style={{ fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Address</div><div style={{ fontSize:13, color:'var(--text)' }}>{viewSt.address}</div></div>}
            {(viewSt.ecName||viewSt.ecPhone)&&<div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 12px', marginTop:10 }}><div style={{ fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Emergency Contact</div><div style={{ fontSize:13, color:'var(--text)' }}>{viewSt.ecName} {viewSt.ecPhone?`· 📞 ${viewSt.ecPhone}`:''}</div></div>}
            <ModalFooter>
              <Btn variant="ghost" onClick={()=>setViewSt(null)}>Close</Btn>
              <Btn variant="outline" onClick={()=>{ setViewSt(null); openEdit(viewSt); }}>Edit</Btn>
            </ModalFooter>
          </>;
        })()}
      </Modal>
    </div>
  );
}
