// src/utils/helpers.js
export const todayStr = () => new Date().toISOString().split('T')[0];
export const nowTime  = () => { const n = new Date(); return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`; };

export function fmt12(t) {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr < 12 ? 'AM' : 'PM'}`;
}

export function fmtDate(d) {
  if (!d) return '—';
  const [y, mo, da] = d.split('-');
  const mths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${da} ${mths[parseInt(mo) - 1]} ${y}`;
}

export function fmtDateFull(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function calcDuration(tin, tout) {
  if (!tin || !tout) return null;
  const [h1, m1] = tin.split(':').map(Number);
  const [h2, m2] = tout.split(':').map(Number);
  const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (mins <= 0) return null;
  return Math.floor(mins / 60) > 0 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
}

export function calcAge(dob) {
  if (!dob) return '';
  return Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 3600 * 1000)) + ' yrs';
}

export function initials(name = '') {
  return name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// Time slot label
export function slotLabel(tin, tout) {
  return `${fmt12(tin)} – ${fmt12(tout)}`;
}

// Slot session (morning / day / evening)
export function slotSession(tin) {
  const h = parseInt((tin || '0').split(':')[0]);
  if (h < 8)  return 'morning';
  if (h < 14) return 'midday';
  return 'evening';
}

export const REMARK_COLORS = {
  'On Time'     : { bg: 'rgba(34,197,94,0.12)',  color: '#22C55E' },
  'Late'        : { bg: 'rgba(245,166,35,0.12)', color: '#F5A623' },
  'Very Late'   : { bg: 'rgba(255,92,92,0.12)',  color: '#FF5C5C' },
  'Left Early'  : { bg: 'rgba(90,148,255,0.15)', color: '#5A94FF' },
  'Make-up Class':{ bg: 'rgba(167,139,250,0.12)',color: '#A78BFA' },
  'Absent'      : { bg: 'rgba(255,92,92,0.08)',  color: '#FF5C5C' },
};

export const STATUS_COLORS = {
  'Active'   : { bg: 'rgba(34,197,94,0.12)',  color: '#22C55E' },
  'Completed': { bg: 'rgba(0,201,167,0.12)',  color: '#00C9A7' },
  'Paused'   : { bg: 'rgba(245,166,35,0.12)', color: '#F5A623' },
  'Cancelled': { bg: 'rgba(255,92,92,0.12)',  color: '#FF5C5C' },
};

export const SLOT_STATUS_COLORS = {
  'available': { bg: 'rgba(255,255,255,0.04)', color: '#4A607A', border: 'rgba(255,255,255,0.07)' },
  'booked'   : { bg: 'rgba(59,123,255,0.12)',  color: '#5A94FF', border: 'rgba(59,123,255,0.3)'  },
  'completed': { bg: 'rgba(34,197,94,0.10)',   color: '#22C55E', border: 'rgba(34,197,94,0.25)'  },
  'cancelled': { bg: 'rgba(255,92,92,0.08)',   color: '#FF5C5C', border: 'rgba(255,92,92,0.2)'   },
};
