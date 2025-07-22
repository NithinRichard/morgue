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