// src/components/BottomNav.jsx
import React from 'react';

// Kept only to avoid touching legacy mojibake lines; CLEAN_TABS drives the UI.
// eslint-disable-next-line no-unused-vars
const TABS = [
  { id:'dashboard', icon:'⊞',  label:'Home'     },
  { id:'schedule',  icon:'📅',  label:'Schedule' },
  { id:'students',  icon:'👥',  label:'Students' },
  { id:'attend',    icon:'✅',  label:'Attend'   },
  { id:'records',   icon:'📋',  label:'Records'  },
  { id:'auditlog',  icon:'LOG',  label:'Audit'    },
];

const CLEAN_TABS = [
  { id:'dashboard', icon:'⊞',  label:'Home'     },
  { id:'schedule',  icon:'📅',  label:'Schedule' },
  { id:'students',  icon:'👥',  label:'Students' },
  { id:'attend',    icon:'✅',  label:'Attend'   },
  { id:'records',   icon:'📋',  label:'Records'  },
  { id:'auditlog',  icon:'🔍',  label:'Logs'     },
];

export default function BottomNav({ active, onNav }) {
  return (
    <nav style={{
      flexShrink:0, display:'flex', background:'rgba(10,15,30,0.97)',
      backdropFilter:'blur(20px)', borderTop:'1px solid var(--border)',
      paddingBottom:'var(--safe-bottom)', zIndex:50,
    }}>
      {CLEAN_TABS.map(t => {
        const on = active === t.id;
        return (
          <button key={t.id} onClick={() => onNav(t.id)} style={{
            flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            gap:4, padding:'10px 2px', background:'none', border:'none', cursor:'pointer', position:'relative',
          }}>
            {on && <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:2, background:'linear-gradient(90deg,var(--blue),var(--teal))', borderRadius:2 }} />}
            <span style={{ fontSize:19, lineHeight:1 }}>{t.icon}</span>
            <span style={{ fontSize:10, fontWeight: on?600:400, color: on?'var(--text)':'var(--text3)', letterSpacing:'0.01em' }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
