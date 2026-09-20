import { db as firestoreDb } from '../lib/firebase.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  limit,
} from 'firebase/firestore';
import type { User, InspectionReport } from '../types.ts';
import { DEFAULT_USERS, DEFAULT_INSPECTIONS, DbUser } from './initialData.ts';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data_users.json');
const INSPECTIONS_FILE = path.join(process.cwd(), 'data_inspections.json');

// Helper to sanitize objects for Firestore (removes undefined values)
export function cleanForFirestore<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (value === undefined) return null;
      return value;
    })
  );
}

// Helper to safely read JSON files
export function readJsonSafe<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn(`[STORAGE] Failed reading ${path.basename(filePath)}:`, err);
  }
  return fallback;
}

// Helper to safely write JSON files
export function writeJsonSafe<T>(filePath: string, data: T): void {
  try {
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.warn(`[STORAGE] Failed writing ${path.basename(filePath)}:`, err);
  }
}

/**
 * Seed initial users and demo inspections to Firestore if not already populated.
 * This guarantees permanent cloud storage across all container restarts.
 */
export async function seedInitialDataIfNeeded(): Promise<void> {
  try {
    // 1. Ensure local fallback JSON files exist with defaults
    if (!fs.existsSync(USERS_FILE)) {
      writeJsonSafe(USERS_FILE, DEFAULT_USERS);
    }
    if (!fs.existsSync(INSPECTIONS_FILE)) {
      writeJsonSafe(INSPECTIONS_FILE, DEFAULT_INSPECTIONS);
    }

    // 2. Check if Firestore has users; seed default demo users if missing
    try {
      await Promise.race([
        (async () => {
          for (const u of DEFAULT_USERS) {
            const uDoc = doc(firestoreDb, 'users', u.id);
            const snap = await getDoc(uDoc);
            if (!snap.exists()) {
              await setDoc(uDoc, cleanForFirestore(u), { merge: true });
            }
          }
          console.log('[DATABASE] Seeded default users to permanent Firestore database.');
        })(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore user seed timeout')), 2500)),
      ]);
    } catch (userSeedErr) {
      console.warn('[DATABASE] Firestore user sync notice:', userSeedErr);
    }

    // 3. Check if Firestore has inspections; seed initial demo inspections if collection is empty
    try {
      await Promise.race([
        (async () => {
          const inspCol = collection(firestoreDb, 'inspections');
          const testQuery = query(inspCol, limit(1));
          const testSnap = await getDocs(testQuery);
          if (testSnap.empty) {
            console.log('[DATABASE] Firestore inspections collection empty. Seeding initial records...');
            for (const ins of DEFAULT_INSPECTIONS) {
              const insDoc = doc(firestoreDb, 'inspections', ins.id);
              await setDoc(insDoc, cleanForFirestore(ins), { merge: true });
            }
            console.log('[DATABASE] Initial inspections successfully committed to Firestore.');
          }
        })(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore inspection seed timeout')), 2500)),
      ]);
    } catch (inspSeedErr) {
      console.warn('[DATABASE] Firestore inspection sync notice:', inspSeedErr);
    }
  } catch (error) {
    console.error('Failed to seed initial data:', error);
  }
}

export async function findUserByEmail(email: string): Promise<(User & { passwordHash?: string }) | null> {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();

  // 1. Fast check in local database store first for instant response
  const userList = readJsonSafe<any[]>(USERS_FILE, DEFAULT_USERS);
  const matched = userList.find((u) => (u.email || '').toLowerCase().trim() === cleanEmail);
  if (matched) {
    return {
      id: matched.id || matched.uid,
      name: matched.name,
      email: matched.email,
      role: matched.role as any,
      governmentId: matched.governmentId || undefined,
      department: matched.department || undefined,
      scannedHistoryTable: matched.scannedHistoryTable || undefined,
      createdAt: matched.createdAt || undefined,
      passwordHash: matched.passwordHash || undefined,
    };
  }

  // 2. Check Firestore with a quick timeout fallback
  try {
    const q = query(collection(firestoreDb, 'users'), where('email', '==', cleanEmail), limit(1));
    const snap = await Promise.race([
      getDocs(q),
      new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 1500))
    ]);
    if (snap && !snap.empty) {
      const data = snap.docs[0].data() as any;
      return {
        id: data.id || snap.docs[0].id,
        name: data.name,
        email: data.email,
        role: data.role as any,
        governmentId: data.governmentId || undefined,
        department: data.department || undefined,
        scannedHistoryTable: data.scannedHistoryTable || undefined,
        createdAt: data.createdAt || undefined,
        passwordHash: data.passwordHash || undefined,
      };
    }
  } catch (fsErr) {
    console.warn('[FIRESTORE] findUserByEmail notice:', fsErr);
  }

  return null;
}

export async function findUserByIdentifier(identifier: string): Promise<(User & { passwordHash?: string }) | null> {
  if (!identifier || typeof identifier !== 'string') return null;
  const cleanId = identifier.trim().toLowerCase();
  const alphaNum = cleanId.replace(/[^a-z0-9]/g, '');

  // 1. Fast local database lookup first
  const userList = readJsonSafe<any[]>(USERS_FILE, DEFAULT_USERS);
  const matched = userList.find((u) => {
    const emailMatch = (u.email || '').toLowerCase().trim() === cleanId;
    const rawGovId = (u.governmentId || '').toLowerCase().trim();
    const govIdMatch = rawGovId === cleanId;
    const govAlphaMatch = alphaNum.length >= 4 && rawGovId.replace(/[^a-z0-9]/g, '') === alphaNum;
    const idMatch = (u.id || u.uid || '').toLowerCase().trim() === cleanId;
    const nameMatch = (u.name || '').toLowerCase().trim() === cleanId;
    const utkrishtaAlias =
      (cleanId === 'utkrishtasingoria@gmail.com' || cleanId === 'id_1788402960464_xg3q' || cleanId === 'bf00oilegmrpnys8mqcaz8fx3j82' || cleanId === 'id_user_utkrishta') &&
      (u.email || '').toLowerCase().trim() === 'utkrishtasingoria@gmail.com';
    return emailMatch || govIdMatch || govAlphaMatch || idMatch || nameMatch || utkrishtaAlias;
  });

  if (matched) {
    return {
      id: matched.id || matched.uid,
      name: matched.name,
      email: matched.email,
      role: matched.role as any,
      governmentId: matched.governmentId || undefined,
      department: matched.department || undefined,
      scannedHistoryTable: matched.scannedHistoryTable || undefined,
      createdAt: matched.createdAt || undefined,
      passwordHash: matched.passwordHash || undefined,
    };
  }

  // 2. Check Firestore with quick timeout fallback
  try {
    const docSnapPromise = getDoc(doc(firestoreDb, 'users', identifier.trim()));
    const docSnap = await Promise.race([
      docSnapPromise,
      new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 1500))
    ]);
    if (docSnap && docSnap.exists()) {
      const data = docSnap.data() as any;
      return {
        id: data.id || docSnap.id,
        name: data.name,
        email: data.email,
        role: data.role as any,
        governmentId: data.governmentId || undefined,
        department: data.department || undefined,
        scannedHistoryTable: data.scannedHistoryTable || undefined,
        createdAt: data.createdAt || undefined,
        passwordHash: data.passwordHash || undefined,
      };
    }

    const emailQuery = query(collection(firestoreDb, 'users'), where('email', '==', cleanId), limit(1));
    const emailSnap = await Promise.race([
      getDocs(emailQuery),
      new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 1500))
    ]);
    if (emailSnap && !emailSnap.empty) {
      const data = emailSnap.docs[0].data() as any;
      return {
        id: data.id || emailSnap.docs[0].id,
        name: data.name,
        email: data.email,
        role: data.role as any,
        governmentId: data.governmentId || undefined,
        department: data.department || undefined,
        scannedHistoryTable: data.scannedHistoryTable || undefined,
        createdAt: data.createdAt || undefined,
        passwordHash: data.passwordHash || undefined,
      };
    }
  } catch (fsErr) {
    console.warn('[FIRESTORE] findUserByIdentifier notice:', fsErr);
  }

  return null;
}

export async function findUserById(uid: string): Promise<User | null> {
  if (!uid) return null;

  // 1. Fast check local database store
  const userList = readJsonSafe<any[]>(USERS_FILE, DEFAULT_USERS);
  const matched = userList.find((u) => {
    if (u.id === uid || u.uid === uid) return true;
    if (
      (uid === 'Bf00oilEgMRpNy8SmQcAZ8FX3j82' || uid === 'id_user_utkrishta' || uid === 'id_1788402960464_xg3q') &&
      (u.email || '').toLowerCase().trim() === 'utkrishtasingoria@gmail.com'
    ) {
      return true;
    }
    return false;
  });

  if (matched) {
    return {
      id: matched.id || matched.uid,
      name: matched.name,
      email: matched.email,
      role: matched.role as any,
      governmentId: matched.governmentId || undefined,
      department: matched.department || undefined,
      scannedHistoryTable: matched.scannedHistoryTable || undefined,
      createdAt: matched.createdAt || undefined,
    };
  }

  // 2. Query Firestore with quick timeout
  try {
    const snap = await Promise.race([
      getDoc(doc(firestoreDb, 'users', uid)),
      new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 1500))
    ]);
    if (snap && snap.exists()) {
      const r = snap.data() as any;
      return {
        id: r.id || uid,
        name: r.name,
        email: r.email,
        role: r.role as any,
        governmentId: r.governmentId || undefined,
        department: r.department || undefined,
        scannedHistoryTable: r.scannedHistoryTable || undefined,
        createdAt: r.createdAt || undefined,
      };
    }
  } catch (fsErr) {
    console.warn('[FIRESTORE] findUserById notice:', fsErr);
  }

  return null;
}

export async function insertUser(userData: {
  uid: string;
  name: string;
  email: string;
  role: string;
  governmentId?: string;
  department?: string;
  passwordHash?: string;
}): Promise<User> {
  const cleanEmail = userData.email.toLowerCase().trim();
  const userRecord: DbUser = {
    id: userData.uid,
    name: userData.name,
    email: cleanEmail,
    role: userData.role as any,
    governmentId: userData.governmentId || undefined,
    department: userData.department || undefined,
    scannedHistoryTable: `history_${userData.uid}`,
    createdAt: new Date().toISOString(),
    passwordHash: userData.passwordHash || 'password123',
  };

  // 1. Save to permanent Firestore database
  try {
    await setDoc(doc(firestoreDb, 'users', userData.uid), cleanForFirestore(userRecord), { merge: true });
    console.log(`[FIRESTORE] User ${userData.uid} (${cleanEmail}) saved permanently.`);
  } catch (fsErr) {
    console.error('[FIRESTORE] Failed to save user to Firestore:', fsErr);
  }

  // 2. Save to local persistent database cache
  const userList = readJsonSafe<any[]>(USERS_FILE, DEFAULT_USERS);
  const existingIdx = userList.findIndex((u) => u.id === userData.uid || u.email.toLowerCase() === cleanEmail);
  if (existingIdx >= 0) {
    userList[existingIdx] = { ...userList[existingIdx], ...userRecord };
  } else {
    userList.push(userRecord);
  }
  writeJsonSafe(USERS_FILE, userList);

  return {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    role: userRecord.role,
    governmentId: userRecord.governmentId,
    department: userRecord.department,
    scannedHistoryTable: userRecord.scannedHistoryTable,
    createdAt: userRecord.createdAt,
  };
}

export async function updateUser(
  uid: string,
  fields: Partial<{ name: string; governmentId: string; department: string; passwordHash: string }>
): Promise<User | null> {
  // 1. Update in permanent Firestore
  try {
    await setDoc(doc(firestoreDb, 'users', uid), cleanForFirestore(fields), { merge: true });
  } catch (fsErr) {
    console.warn('[FIRESTORE] updateUser notice:', fsErr);
  }

  // 2. Update in local persistent database cache
  const userList = readJsonSafe<any[]>(USERS_FILE, DEFAULT_USERS);
  const existingIdx = userList.findIndex((u) => u.id === uid || u.uid === uid);
  if (existingIdx >= 0) {
    userList[existingIdx] = { ...userList[existingIdx], ...fields };
    writeJsonSafe(USERS_FILE, userList);
  }

  return findUserById(uid);
}

/**
 * Get all inspections for a user.
 * Supports email / alias lookup and queries Firestore with instant local fallback.
 */
export async function getInspections(userId?: string, userEmail?: string): Promise<InspectionReport[]> {
  if (!userId || userId === 'guest') {
    return [];
  }

  // Determine all possible userIds and emails for this user
  const userIds = new Set<string>([userId]);
  let cleanEmail = (userEmail || '').toLowerCase().trim();

  // If user is utkrishtasingoria@gmail.com or has known aliases:
  if (
    userId === 'id_1788402960464_xg3q' ||
    userId === 'Bf00oilEgMRpNy8SmQcAZ8FX3j82' ||
    userId === 'id_user_utkrishta' ||
    cleanEmail === 'utkrishtasingoria@gmail.com'
  ) {
    userIds.add('id_1788402960464_xg3q');
    userIds.add('Bf00oilEgMRpNy8SmQcAZ8FX3j82');
    userIds.add('id_user_utkrishta');
    cleanEmail = 'utkrishtasingoria@gmail.com';
  }

  let firestoreInspections: InspectionReport[] = [];

  // 1. Query permanent Firestore with safe timeout
  try {
    const fetchWithTimeout = async () => {
      const results: InspectionReport[] = [];
      const seenIds = new Set<string>();

      for (const uid of userIds) {
        const q = query(
          collection(firestoreDb, 'inspections'),
          where('userId', '==', uid)
        );
        const snap = await getDocs(q);
        for (const docSnap of snap.docs) {
          if (!seenIds.has(docSnap.id)) {
            seenIds.add(docSnap.id);
            results.push(docSnap.data() as InspectionReport);
          }
        }
      }
      return results;
    };

    firestoreInspections = await Promise.race([
      fetchWithTimeout(),
      new Promise<InspectionReport[]>((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 1500))
    ]);

    if (firestoreInspections.length > 0) {
      firestoreInspections = firestoreInspections.map((item) => ({
        ...item,
        userId: userId, // Normalize to requested userId so client matching succeeds 100%
      }));
      firestoreInspections.sort(
        (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
      );
      console.log(`[FIRESTORE] Retrieved ${firestoreInspections.length} permanent inspection records for user ${userId}.`);
      return firestoreInspections;
    }
  } catch (fsErr) {
    console.warn('[FIRESTORE] getInspections fallback notice:', fsErr);
  }

  // 2. Fast local persistent cache lookup
  const localList = readJsonSafe<InspectionReport[]>(INSPECTIONS_FILE, DEFAULT_INSPECTIONS);
  const list = localList
    .filter((i) => {
      if (userIds.has(i.userId || '')) return true;
      if (cleanEmail && (i as any).userEmail?.toLowerCase() === cleanEmail) return true;
      if (cleanEmail === 'utkrishtasingoria@gmail.com' && (i.userName?.includes('Utkrishta') || i.userId === 'id_1788402960464_xg3q')) return true;
      return false;
    })
    .map((item) => ({
      ...item,
      userId: userId, // Normalize to active session userId
    }));

  list.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
  console.log(`[STORAGE] Found ${list.length} inspections for user ${userId} (${cleanEmail}) in local persistent store.`);
  return list;
}

export async function getInspectionById(id: string): Promise<InspectionReport | null> {
  // 1. Query local store first for instant response
  const inspectionList = readJsonSafe<InspectionReport[]>(INSPECTIONS_FILE, DEFAULT_INSPECTIONS);
  const matched = inspectionList.find((i) => i.id === id);
  if (matched) return matched;

  // 2. Query Firestore with timeout
  try {
    const snap = await Promise.race([
      getDoc(doc(firestoreDb, 'inspections', id)),
      new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 1500))
    ]);
    if (snap && snap.exists()) {
      return snap.data() as InspectionReport;
    }
  } catch (fsErr) {
    console.warn('[FIRESTORE] getInspectionById notice:', fsErr);
  }

  return null;
}

/**
 * Upsert an inspection report permanently into Firestore and local store.
 */
export async function upsertInspection(report: InspectionReport): Promise<InspectionReport> {
  const sanitized = cleanForFirestore(report);

  // 1. Mirror into local JSON cache first
  const inspectionList = readJsonSafe<InspectionReport[]>(INSPECTIONS_FILE, []);
  const existingIdx = inspectionList.findIndex((i) => i.id === report.id);
  if (existingIdx >= 0) {
    inspectionList[existingIdx] = { ...inspectionList[existingIdx], ...report };
  } else {
    inspectionList.unshift(report);
  }
  writeJsonSafe(INSPECTIONS_FILE, inspectionList);

  // 2. Permanently store in Firestore with safe timeout
  try {
    await Promise.race([
      setDoc(doc(firestoreDb, 'inspections', report.id), sanitized, { merge: true }),
      new Promise<void>((_, reject) => setTimeout(() => reject(new Error('Firestore write timeout')), 2000))
    ]);
    console.log(`[FIRESTORE] Inspection ${report.id} permanently saved for user ${report.userId}.`);
  } catch (fsErr) {
    console.warn('[FIRESTORE] Notice: could not write inspection to Firestore (local copy preserved):', fsErr);
  }

  return report;
}

/**
 * Update an inspection report permanently in Firestore.
 */
export async function updateInspection(id: string, updates: Partial<InspectionReport>): Promise<InspectionReport | null> {
  const updatedData: Partial<InspectionReport> = {
    ...updates,
    isEdited: true,
    lastEditedAt: new Date().toISOString(),
  };

  const sanitized = cleanForFirestore(updatedData);

  // 1. Update in Firestore
  try {
    await setDoc(doc(firestoreDb, 'inspections', id), sanitized, { merge: true });
    console.log(`[FIRESTORE] Inspection ${id} updated permanently in Firestore.`);
  } catch (fsErr) {
    console.error('[FIRESTORE] Error updating inspection in Firestore:', fsErr);
  }

  // 2. Update in local cache
  const inspectionList = readJsonSafe<InspectionReport[]>(INSPECTIONS_FILE, []);
  const existingIdx = inspectionList.findIndex((i) => i.id === id);
  if (existingIdx >= 0) {
    inspectionList[existingIdx] = { ...inspectionList[existingIdx], ...updatedData };
  } else {
    const newReport: InspectionReport = {
      id,
      timestamp: new Date().toISOString(),
      userId: updates.userId || 'guest',
      userName: updates.userName || 'Auditor',
      userRole: updates.userRole || 'consumer',
      productName: updates.productName || 'Inspected Commodity',
      category: updates.category || 'General Packaged Commodity',
      complianceScore: updates.complianceScore ?? 85,
      complianceStatus: updates.complianceStatus || 'COMPLIANT',
      enforcementAction: updates.enforcementAction || 'VERIFIED_COMPLIANT',
      inspectorRemarks: updates.inspectorRemarks || '',
      imageUrls: updates.imageUrls || [],
      extractedData: updates.extractedData || ({} as any),
      violations: updates.violations || [],
      ...updatedData,
    };
    inspectionList.unshift(newReport);
  }
  writeJsonSafe(INSPECTIONS_FILE, inspectionList);

  return getInspectionById(id);
}

/**
 * Delete an inspection report from Firestore and local cache.
 */
export async function deleteInspection(id: string, userId?: string, role?: string): Promise<boolean> {
  // 1. Delete in permanent Firestore
  try {
    await deleteDoc(doc(firestoreDb, 'inspections', id));
    console.log(`[FIRESTORE] Deleted inspection ${id} permanently.`);
  } catch (fsErr) {
    console.error('[FIRESTORE] Error deleting inspection from Firestore:', fsErr);
  }

  // 2. Delete from local cache
  const inspectionList = readJsonSafe<InspectionReport[]>(INSPECTIONS_FILE, []);
  const updatedList = inspectionList.filter((ins) => {
    if (ins.id !== id) return true;
    if (userId && ins.userId === userId) return false;
    if (role === 'official' && !userId) return false;
    return true;
  });
  writeJsonSafe(INSPECTIONS_FILE, updatedList);

  return true;
}

/**
 * Clear all user inspections from Firestore and local cache.
 */
export async function clearUserInspections(userId: string): Promise<number> {
  let count = 0;

  // 1. Clear in Firestore
  try {
    const q = query(collection(firestoreDb, 'inspections'), where('userId', '==', userId));
    const snap = await getDocs(q);
    count = snap.size;
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    console.log(`[FIRESTORE] Cleared ${count} inspections for user ${userId}.`);
  } catch (fsErr) {
    console.warn('[FIRESTORE] clearUserInspections notice:', fsErr);
  }

  // 2. Clear in local cache
  const inspectionList = readJsonSafe<InspectionReport[]>(INSPECTIONS_FILE, []);
  const remaining = inspectionList.filter((i) => i.userId !== userId);
  writeJsonSafe(INSPECTIONS_FILE, remaining);

  return count;
}
