import { db } from "./firebase";
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, orderBy, serverTimestamp, setDoc
} from "firebase/firestore";

// ── FIRM ──────────────────────────────────────────────────────────────────────
export const getFirm  = async (uid) => {
  const snap = await getDoc(doc(db, "firms", uid));
  return snap.exists() ? snap.data() : null;
};
export const saveFirm = async (uid, data) => {
  await setDoc(doc(db, "firms", uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
};

// ── CLIENTS ───────────────────────────────────────────────────────────────────
export const getClients   = async (uid) => {
  const snap = await getDocs(query(collection(db, "clients", uid, "list"), orderBy("createdAt", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const addClient    = async (uid, data) =>
  addDoc(collection(db, "clients", uid, "list"), { ...data, createdAt: serverTimestamp() });
export const updateClient = async (uid, id, data) =>
  updateDoc(doc(db, "clients", uid, "list", id), data);
export const deleteClient = async (uid, id) =>
  deleteDoc(doc(db, "clients", uid, "list", id));

// ── DEADLINES ─────────────────────────────────────────────────────────────────
export const getDeadlines   = async (uid) => {
  const snap = await getDocs(query(collection(db, "deadlines", uid, "list"), orderBy("dueDate", "asc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const addDeadline    = async (uid, data) =>
  addDoc(collection(db, "deadlines", uid, "list"), { ...data, createdAt: serverTimestamp() });
export const updateDeadline = async (uid, id, data) =>
  updateDoc(doc(db, "deadlines", uid, "list", id), data);
export const deleteDeadline = async (uid, id) =>
  deleteDoc(doc(db, "deadlines", uid, "list", id));

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export const getNotifications = async (uid) => {
  const snap = await getDocs(query(collection(db, "notifications", uid, "log"), orderBy("sentAt", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const addNotification  = async (uid, data) =>
  addDoc(collection(db, "notifications", uid, "log"), { ...data, sentAt: serverTimestamp() });

// ── INVOICES ──────────────────────────────────────────────────────────────────
export const getInvoices   = async (uid) => {
  const snap = await getDocs(query(collection(db, "invoices", uid, "list"), orderBy("createdAt", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const addInvoice    = async (uid, data) =>
  addDoc(collection(db, "invoices", uid, "list"), { ...data, createdAt: serverTimestamp() });
export const updateInvoice = async (uid, id, data) =>
  updateDoc(doc(db, "invoices", uid, "list", id), data);

// ── ADMIN ─────────────────────────────────────────────────────────────────────
export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const updateUser = async (uid, data) =>
  updateDoc(doc(db, "users", uid), data);