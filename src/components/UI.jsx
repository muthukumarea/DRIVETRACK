// src/components/UI.jsx
import React from 'react';
import { initials, REMARK_COLORS, STATUS_COLORS } from '../utils/helpers';

export function Btn({ children, variant='primary', size='', onClick, style={}, disabled=false, type='button', full=false }) {
  const base = {
    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
    padding: size==='sm' ? '6px 13px' : size==='lg' ? '13px 22px' : '9px 17px',
    borderRadius:'var(--r)', fontFamily:'var(--font)',
    fontSize: size==='sm' ? 12 : size==='lg' ? 15 : 13.5,
    fontWeight:500, cursor:disabled?'not-allowed':'pointer',
    border:'none', transition:'all 0.15s', whiteSpace:'nowrap',
    opacity:disabled?0.5:1, width:full?'100%':undefined,
  };
  const V = {
    primary:  { background:'linear-gradient(135deg,#3B7BFF,#6C8FFF)', color:'#fff', boxShadow:'0 4px 16px rgba(59,123,255,0.35)' },
    outline:  { background:'transparent', color:'var(--text2)', border:'1px solid var(--border2)' },
    ghost:    { background:'transparent', color:'var(--text3)', border:'none' },
    danger:   { background:'rgba(255,92,92,0.1)',  color:'var(--red)',   border:'1px solid rgba(255,92,92,0.2)' },
    teal:     { background:'rgba(0,201,167,0.1)',  color:'var(--teal)',  border:'1px solid rgba(0,201,167,0.2)' },
    amber:    { background:'rgba(245,166,35,0.1)', color:'var(--amber)', border:'1px solid rgba(245,166,35,0.2)' },
    success:  { background:'rgba(34,197,94,0.1)',  color:'var(--green)', border:'1px solid rgba(34,197,94,0.2)' },
    dark:     { background:'var(--bg4)', color:'var(--text2)', border:'1px solid var(--border2)' },
  };
  return <button type={type} onClick={onClick} disabled={disabled} style={{...base,...V[variant],...style}}>{children}</button>;
}

export function Badge({ label, type='remark' }) {
  const map = type==='status' ? STATUS_COLORS : REMARK_COLORS;
  const c = map[label] || { bg:'rgba(255,255,255,0.06)', color:'var(--text3)' };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:20, fontSize:11.5, fontWeight:500, background:c.bg, color:c.color }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:c.color, flexShrink:0 }} />
      {label}
    </span>
  );
}

export function Avatar({ name='?', size='md', color }) {
  const sz = { xs:22, sm:28, md:36, lg:48, xl:60 }[size];
  const fs = { xs:8,  sm:10, md:13, lg:16, xl:20 }[size];
  return (
    <div style={{ width:sz, height:sz, borderRadius:'50%', background:color||'linear-gradient(135deg,#3B7BFF,#00C9A7)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:fs, flexShrink:0, letterSpacing:0 }}>
      {initials(name)}
    </div>
  );
}

export function Card({ children, style={}, onClick }) {
  return (
    <div onClick={onClick} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r2)', padding:'16px', backdropFilter:'blur(8px)', cursor:onClick?'pointer':undefined, ...style }}>
      {children}
    </div>
  );
}

export function Field({ label, children, style={} }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6, ...style }}>
      <label style={{ fontSize:11.5, fontWeight:500, color:'var(--text3)' }}>{label}</label>
      {children}
    </div>
  );
}

export function Grid2({ children, style={} }) {
  return <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, ...style }}>{children}</div>;
}

export function SectionLabel({ children }) {
  return (
    <div style={{ fontSize:10.5, fontWeight:600, letterSpacing:'0.09em', textTransform:'uppercase', color:'var(--blue2)', margin:'18px 0 11px', display:'flex', alignItems:'center', gap:10 }}>
      {children}
      <div style={{ flex:1, height:1, background:'var(--border)' }} />
    </div>
  );
}

export function Modal({ open, onClose, title, desc, children, noPad=false }) {
  if (!open) return null;
  return (
    <div onClick={onClose} className="fade-in" style={{ position:'fixed', inset:0, background:'rgba(5,8,18,0.8)', backdropFilter:'blur(8px)', zIndex:200, display:'flex', alignItems:'flex-start', justifyContent:'center', overflowY:'auto', overflowX:'hidden', overscrollBehavior:'contain', WebkitOverflowScrolling:'touch', paddingTop:0, paddingBottom:120 }}>
      <div onClick={e => e.stopPropagation()} className="slide-up" style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'0 0 22px 22px', width:'100%', maxWidth:560, minHeight:'100vh', overflow:'visible', padding: noPad ? 0 : '20px 18px 28px', paddingBottom: noPad ? 0 : '140px', position:'relative', boxShadow:'0 -12px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ width:40, height:4, background:'var(--border2)', borderRadius:4, margin: noPad ? '14px auto' : '0 auto 18px' }} />
        {!noPad && <>
          <button onClick={onClose} style={{ position:'absolute', top:16, right:16, width:30, height:30, borderRadius:8, border:'1px solid var(--border2)', background:'var(--bg3)', cursor:'pointer', color:'var(--text2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>✕</button>
          {title && <div style={{ fontSize:17, fontWeight:700, color:'var(--text)', marginBottom:desc?4:18, paddingRight:36 }}>{title}</div>}
          {desc  && <div style={{ fontSize:12, color:'var(--text3)', marginBottom:18 }}>{desc}</div>}
        </>}
        {children}
      </div>
    </div>
  );
}

export function ModalFooter({ children }) {
  return <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:22, paddingTop:16, borderTop:'1px solid var(--border)' }}>{children}</div>;
}

export function Empty({ icon, text }) {
  return <div style={{ textAlign:'center', padding:'36px 16px', color:'var(--text3)' }}><div style={{ fontSize:34, marginBottom:10, opacity:0.45 }}>{icon}</div><div style={{ fontSize:13 }}>{text}</div></div>;
}

export function Spinner({ size=28 }) {
  return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:32 }}><div style={{ width:size, height:size, border:`2.5px solid var(--border)`, borderTopColor:'var(--blue)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /></div>;
}

export function StatCard({ label, value, sub, color='var(--blue)' }) {
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r2)', padding:'15px 14px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:-24, right:-24, width:80, height:80, borderRadius:'50%', background:color, opacity:0.1, filter:'blur(18px)' }} />
      <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.09em', textTransform:'uppercase', color:'var(--text3)', marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:28, fontWeight:700, color:'var(--text)', fontFamily:'var(--mono)', letterSpacing:-1 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:'var(--text3)', marginTop:5, display:'flex', alignItems:'center', gap:5 }}><span style={{ width:5, height:5, borderRadius:'50%', background:color, flexShrink:0 }}/>{sub}</div>}
    </div>
  );
}

export function ProgressBar({ value=0, max=1, color='linear-gradient(90deg,var(--blue),var(--teal))' }) {
  const pct = max ? Math.min(Math.round((value/max)*100), 100) : 0;
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:11, color:'var(--text3)' }}>
        <span>Progress</span>
        <span style={{ fontFamily:'var(--mono)', color:'var(--teal)' }}>{value}/{max} ({pct}%)</span>
      </div>
      <div style={{ height:5, background:'rgba(255,255,255,0.05)', borderRadius:5, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:5, transition:'width 0.6s ease' }} />
      </div>
    </div>
  );
}

export function Tag({ children }) {
  return <span style={{ fontSize:10.5, fontFamily:'var(--mono)', background:'rgba(255,255,255,0.05)', color:'var(--text3)', padding:'2px 8px', borderRadius:20, border:'1px solid var(--border)', whiteSpace:'nowrap' }}>{children}</span>;
}

export function SearchInput({ placeholder, value, onChange, autoFocus }) {
  return (
    <div style={{ position:'relative' }}>
      <span style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', fontSize:14, pointerEvents:'none' }}>🔍</span>
      <input type="text" placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)} autoFocus={autoFocus} style={{ paddingLeft:36 }} />
    </div>
  );
}

export function PinInput({ value, onChange, length=4 }) {
  return (
    <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
      {Array.from({length}).map((_, i) => (
        <div key={i} style={{ width:46, height:52, borderRadius:12, background:'var(--bg3)', border:`1px solid ${value.length>i ? 'var(--blue)' : 'var(--border2)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, fontFamily:'var(--mono)', color:'var(--text)', transition:'border 0.15s' }}>
          {value.length > i ? '●' : ''}
        </div>
      ))}
      <input type="number" value={value} onChange={e=>onChange(e.target.value.slice(0,length))} style={{ position:'absolute', opacity:0, width:0, height:0 }} />
    </div>
  );
}

export function LiveDot() {
  return <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:10.5, color:'var(--green)' }}><span style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', animation:'pulse 1.5s ease infinite' }} />LIVE</span>;
}

export function Divider() {
  return <div style={{ height:1, background:'var(--border)', margin:'14px 0' }} />;
}
