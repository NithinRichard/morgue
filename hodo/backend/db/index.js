import * as mssql from './mssql.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
dotenv.config();

const backend = process.env.DATA_SOURCE || 'mssql';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'db.json');

// Helper to read db.json
const readDbJson = () => {
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
};

// Helper to write db.json
const writeDbJson = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
};
export { writeDbJson, dbPath };

export const addBody = async (bodyData) => {
  if (backend === 'dbjson') {
    const db = readDbJson();
    const newBody = { 
      id: `B${String(db.bodies.length + 1).padStart(3, '0')}`, 
      ...bodyData,
      registrationDate: new Date().toISOString() 
    };
    db.bodies.push(newBody);
    writeDbJson(db);
    return newBody;
  }
  return mssql.addBody(bodyData);
};

export const getBodies = async () => {
  if (backend === 'dbjson') {
    const db = readDbJson();
    return db.bodies || [];
  }
  return mssql.getBodies();
};

export const getExits = async () => {
  if (backend === 'dbjson') {
    const db = readDbJson();
    return db.exits || [];
  }
  return mssql.getExits();
};

export const getExitBodies = async () => {
  if (backend === 'dbjson') {
    const db = readDbJson();
    return db.exitBodies || [];
  }
  return mssql.getExitBodies();
};

export const getStorageUnits = async () => {
  if (backend === 'dbjson') {
    const db = readDbJson();
    return db.storageUnits || [];
  }
  return mssql.getStorageUnits();
};

export const getMovements = async () => {
  if (backend === 'dbjson') {
    const db = readDbJson();
    return db.movements || [];
  }
  return mssql.getMovements();
};

export const getAccompanyingPersons = async () => {
  if (backend === 'dbjson') {
    const db = readDbJson();
    return db.accompanyingPersons || [];
  }
  return mssql.getAccompanyingPersons();
};

export const getBelongings = async () => {
  if (backend === 'dbjson') {
    const db = readDbJson();
    return db.belongings || [];
  }
  return mssql.getBelongings();
};

export const getDischarges = async () => {
  if (backend === 'dbjson') {
    const db = readDbJson();
    return db.discharges || [];
  }
  return mssql.getDischarges();
};

export const getExpiredPatients = mssql.getExpiredPatients;

export const getStorageAllocations = async () => {
  if (backend === 'dbjson') {
    const db = readDbJson();
    return db.storage_allocations || [];
  }
  return mssql.getStorageAllocations();
};

export const getActiveStorageAllocations = async () => {
  if (backend === 'dbjson') {
    const db = readDbJson();
    return (db.storage_allocations || []).filter(allocation => 
      allocation.status === 'active' || allocation.status === 'occupied'
    );
  }
  return mssql.getActiveStorageAllocations();
};

export const getExitsWithStorageInfo = async () => {
  if (backend === 'dbjson') {
    const db = readDbJson();
    const exits = db.exits || [];
    const bodies = db.bodies || [];
    const storage_allocations = db.storage_allocations || [];
    return exits.map(exit => {
      const body = bodies.find(b => b.id === exit.id || b.id === exit.bodyId || b.id === exit.BD_ID_PK);
      // Try to find allocation by body id (assuming body.id is referenced)
      const storage = storage_allocations.find(sa => sa.bodyId === (body ? body.id : exit.id));
      return {
        ...exit,
        bodyDetails: body || null,
        storageAllocation: storage || null
      };
    });
  }
  // For MSSQL, call mssql.getExitsWithStorageInfo if it exists
  if (typeof mssql.getExitsWithStorageInfo === 'function') {
    return mssql.getExitsWithStorageInfo();
  }
  return [];
};

export const createMissingStorageAllocations = async () => {
  if (backend === 'dbjson') {
    // For dbjson backend, this would be a no-op since we don't have the same structure
    console.log('createMissingStorageAllocations not implemented for dbjson backend');
    return { success: true, processed: 0 };
  }
  return mssql.createMissingStorageAllocations();
};

export const createStorageAllocation = async (allocationData) => {
  if (backend === 'dbjson') {
    const db = readDbJson();
    const newAllocation = {
      id: Date.now(),
      ...allocationData,
      allocatedDate: new Date().toISOString()
    };
    if (!db.storage_allocations) db.storage_allocations = [];
    db.storage_allocations.push(newAllocation);
    writeDbJson(db);
    return newAllocation;
  }
  return mssql.createStorageAllocation(allocationData);
};

export const updateStorageAllocationStatus = async (allocationId, status, userId) => {
  if (backend === 'dbjson') {
    const db = readDbJson();
    if (!db.storage_allocations) db.storage_allocations = [];
    const allocationIndex = db.storage_allocations.findIndex(a => a.id === allocationId);
    if (allocationIndex !== -1) {
      db.storage_allocations[allocationIndex].status = status;
      db.storage_allocations[allocationIndex].modifiedBy = userId;
      db.storage_allocations[allocationIndex].modifiedOn = new Date().toISOString();
      writeDbJson(db);
      return true;
    }
    return false;
  }
  return mssql.updateStorageAllocationStatus(allocationId, status, userId);
};

export const getAvailableStorageUnits = async (providerId, outletId = null) => {
  if (backend === 'dbjson') {
    const db = readDbJson();
    return db.storage_units || [];
  }
  return mssql.getAvailableStorageUnits(providerId, outletId);
};

export const updateBodyVerification = async (bodyId, verificationData) => {
  if (backend === 'dbjson') {
    const db = readDbJson();
    const bodyIndex = db.bodies.findIndex(b => b.id == bodyId || String(b.id) === String(bodyId));
    if (bodyIndex !== -1) {
      db.bodies[bodyIndex].status = 'verified';
      if (!Array.isArray(db.bodies[bodyIndex].verificationLog)) {
        db.bodies[bodyIndex].verificationLog = [];
      }
      db.bodies[bodyIndex].verificationLog.push({
        ...verificationData,
        date: new Date().toISOString()
      });
      writeDbJson(db);
      return db.bodies[bodyIndex];
    }
    return null;
  }
  return mssql.updateBodyVerification(bodyId, verificationData);
};

export const getBodyVerificationLog = async (bodyId) => {
  if (backend === 'dbjson') {
    const db = readDbJson();
    const body = db.bodies.find(b => b.id == bodyId || String(b.id) === String(bodyId));
    return body ? body.verificationLog || [] : [];
  }
  return mssql.getBodyVerificationLog(bodyId);
};

export const getPatientById = async (patientId) => {
  if (backend === 'dbjson') {
    const db = readDbJson();
    return db.patients.find(p => p.id == patientId || String(p.id) === String(patientId)) || null;
  }
  return mssql.getPatientById(patientId);
};
