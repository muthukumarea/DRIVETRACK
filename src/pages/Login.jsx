// src/pages/Login.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Btn } from '../components/UI';
import { seedIfEmpty } from '../firebase/db';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [pin, setPin]           = useState('');
  const [shake, setShake]       = useState(false);
  const [initializing, setInitializing] = useState(false);
  const pinRef = useRef(null);

  const NUMPAD = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  function pressKey(k) {
    if (k === '⌫') { setPin(p => p.slice(0,-1)); return; }
    if (k === '') return;
    if (pin.length < 4) setPin(p => p + k);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (pin.length === 4) handleLogin(); }, [pin]);

  async function handleLogin() {
    if (loading) return;
    if (!username.trim()) { toast.error('Enter your username'); setPin(''); return; }
    const res = await login(username.toLowerCase().trim(), pin);
    if (!res.ok) {
      setShake(true); setPin('');
      setTimeout(() => setShake(false), 500);
      toast.error(res.error);
    }
  }

  async function initializeDatabase() {
    setInitializing(true);
    try {
      await seedIfEmpty();
      toast.success('Database initialized. Try admin / 1234 now.');
    } catch (e) {
      toast.error('Cannot initialize. Deploy Firestore rules first.');
    }
    setInitializing(false);
  }

  return (
    <div style={{ height:'100dvh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', padding:'28px 20px 34px', position:'relative', overflowY:'auto', overflowX:'hidden', WebkitOverflowScrolling:'touch' }}>
      {/* Background glows */}
      <div style={{ position:'fixed', top:'-20%', left:'-20%', width:'70vw', height:'70vw', borderRadius:'50%', background:'radial-gradient(circle,rgba(59,123,255,0.07) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:'-20%', right:'-20%', width:'60vw', height:'60vw', borderRadius:'50%', background:'radial-gradient(circle,rgba(0,201,167,0.06) 0%,transparent 70%)', pointerEvents:'none' }} />

      {/* Logo */}
      <div className="fade-up" style={{ textAlign:'center', marginBottom:24, flexShrink:0 }}>
        <div style={{ width:58, height:58, borderRadius:16, background:'linear-gradient(135deg,#3B7BFF,#00C9A7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 12px', boxShadow:'0 8px 32px rgba(59,123,255,0.4)' }}>🚗</div>
        <div style={{ fontSize:22, fontWeight:800, color:'var(--text)', letterSpacing:-0.3, lineHeight:1.25 }}>EKR Driving Institute</div>
        <div style={{ fontSize:13, color:'var(--text3)', marginTop:4 }}>Attendance Tracker</div>
      </div>

      {/* Card */}
      <div className="fade-up" style={{ width:'100%', maxWidth:360, background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:18, padding:'22px 22px', boxShadow:'0 24px 80px rgba(0,0,0,0.5)', flexShrink:0 }}>
        <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:18 }}>Admin Login</div>

        {/* Username */}
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:11.5, fontWeight:500, color:'var(--text3)', display:'block', marginBottom:6 }}>Username</label>
          <input
            type="text" value={username} onChange={e=>setUsername(e.target.value)}
            placeholder="e.g. admin, inst1…"
            style={{ fontSize:15, padding:'11px 14px', letterSpacing:0.2 }}
            onKeyDown={e => e.key==='Enter' && pinRef.current?.focus()}
          />
        </div>

        {/* PIN display */}
        <label style={{ fontSize:11.5, fontWeight:500, color:'var(--text3)', display:'block', marginBottom:10 }}>4-Digit PIN</label>
        <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:20, animation: shake ? 'shake 0.4s ease' : 'none' }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width:52, height:58, borderRadius:13, background:'var(--bg3)', border:`1.5px solid ${pin.length>i ? 'var(--blue)':'var(--border2)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:700, color:'var(--text)', transition:'border 0.15s', boxShadow: pin.length>i ? '0 0 0 3px rgba(59,123,255,0.12)' : 'none' }}>
              {pin.length > i ? '●' : ''}
            </div>
          ))}
        </div>

        {/* Numpad */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:9 }}>
          {NUMPAD.map((k,i) => (
            <button key={i} onClick={() => pressKey(k)} style={{
              padding:'15px 0', borderRadius:13, fontSize:20, fontWeight:600, fontFamily:'var(--mono)',
              background: k==='⌫' ? 'rgba(255,92,92,0.1)' : k==='' ? 'transparent' : 'var(--bg3)',
              border: `1px solid ${k==='' ? 'transparent' : 'var(--border2)'}`,
              color: k==='⌫' ? 'var(--red)' : 'var(--text)',
              cursor: k==='' ? 'default' : 'pointer',
              transition:'all 0.1s', pointerEvents: k===''?'none':undefined,
              active: { transform:'scale(0.95)' }
            }}>{k}</button>
          ))}
        </div>

        <Btn full onClick={handleLogin} disabled={loading || pin.length < 4 || !username} style={{ marginTop:18, padding:14, fontSize:15 }}>
          {loading ? 'Signing in…' : 'Sign In →'}
        </Btn>

        <button onClick={initializeDatabase} disabled={initializing || loading} style={{ width:'100%', marginTop:12, background:'transparent', border:'none', color:'var(--blue2)', cursor:initializing?'not-allowed':'pointer', fontSize:12, fontFamily:'var(--font)', opacity:initializing?0.6:1 }}>
          {initializing ? 'Initializing database...' : 'Initialize database'}
        </button>

        <div style={{ textAlign:'center', marginTop:14, fontSize:11.5, color:'var(--text3)' }}>
          Default: admin / 1234 · inst1 / 1111
        </div>
      </div>

      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}`}</style>
    </div>
  );
}
