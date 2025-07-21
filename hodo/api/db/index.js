import * as mssql from './mssql.js';
// import * as lowdb from './lowdb.js'; // Uncomment if you want to support lowdb fallback

const backend = process.env.DB_BACKEND || 'mssql';

export const getBodies = async () => {
  return backend === 'mssql' ? mssql.getBodies() : [];
};

export const getExits = async () => {
  return backend === 'mssql' ? mssql.getExits() : [];
};

export const getStorageUnits = async () => {
  return backend === 'mssql' ? mssql.getStorageUnits() : [];
};

export const getMovements = async () => {
  return backend === 'mssql' ? mssql.getMovements() : [];
};

export const getAccompanyingPersons = async () => {
  return backend === 'mssql' ? mssql.getAccompanyingPersons() : [];
};

export const getBelongings = async () => {
  return backend === 'mssql' ? mssql.getBelongings() : [];
}; 