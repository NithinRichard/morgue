import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

export const getBodies = async () => {
  await sql.connect(config);
  const result = await sql.query('SELECT * FROM body_details ORDER BY BD_Added_on DESC');
  return result.recordset;
};

export const getExits = async () => {
  await sql.connect(config);
  const result = await sql.query('SELECT * FROM body_exit ORDER BY BE_Added_on DESC');
  return result.recordset;
};

export const getStorageUnits = async () => {
  await sql.connect(config);
  const result = await sql.query('SELECT * FROM storage_unit ORDER BY SU_Added_on DESC');
  return result.recordset;
};

export const getMovements = async () => {
  await sql.connect(config);
  const result = await sql.query('SELECT * FROM movements ORDER BY MV_timestamp DESC');
  return result.recordset;
};

export const getAccompanyingPersons = async () => {
  await sql.connect(config);
  const result = await sql.query('SELECT * FROM accompanying_persons');
  return result.recordset;
};

export const getBelongings = async () => {
  await sql.connect(config);
  const result = await sql.query('SELECT * FROM belongings');
  return result.recordset;
}; 