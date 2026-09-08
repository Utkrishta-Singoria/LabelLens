import { db } from './index.ts';
import { users, inspections } from './schema.ts';
import { eq, desc, and, or } from 'drizzle-orm';
import type { User, InspectionReport } from '../types.ts';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data_users.json');
const INSPECTIONS_FILE = path.join(process.cwd(), 'data_inspections.json');

// Helper to safely read JSON files
function readJsonSafe<T>(filePath: string, fallback: T): T {
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
function writeJsonSafe<T>(filePath: string, data: T): void {
  try {
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.warn(`[STORAGE] Failed writing ${path.basename(filePath)}:`, err);
  }
}

export async function seedInitialDataIfNeeded() {
  try {
    // 1. Ensure local JSON user database exists and is populated
    if (!fs.existsSync(USERS_FILE)) {
      writeJsonSafe(USERS_FILE, []);
    }

    // 2. Ensure local JSON inspections database exists
    if (!fs.existsSync(INSPECTIONS_FILE)) {
      writeJsonSafe(INSPECTIONS_FILE, []);
    }

    // 3. Sync with Cloud SQL if database connection is configured
    if (process.env.SQL_HOST && process.env.SQL_DB_NAME) {
      try {
        const existingUsers = await db.select({ count: users.id }).from(users).limit(1);
        if (existingUsers.length === 0) {
          const userList = readJsonSafe<any[]>(USERS_FILE, []);
          for (const u of userList) {
            try {
              await db.insert(users).values({
                uid: u.id,
                name: u.name || 'User',
                email: (u.email || '').toLowerCase().trim(),
                role: u.role || 'consumer',
                governmentId: u.governmentId || null,
                department: u.department || null,
                passwordHash: u.passwordHash || null,
                scannedHistoryTable: u.scannedHistoryTable || null,
              }).onConflictDoNothing();
            } catch {}
          }
        }

        const existingInspections = await db.select({ count: inspections.id }).from(inspections).limit(1);
        if (existingInspections.length === 0) {
          const inspectionList = readJsonSafe<InspectionReport[]>(INSPECTIONS_FILE, []);
          for (const ins of inspectionList) {
            try {
              await db.insert(inspections).values({
                id: ins.id,
                userId: ins.userId || 'id_user_01',
                userName: ins.userName || null,
                userRole: ins.userRole || null,
                governmentId: ins.governmentId || null,
                productName: ins.productName || 'Sample Product',
                category: ins.category || 'General Packaged Commodity',
                complianceScore: ins.complianceScore ?? 0,
                complianceStatus: ins.complianceStatus || 'NON_COMPLIANT',
                enforcementAction: ins.enforcementAction || 'NOTICE_ISSUED',
                inspectorRemarks: ins.inspectorRemarks || null,
                timestamp: ins.timestamp || new Date().toISOString(),
                imageUrls: JSON.stringify(ins.imageUrls || []),
                extractedData: JSON.stringify(ins.extractedData || {}),
                violations: JSON.stringify(ins.violations || []),
                barcodeNumber: ins.barcodeNumber || null,
                isEdited: Boolean(ins.isEdited),
                lastEditedAt: ins.lastEditedAt || null,
              }).onConflictDoNothing();
            } catch {}
          }
        }
      } catch (sqlErr) {
        console.warn('[DATABASE] Cloud SQL sync notice:', sqlErr);
      }
    }
  } catch (error) {
    console.error('Failed to seed initial data:', error);
  }
}

export async function findUserByEmail(email: string): Promise<(User & { passwordHash?: string }) | null> {
  const cleanEmail = email.toLowerCase().trim();

  // 1. Check Cloud SQL if configured
  if (process.env.SQL_HOST && process.env.SQL_DB_NAME) {
    try {
      const rows = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
      if (rows.length > 0) {
        const r = rows[0];
        return {
          id: r.uid,
          name: r.name,
          email: r.email,
          role: r.role as any,
          governmentId: r.governmentId || undefined,
          department: r.department || undefined,
          scannedHistoryTable: r.scannedHistoryTable || undefined,
          createdAt: r.createdAt ? r.createdAt.toISOString() : undefined,
          passwordHash: r.passwordHash || undefined,
        };
      }
    } catch {}
  }

  // 2. Check local database store
  const userList = readJsonSafe<any[]>(USERS_FILE, []);
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

  return null;
}

export async function findUserByIdentifier(identifier: string): Promise<(User & { passwordHash?: string }) | null> {
  if (!identifier || typeof identifier !== 'string') return null;
  const cleanId = identifier.trim().toLowerCase();
  const alphaNum = cleanId.replace(/[^a-z0-9]/g, '');

  // 1. Check Cloud SQL if configured
  if (process.env.SQL_HOST && process.env.SQL_DB_NAME) {
    try {
      const rows = await db.select().from(users).where(
        or(
          eq(users.email, cleanId),
          eq(users.uid, identifier.trim()),
          eq(users.governmentId, identifier.trim())
        )
      ).limit(1);
      if (rows.length > 0) {
        const r = rows[0];
        return {
          id: r.uid,
          name: r.name,
          email: r.email,
          role: r.role as any,
          governmentId: r.governmentId || undefined,
          department: r.department || undefined,
          scannedHistoryTable: r.scannedHistoryTable || undefined,
          createdAt: r.createdAt ? r.createdAt.toISOString() : undefined,
          passwordHash: r.passwordHash || undefined,
        };
      }
    } catch {}
  }

  // 2. Check local database store
  const userList = readJsonSafe<any[]>(USERS_FILE, []);
  const matched = userList.find((u) => {
    const emailMatch = (u.email || '').toLowerCase().trim() === cleanId;
    const rawGovId = (u.governmentId || '').toLowerCase().trim();
    const govIdMatch = rawGovId === cleanId;
    const govAlphaMatch = alphaNum.length >= 4 && rawGovId.replace(/[^a-z0-9]/g, '') === alphaNum;
    const idMatch = (u.id || u.uid || '').toLowerCase().trim() === cleanId;
    const nameMatch = (u.name || '').toLowerCase().trim() === cleanId;
    return emailMatch || govIdMatch || govAlphaMatch || idMatch || nameMatch;
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

  return null;
}

export async function findUserById(uid: string): Promise<User | null> {
  // 1. Check Cloud SQL if configured
  if (process.env.SQL_HOST && process.env.SQL_DB_NAME) {
    try {
      const rows = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
      if (rows.length > 0) {
        const r = rows[0];
        return {
          id: r.uid,
          name: r.name,
          email: r.email,
          role: r.role as any,
          governmentId: r.governmentId || undefined,
          department: r.department || undefined,
          scannedHistoryTable: r.scannedHistoryTable || undefined,
          createdAt: r.createdAt ? r.createdAt.toISOString() : undefined,
        };
      }
    } catch {}
  }

  // 2. Check local database store
  const userList = readJsonSafe<any[]>(USERS_FILE, []);
  const matched = userList.find((u) => u.id === uid || u.uid === uid);
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
  const userRecord: User & { passwordHash?: string; scannedHistoryTable?: string } = {
    id: userData.uid,
    name: userData.name,
    email: cleanEmail,
    role: userData.role as any,
    governmentId: userData.governmentId || undefined,
    department: userData.department || undefined,
    scannedHistoryTable: `history_${userData.uid}`,
    createdAt: new Date().toISOString(),
    passwordHash: userData.passwordHash || undefined,
  };

  // 1. Save to local persistent database store
  const userList = readJsonSafe<any[]>(USERS_FILE, []);
  const existingIdx = userList.findIndex((u) => u.id === userData.uid || u.email.toLowerCase() === cleanEmail);
  if (existingIdx >= 0) {
    userList[existingIdx] = { ...userList[existingIdx], ...userRecord };
  } else {
    userList.push(userRecord);
  }
  writeJsonSafe(USERS_FILE, userList);

  // 2. Save to Cloud SQL if configured
  if (process.env.SQL_HOST && process.env.SQL_DB_NAME) {
    try {
      await db.insert(users).values({
        uid: userData.uid,
        name: userData.name,
        email: cleanEmail,
        role: userData.role,
        governmentId: userData.governmentId || null,
        department: userData.department || null,
        passwordHash: userData.passwordHash || null,
        scannedHistoryTable: `history_${userData.uid}`,
      }).onConflictDoNothing();
    } catch {}
  }

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
  // 1. Update in local persistent database store
  const userList = readJsonSafe<any[]>(USERS_FILE, []);
  const existingIdx = userList.findIndex((u) => u.id === uid || u.uid === uid);
  if (existingIdx >= 0) {
    userList[existingIdx] = { ...userList[existingIdx], ...fields };
    writeJsonSafe(USERS_FILE, userList);
  }

  // 2. Update in Cloud SQL if configured
  if (process.env.SQL_HOST && process.env.SQL_DB_NAME) {
    try {
      await db.update(users).set(fields as any).where(eq(users.uid, uid));
    } catch {}
  }

  return findUserById(uid);
}

function parseInspectionRow(r: any): InspectionReport {
  let imageUrls: string[] = [];
  try {
    if (r.imageUrls) imageUrls = JSON.parse(r.imageUrls);
  } catch {}

  let extractedData: any = {};
  try {
    if (r.extractedData) extractedData = JSON.parse(r.extractedData);
  } catch {}

  let violations: any[] = [];
  try {
    if (r.violations) violations = JSON.parse(r.violations);
  } catch {}

  return {
    id: r.id,
    userId: r.userId,
    userName: r.userName || undefined,
    userRole: r.userRole || undefined,
    governmentId: r.governmentId || undefined,
    productName: r.productName,
    category: r.category,
    complianceScore: r.complianceScore,
    complianceStatus: r.complianceStatus,
    enforcementAction: r.enforcementAction,
    inspectorRemarks: r.inspectorRemarks || '',
    timestamp: r.timestamp || undefined,
    imageUrls,
    extractedData,
    violations,
    barcodeNumber: r.barcodeNumber || undefined,
    isEdited: r.isEdited || false,
    lastEditedAt: r.lastEditedAt || undefined,
  };
}

export async function getInspections(userId?: string): Promise<InspectionReport[]> {
  // If no user is authenticated, do not leak or return any inspection records
  if (!userId || userId === 'guest') {
    return [];
  }

  // 1. Query Cloud SQL if configured
  if (process.env.SQL_HOST && process.env.SQL_DB_NAME) {
    try {
      const rows = await db.select().from(inspections)
        .where(eq(inspections.userId, userId))
        .orderBy(desc(inspections.createdAt));
      if (rows && rows.length > 0) {
        return rows.map(parseInspectionRow);
      }
    } catch {}
  }

  // 2. Query local persistent database store
  const inspectionList = readJsonSafe<InspectionReport[]>(INSPECTIONS_FILE, []);
  const list = inspectionList.filter((i) => i.userId === userId);
  list.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
  return list;
}

export async function getInspectionById(id: string): Promise<InspectionReport | null> {
  // 1. Query Cloud SQL if configured
  if (process.env.SQL_HOST && process.env.SQL_DB_NAME) {
    try {
      const rows = await db.select().from(inspections).where(eq(inspections.id, id)).limit(1);
      if (rows.length > 0) return parseInspectionRow(rows[0]);
    } catch {}
  }

  // 2. Query local persistent database store
  const inspectionList = readJsonSafe<InspectionReport[]>(INSPECTIONS_FILE, []);
  const matched = inspectionList.find((i) => i.id === id);
  return matched || null;
}

export async function upsertInspection(report: InspectionReport): Promise<InspectionReport> {
  // 1. Save to local persistent database store
  const inspectionList = readJsonSafe<InspectionReport[]>(INSPECTIONS_FILE, []);
  const existingIdx = inspectionList.findIndex((i) => i.id === report.id);
  if (existingIdx >= 0) {
    inspectionList[existingIdx] = { ...inspectionList[existingIdx], ...report };
  } else {
    inspectionList.unshift(report);
  }
  writeJsonSafe(INSPECTIONS_FILE, inspectionList);

  // 2. Save to Cloud SQL if configured
  if (process.env.SQL_HOST && process.env.SQL_DB_NAME) {
    try {
      const row = {
        id: report.id,
        userId: report.userId || 'id_user_01',
        userName: report.userName || null,
        userRole: report.userRole || null,
        governmentId: report.governmentId || null,
        productName: report.productName || 'Sample Product',
        category: report.category || 'General Packaged Commodity',
        complianceScore: report.complianceScore ?? 0,
        complianceStatus: report.complianceStatus || 'NON_COMPLIANT',
        enforcementAction: report.enforcementAction || 'NOTICE_ISSUED',
        inspectorRemarks: report.inspectorRemarks || null,
        timestamp: report.timestamp || new Date().toISOString(),
        imageUrls: JSON.stringify(report.imageUrls || []),
        extractedData: JSON.stringify(report.extractedData || {}),
        violations: JSON.stringify(report.violations || []),
        barcodeNumber: report.barcodeNumber || null,
        isEdited: Boolean(report.isEdited),
        lastEditedAt: report.lastEditedAt || null,
      };

      await db.insert(inspections)
        .values(row)
        .onConflictDoUpdate({
          target: inspections.id,
          set: {
            productName: row.productName,
            category: row.category,
            complianceScore: row.complianceScore,
            complianceStatus: row.complianceStatus,
            enforcementAction: row.enforcementAction,
            inspectorRemarks: row.inspectorRemarks,
            imageUrls: row.imageUrls,
            extractedData: row.extractedData,
            violations: row.violations,
            barcodeNumber: row.barcodeNumber,
            isEdited: row.isEdited,
            lastEditedAt: row.lastEditedAt,
          },
        });
    } catch {}
  }

  return report;
}

export async function deleteInspection(id: string, userId?: string, role?: string): Promise<boolean> {
  // 1. Delete in local persistent database store strictly checking ownership
  const inspectionList = readJsonSafe<InspectionReport[]>(INSPECTIONS_FILE, []);
  const updatedList = inspectionList.filter((ins) => {
    if (ins.id !== id) return true;
    // Only allow deletion if the record belongs to this user or if an authorized officer
    if (userId && ins.userId === userId) return false;
    if (role === 'official' && !userId) return false;
    return true;
  });
  writeJsonSafe(INSPECTIONS_FILE, updatedList);

  // 2. Delete in Cloud SQL if configured
  if (process.env.SQL_HOST && process.env.SQL_DB_NAME) {
    try {
      if (userId) {
        await db.delete(inspections).where(and(eq(inspections.id, id), eq(inspections.userId, userId)));
      } else if (role === 'official') {
        await db.delete(inspections).where(eq(inspections.id, id));
      }
    } catch {}
  }

  return true;
}

export async function updateInspection(id: string, updates: Partial<InspectionReport>): Promise<InspectionReport | null> {
  const updatedData = {
    ...updates,
    isEdited: true,
    lastEditedAt: new Date().toISOString(),
  };

  // 1. Update in local persistent database store
  const inspectionList = readJsonSafe<InspectionReport[]>(INSPECTIONS_FILE, []);
  const existingIdx = inspectionList.findIndex((i) => i.id === id);
  if (existingIdx >= 0) {
    inspectionList[existingIdx] = { ...inspectionList[existingIdx], ...updatedData };
  } else {
    // If not found in store yet, register as new inspection
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

  // 2. Update in Cloud SQL if configured
  if (process.env.SQL_HOST && process.env.SQL_DB_NAME) {
    try {
      const updateValues: Record<string, any> = {
        isEdited: true,
        lastEditedAt: new Date().toISOString(),
      };
      if (updates.productName !== undefined) updateValues.productName = updates.productName;
      if (updates.category !== undefined) updateValues.category = updates.category;
      if (updates.complianceScore !== undefined) updateValues.complianceScore = updates.complianceScore;
      if (updates.complianceStatus !== undefined) updateValues.complianceStatus = updates.complianceStatus;
      if (updates.enforcementAction !== undefined) updateValues.enforcementAction = updates.enforcementAction;
      if (updates.inspectorRemarks !== undefined) updateValues.inspectorRemarks = updates.inspectorRemarks;
      if (updates.imageUrls !== undefined) updateValues.imageUrls = JSON.stringify(updates.imageUrls);
      if (updates.extractedData !== undefined) updateValues.extractedData = JSON.stringify(updates.extractedData);
      if (updates.violations !== undefined) updateValues.violations = JSON.stringify(updates.violations);
      if (updates.barcodeNumber !== undefined) updateValues.barcodeNumber = updates.barcodeNumber;

      await db.update(inspections).set(updateValues).where(eq(inspections.id, id));
    } catch {}
  }

  return getInspectionById(id);
}

export async function clearUserInspections(userId: string): Promise<number> {
  // 1. Clear in local persistent database store
  const inspectionList = readJsonSafe<InspectionReport[]>(INSPECTIONS_FILE, []);
  const remaining = inspectionList.filter((i) => i.userId !== userId);
  const count = inspectionList.length - remaining.length;
  writeJsonSafe(INSPECTIONS_FILE, remaining);

  // 2. Delete in Cloud SQL if configured
  if (process.env.SQL_HOST && process.env.SQL_DB_NAME) {
    try {
      await db.delete(inspections).where(eq(inspections.userId, userId));
    } catch {}
  }

  return count;
}
