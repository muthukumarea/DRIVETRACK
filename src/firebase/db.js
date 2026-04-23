// src/firebase/db.js
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, query, orderBy, serverTimestamp,
  onSnapshot, writeBatch, limit
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';

const ADMINS = [
  { id: 'admin', name: 'Super Admin', username: 'admin', pin: '1234', role: 'superadmin' },
  { id: 'inst1', name: 'Instructor 1', username: 'inst1', pin: '1111', role: 'admin' },
  { id: 'inst2', name: 'Instructor 2', username: 'inst2', pin: '2222', role: 'admin' },
  { id: 'inst3', name: 'Instructor 3', username: 'inst3', pin: '3333', role: 'admin' },
  { id: 'inst4', name: 'Instructor 4', username: 'inst4', pin: '4444', role: 'admin' },
];

const INSTRUCTORS = [
  { id: 'inst-default-1', name: 'Rajan Kumar', phone: '9876500001', vehicle: 'Maruti Alto', available: true },
  { id: 'inst-default-2', name: 'Suresh Babu', phone: '9876500002', vehicle: 'Hyundai i10', available: true },
  { id: 'inst-default-3', name: 'Priya Devi', phone: '9876500003', vehicle: 'Honda Activa', available: true },
  { id: 'inst-default-4', name: 'Murugan S', phone: '9876500004', vehicle: 'Maruti Wagon R', available: true },
  { id: 'inst-default-5', name: 'Anbu Selvan', phone: '9876500005', vehicle: 'TATA Tiago', available: true },
];

const DEFAULTS = { admins: ADMINS, instructors: INSTRUCTORS, students: [], attendance: [], schedules: [], auditLogs: [] };
const localListeners = new Map();

function stamp() { return { seconds: Math.floor(Date.now() / 1000) }; }
function localKey(name) { return `dt_${name}`; }
function readLocal(name) {
  try {
    const stored = localStorage.getItem(localKey(name));
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULTS[name] || [];
}
function writeLocal(name, data) {
  localStorage.setItem(localKey(name), JSON.stringify(data));
  notifyLocal(name);
}
function notifyLocal(name) {
  (localListeners.get(name) || new Set()).forEach(cb => cb(readLocal(name)));
}
function listenLocal(name, cb) {
  cb(readLocal(name));
  const listeners = localListeners.get(name) || new Set();
  listeners.add(cb);
  localListeners.set(name, listeners);
  return () => listeners.delete(cb);
}
function addLocal(name, data) {
  const item = { ...data, id: `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: stamp() };
  writeLocal(name, [item, ...readLocal(name)]);
  return Promise.resolve({ id: item.id });
}
function updateLocal(name, id, data) {
  writeLocal(name, readLocal(name).map(item => item.id === id ? { ...item, ...data } : item));
  return Promise.resolve();
}
function deleteLocal(name, id) {
  writeLocal(name, readLocal(name).filter(item => item.id !== id));
  return Promise.resolve();
}

// ── REAL-TIME LISTENERS (for multi-admin live sync) ──
export function listenStudents(cb) {
  if (!isFirebaseConfigured) return listenLocal('students', cb);
  const q = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => cb([]));
}
export function listenAttendance(cb) {
  if (!isFirebaseConfigured) return listenLocal('attendance', cb);
  const q = query(collection(db, 'attendance'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => cb([]));
}
export function listenSchedules(cb) {
  if (!isFirebaseConfigured) return listenLocal('schedules', cb);
  const q = query(collection(db, 'schedules'), orderBy('date', 'desc'));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => cb([]));
}
export function listenInstructors(cb) {
  if (!isFirebaseConfigured) return listenLocal('instructors', cb);
  const q = query(collection(db, 'instructors'), orderBy('name'));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => cb([]));
}

// ── STUDENTS ──
export const addStudent    = d  => isFirebaseConfigured ? addDoc(collection(db, 'students'), { ...d, createdAt: serverTimestamp() }) : addLocal('students', d);
export const updateStudent = (id, d) => isFirebaseConfigured ? updateDoc(doc(db, 'students', id), d) : updateLocal('students', id, d);
export const deleteStudent = id => isFirebaseConfigured ? deleteDoc(doc(db, 'students', id)) : deleteLocal('students', id);

// ── ATTENDANCE ──
export const addAttendance    = d  => isFirebaseConfigured ? addDoc(collection(db, 'attendance'), { ...d, createdAt: serverTimestamp() }) : addLocal('attendance', d);
export const updateAttendance = (id, d) => isFirebaseConfigured ? updateDoc(doc(db, 'attendance', id), d) : updateLocal('attendance', id, d);
export const deleteAttendance = id => isFirebaseConfigured ? deleteDoc(doc(db, 'attendance', id)) : deleteLocal('attendance', id);

// ── SCHEDULES ──
export const addSchedule    = d  => isFirebaseConfigured ? addDoc(collection(db, 'schedules'), { ...d, createdAt: serverTimestamp() }) : addLocal('schedules', d);
export const updateSchedule = (id, d) => isFirebaseConfigured ? updateDoc(doc(db, 'schedules', id), d) : updateLocal('schedules', id, d);
export const deleteSchedule = id => isFirebaseConfigured ? deleteDoc(doc(db, 'schedules', id)) : deleteLocal('schedules', id);

// Bulk-generate schedule slots for a date
export async function generateDaySchedule(date, instructorIds) {
  const SLOTS = [
    '04:00','04:30','05:00','05:30','06:00','06:30','07:00','07:30',
    '10:00','10:30','11:00','11:30','12:00','12:30',
    '16:00','16:30','17:00'
  ];
  if (!isFirebaseConfigured) {
    const slots = [];
    for (const slot of SLOTS) {
      for (const instId of instructorIds) {
        const [h, m] = slot.split(':').map(Number);
        const endMin = m + 30;
        const endH   = endMin >= 60 ? h + 1 : h;
        const endM   = endMin % 60;
        const timeOut = `${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`;
        slots.push({
          id: `schedules-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          date, instructorId: instId, timeIn: slot, timeOut,
          studentId: null, studentName: null, status: 'available',
          createdAt: stamp()
        });
      }
    }
    writeLocal('schedules', [...slots, ...readLocal('schedules')]);
    return;
  }
  const batch = writeBatch(db);
  for (const slot of SLOTS) {
    for (const instId of instructorIds) {
      const ref = doc(collection(db, 'schedules'));
      const [h, m] = slot.split(':').map(Number);
      const endMin = m + 30;
      const endH   = endMin >= 60 ? h + 1 : h;
      const endM   = endMin % 60;
      const timeOut = `${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`;
      batch.set(ref, {
        date, instructorId: instId, timeIn: slot, timeOut,
        studentId: null, studentName: null, status: 'available',
        createdAt: serverTimestamp()
      });
    }
  }
  await batch.commit();
}

// ── INSTRUCTORS ──
export const addInstructor    = d  => isFirebaseConfigured ? addDoc(collection(db, 'instructors'), { ...d, createdAt: serverTimestamp() }) : addLocal('instructors', d);
export const updateInstructor = (id, d) => isFirebaseConfigured ? updateDoc(doc(db, 'instructors', id), d) : updateLocal('instructors', id, d);
export const deleteInstructor = id => isFirebaseConfigured ? deleteDoc(doc(db, 'instructors', id)) : deleteLocal('instructors', id);

// ── ADMINS (stored in Firestore, PIN-based auth) ──
export async function getAdmins() {
  if (!isFirebaseConfigured) return readLocal('admins');
  const snap = await getDocs(collection(db, 'admins'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export const addAdmin    = d  => isFirebaseConfigured ? addDoc(collection(db, 'admins'), { ...d, createdAt: serverTimestamp() }) : addLocal('admins', d);
export const updateAdmin = (id, d) => isFirebaseConfigured ? updateDoc(doc(db, 'admins', id), d) : updateLocal('admins', id, d);
export const deleteAdmin = id => isFirebaseConfigured ? deleteDoc(doc(db, 'admins', id)) : deleteLocal('admins', id);

// ── SEED DEFAULT DATA ──
export async function seedIfEmpty() {
  if (!isFirebaseConfigured) {
    if (!localStorage.getItem(localKey('admins'))) localStorage.setItem(localKey('admins'), JSON.stringify(ADMINS));
    if (!localStorage.getItem(localKey('instructors'))) localStorage.setItem(localKey('instructors'), JSON.stringify(INSTRUCTORS));
    return;
  }
  const snap = await getDocs(collection(db, 'admins'));
  const batch = writeBatch(db);
  let changed = false;

  const existingAdmins = new Map(snap.docs.map(d => [String(d.data().username || '').toLowerCase().trim(), d]));
  ADMINS.forEach(({ id, ...admin }) => {
    const existing = existingAdmins.get(admin.username);
    if (existing) {
      const current = existing.data();
      const repairedAdmin = {
        name: current.name ?? admin.name,
        username: current.username ?? admin.username,
        pin: current.pin ?? admin.pin,
        role: current.role ?? admin.role,
      };
      const needsRepair =
        current.name == null ||
        current.username == null ||
        current.pin == null ||
        current.role == null;
      if (needsRepair) {
        batch.set(existing.ref, repairedAdmin, { merge: true });
        changed = true;
      }
    } else {
      const r = doc(collection(db, 'admins'));
      batch.set(r, { ...admin, createdAt: serverTimestamp() });
      changed = true;
    }
  });

  const instSnap = await getDocs(collection(db, 'instructors'));
  if (instSnap.empty) {
    INSTRUCTORS.forEach(({ id, ...instructor }) => {
      const r = doc(collection(db, 'instructors'));
      batch.set(r, { ...instructor, createdAt: serverTimestamp() });
      changed = true;
    });
  }

  if (changed) await batch.commit();
}

// Audit logs
export async function writeAuditLog({ action, entity, entityId, adminId, adminName, details = {} }) {
  const data = {
    action,
    entity,
    entityId: entityId || null,
    adminId: adminId || null,
    adminName: adminName || 'Unknown',
    details,
  };

  try {
    if (!isFirebaseConfigured) {
      await addLocal('auditLogs', { ...data, timestamp: stamp() });
      return;
    }

    await addDoc(collection(db, 'auditLogs'), {
      ...data,
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Audit log write failed:', e);
  }
}

export function listenAuditLogs(cb) {
  if (!isFirebaseConfigured) {
    return listenLocal('auditLogs', logs =>
      cb([...logs].sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)).slice(0, 200))
    );
  }

  const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(200));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => cb([]));
}
