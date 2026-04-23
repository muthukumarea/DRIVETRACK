import React, { useState, useMemo } from 'react';
import { Card, Empty, SearchInput } from '../components/UI';

const ACTION_META = {
  CREATE:            { icon: '+', color: 'var(--green)',  bg: 'rgba(34,197,94,0.1)' },
  UPDATE:            { icon: 'E', color: 'var(--blue2)',  bg: 'rgba(59,123,255,0.1)' },
  DELETE:            { icon: 'D', color: 'var(--red)',    bg: 'rgba(255,92,92,0.1)' },
  LOGIN:             { icon: 'L', color: 'var(--purple)', bg: 'rgba(167,139,250,0.1)' },
  GENERATE_SCHEDULE: { icon: 'G', color: 'var(--amber)',  bg: 'rgba(245,166,35,0.1)' },
  MARK_ATTENDANCE:   { icon: 'A', color: 'var(--teal)',   bg: 'rgba(0,201,167,0.1)' },
};

const ENTITY_LABELS = {
  student: 'Student',
  attendance: 'Attendance',
  schedule: 'Schedule',
  instructor: 'Instructor',
  admin: 'Admin',
};

function fmtTimestamp(ts) {
  if (!ts) return '-';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function fmtTimeAgo(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

function ActionChip({ action }) {
  const m = ACTION_META[action] || { icon: '*', color: 'var(--text3)', bg: 'rgba(255,255,255,0.05)' };
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'3px 9px', borderRadius:20,
      fontSize:11.5, fontWeight:600,
      background:m.bg, color:m.color,
    }}>
      {m.icon} {String(action || '').replace('_', ' ')}
    </span>
  );
}

export default function AuditLog({ logs = [] }) {
  const [search, setSearch] = useState('');
  const [actionF, setActionF] = useState('');
  const [entityF, setEntityF] = useState('');
  const [adminF, setAdminF] = useState('');
  const [expanded, setExpanded] = useState(null);

  const adminNames = useMemo(
    () => [...new Set(logs.map(l => l.adminName).filter(Boolean))].sort(),
    [logs]
  );

  const filtered = useMemo(() => {
    let list = logs;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        (l.adminName || '').toLowerCase().includes(q) ||
        (l.entity || '').toLowerCase().includes(q) ||
        (l.action || '').toLowerCase().includes(q) ||
        JSON.stringify(l.details || {}).toLowerCase().includes(q)
      );
    }
    if (actionF) list = list.filter(l => l.action === actionF);
    if (entityF) list = list.filter(l => l.entity === entityF);
    if (adminF) list = list.filter(l => l.adminName === adminF);
    return list;
  }, [logs, search, actionF, entityF, adminF]);

  const counts = useMemo(() => {
    const today = new Date().toLocaleDateString('en-IN');
    return {
      total: filtered.length,
      today: filtered.filter(l => {
        const d = l.timestamp?.toDate ? l.timestamp.toDate() : new Date(l.timestamp || 0);
        return d.toLocaleDateString('en-IN') === today;
      }).length,
      byAction: Object.fromEntries(
        Object.keys(ACTION_META).map(a => [a, filtered.filter(l => l.action === a).length])
      ),
    };
  }, [filtered]);

  function clearFilters() {
    setSearch('');
    setActionF('');
    setEntityF('');
    setAdminF('');
  }

  return (
    <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:14, paddingBottom:100 }}>
      <Card>
        <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:2 }}>Audit Logs</div>
        <div style={{ fontSize:12, color:'var(--text3)', marginBottom:14 }}>
          Every action by every admin - who did what and when
        </div>

        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
          <span style={{ fontSize:11.5, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:20, padding:'3px 11px', color:'var(--text3)' }}>
            {counts.total} total
          </span>
          <span style={{ fontSize:11.5, background:'rgba(0,201,167,0.1)', border:'1px solid rgba(0,201,167,0.2)', borderRadius:20, padding:'3px 11px', color:'var(--teal)' }}>
            {counts.today} today
          </span>
          {Object.entries(counts.byAction).filter(([, v]) => v > 0).map(([a, v]) => (
            <span key={a} style={{ fontSize:11, background:ACTION_META[a]?.bg, borderRadius:20, padding:'3px 9px', color:ACTION_META[a]?.color }}>
              {ACTION_META[a]?.icon} {v}
            </span>
          ))}
        </div>

        <SearchInput placeholder="Search admin, action, entity..." value={search} onChange={setSearch} />

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:10 }}>
          <select value={actionF} onChange={e => setActionF(e.target.value)} style={{ fontSize:12.5 }}>
            <option value="">All Actions</option>
            {Object.keys(ACTION_META).map(a => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
          </select>
          <select value={entityF} onChange={e => setEntityF(e.target.value)} style={{ fontSize:12.5 }}>
            <option value="">All Entities</option>
            {Object.keys(ENTITY_LABELS).map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        <select value={adminF} onChange={e => setAdminF(e.target.value)} style={{ marginTop:8, fontSize:12.5 }}>
          <option value="">All Admins</option>
          {adminNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>

        {(search || actionF || entityF || adminF) && (
          <button onClick={clearFilters} style={{ marginTop:8, background:'none', border:'none', color:'var(--blue2)', cursor:'pointer', fontSize:12, fontFamily:'var(--font)' }}>
            x Clear filters
          </button>
        )}
      </Card>

      {!filtered.length
        ? <Card><Empty icon="LOG" text="No audit logs match your filters" /></Card>
        : filtered.map(log => {
            const isExp = expanded === log.id;
            const details = log.details || {};
            return (
              <div
                key={log.id}
                onClick={() => setExpanded(isExp ? null : log.id)}
                style={{
                  background:'var(--card)', border:'1px solid var(--border)',
                  borderRadius:'var(--r2)', padding:'12px 14px',
                  cursor:'pointer', transition:'border-color 0.15s',
                  borderColor:isExp ? 'var(--border2)' : undefined,
                }}
              >
                <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <div style={{
                    width:34, height:34, borderRadius:'50%', flexShrink:0,
                    background:ACTION_META[log.action]?.bg || 'rgba(255,255,255,0.05)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:15,
                  }}>
                    {ACTION_META[log.action]?.icon || '*'}
                  </div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, flexWrap:'wrap' }}>
                      <ActionChip action={log.action} />
                      <span style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)', flexShrink:0 }}>
                        {fmtTimeAgo(log.timestamp)}
                      </span>
                    </div>

                    <div style={{ marginTop:5, display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
                      <span style={{ fontSize:12.5, fontWeight:600, color:'var(--text)' }}>
                        {log.adminName || 'Unknown'}
                      </span>
                      {log.entity && (
                        <span style={{ fontSize:11.5, color:'var(--text3)' }}>
                          on {ENTITY_LABELS[log.entity] || log.entity}
                        </span>
                      )}
                    </div>

                    {details.studentName && (
                      <div style={{ fontSize:11.5, color:'var(--text3)', marginTop:3 }}>
                        Student: <span style={{ color:'var(--text2)' }}>{details.studentName}</span>
                      </div>
                    )}
                    {details.description && (
                      <div style={{ fontSize:11.5, color:'var(--text3)', marginTop:3 }}>
                        {details.description}
                      </div>
                    )}

                    {isExp && (
                      <div style={{
                        marginTop:12, padding:'10px 12px',
                        background:'rgba(255,255,255,0.025)',
                        border:'1px solid var(--border)',
                        borderRadius:8,
                      }}>
                        <div style={{ fontSize:10.5, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>
                          Full Details
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                          {[
                            ['Timestamp', fmtTimestamp(log.timestamp)],
                            ['Admin', log.adminName || '-'],
                            ['Admin ID', log.adminId || '-'],
                            ['Action', log.action || '-'],
                            ['Entity', log.entity || '-'],
                            ['Entity ID', log.entityId || '-'],
                            ...Object.entries(details).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v)]),
                          ].map(([k, v]) => (
                            <div key={k}>
                              <div style={{ fontSize:10, color:'var(--text3)', marginBottom:2, textTransform:'capitalize' }}>{k}</div>
                              <div style={{ fontSize:12, color:'var(--text)', fontFamily: k === 'Timestamp' || k === 'Admin ID' || k === 'Entity ID' ? 'var(--mono)' : undefined, wordBreak:'break-all' }}>{v || '-'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop:6, fontSize:11, color:'var(--text3)' }}>
                      {isExp ? '^ collapse' : 'v tap to expand'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
      }
    </div>
  );
}
