import * as db from '../db/index.js';
import { writeDbJson, dbPath } from '../db/index.js';
import fs from 'fs';
import dotenv from 'dotenv';
import sql from 'mssql';
dotenv.config();

// Helper function to get storage unit ID by unit code
async function getStorageUnitIdByCode(unitCode) {
  try {
    const pool = await sql.connect({
      user: process.env.MSSQL_USER,
      password: process.env.MSSQL_PASSWORD,
      server: process.env.MSSQL_SERVER,
      database: process.env.MSSQL_DATABASE,
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    });
    
    const result = await pool.request()
      .input('unitCode', sql.NVarChar(20), unitCode)
      .query('SELECT SU_ID_PK FROM storage_unit_master WHERE SU_Unit_Code = @unitCode');
    
    await pool.close();
    
    if (result.recordset.length > 0) {
      return result.recordset[0].SU_ID_PK;
    }
    return null;
  } catch (error) {
    console.error('Error getting storage unit ID by code:', error);
    return null;
  }
}

// Helper function to create a default storage unit if it doesn't exist
async function createDefaultStorageUnit(unitCode, providerId, outletId) {
  try {
    const pool = await sql.connect({
      user: process.env.MSSQL_USER,
      password: process.env.MSSQL_PASSWORD,
      server: process.env.MSSQL_SERVER,
      database: process.env.MSSQL_DATABASE,
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    });
    
    // First, ensure we have default types and locations
    let typeId = 1; // Default freezer type
    let locationId = 1; // Default main mortuary location
    
    const result = await pool.request()
      .input('unitCode', sql.NVarChar(20), unitCode)
      .input('unitName', sql.NVarChar(100), `Storage Unit ${unitCode}`)
      .input('typeId', sql.Int, typeId)
      .input('locationId', sql.Int, locationId)
      .input('providerId', sql.Int, providerId)
      .input('outletId', sql.Int, outletId)
      .input('addedBy', sql.Int, 1)
      .query(`
        INSERT INTO storage_unit_master (
          SU_Unit_Code, SU_Unit_Name, SU_Type_FK, SU_Location_FK, 
          SU_Provider_FK, SU_Outlet_FK, SU_Added_By
        ) VALUES (
          @unitCode, @unitName, @typeId, @locationId, 
          @providerId, @outletId, @addedBy
        )
      `);
    
    await pool.close();
    console.log('Created default storage unit:', unitCode);
    return true;
  } catch (error) {
    console.error('Error creating default storage unit:', error);
    return false;
  }
}

// Helper: parse date string to Date
function parseDate(dateStr) {
  return new Date(dateStr + 'T00:00:00');
}

// For trends endpoint
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// GET /api/analytics/admissions
export const getAdmissionsCount = async (req, res) => {
  const { from, to } = req.query;
  const bodies = await db.getBodies();
  const fromDate = parseDate(from);
  const toDate = parseDate(to);
  const count = bodies.filter(b => {
    const regDate = new Date(b.registrationDate);
    return regDate >= fromDate && regDate <= toDate;
  }).length;
  res.json({ count });
};

// GET /api/analytics/releases
export const getReleasesCount = async (req, res) => {
  const { from, to } = req.query;
  const exits = await db.getExits();
  const fromDate = parseDate(from);
  const toDate = parseDate(to);
  const count = exits.filter(e => {
    const exitDate = new Date(e.exitDate);
    return exitDate >= fromDate && exitDate <= toDate;
  }).length;
  res.json({ count });
};

// GET /api/analytics/average-duration
export const getAverageStorageDuration = async (req, res) => {
  const { from, to } = req.query;
  const exits = await db.getExits();
  const fromDate = parseDate(from);
  const toDate = parseDate(to);
  const durations = exits
    .filter(e => {
      const exitDate = new Date(e.exitDate);
      return exitDate >= fromDate && exitDate <= toDate;
    })
    .map(e => {
      const regDate = new Date(e.registrationDate);
      const exitDate = new Date(e.exitDate);
      return (exitDate - regDate) / (1000 * 60 * 60 * 24); // days
    });
  const avg = durations.length ? (durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  res.json({ averageDays: avg.toFixed(2) });
};

// GET /api/analytics/capacity-usage
export const getCapacityUsage = async (req, res) => {
  const bodies = await db.getBodies();
  const totalUnits = 30; // or fetch dynamically
  const occupied = bodies.filter(b => b.storageUnit).length;
  res.json({ used: occupied, total: totalUnits, percent: ((occupied / totalUnits) * 100).toFixed(1) });
};

// GET /api/bodies


/**
 * @swagger
 * /expired-patients:
 *   get:
 *     summary: Get list of expired patients (IAD_Discharge_Reason = 2)
 *     tags: [Patients]
 *     responses:
 *       200:
 *         description: List of expired patients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   IAD_ID_PK:
 *                     type: integer
 *                     description: Admission ID
 *                   IAD_Patient_fk:
 *                     type: integer
 *                     description: Patient ID
 *                   patientName:
 *                     type: string
 *                     description: Patient's name
 *                   PT_Age:
 *                     type: string
 *                     description: Patient's age
 *                   gender:
 *                     type: string
 *                     description: Patient's gender
 *                   admissionDate:
 *                     type: string
 *                     format: date-time
 *                     description: Date and time of admission
 *                   dischargeDate:
 *                     type: string
 *                     format: date-time
 *                     description: Date and time of discharge
 *                   IAD_Discharge_Reason:
 *                     type: integer
 *                     description: Discharge reason code (2 for expired)
 *                   admittingDoctor:
 *                     type: string
 *                     description: Name of admitting doctor
 *                   consultingDoctor:
 *                     type: string
 *                     description: Name of consulting doctor
 *       500:
 *         description: Server error
 */
export const getExpiredPatients = async (req, res) => {
  try {
    console.log('Fetching expired patients...');
    const expiredPatients = await db.getExpiredPatients();
    console.log('Successfully fetched expired patients:', expiredPatients.length);
    res.json(expiredPatients);
  } catch (error) {
    console.error('Error fetching expired patients:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      number: error.number,
      state: error.state,
      originalError: error.originalError
    });
    res.status(500).json({ 
      error: 'Internal server error while fetching expired patients',
      details: error.message 
    });
  }
};

// GET /api/bodies
export const getBodies = async (req, res) => {
  try {
    const bodies = await db.getBodies();
    // Database already filters for active bodies (BD_Status_Flag = 10)
    res.json(bodies);
  } catch (error) {
    console.error('Error in getBodies:', error);
    res.status(500).send(error.message);
  }
};

export const addBody = async (req, res) => {
  try {
    const { patientId, ...bodyData } = req.body;

    // If a patient ID is provided, look up the patient to ensure it exists
    let actualPatientId = null;
    if (patientId) {
      const patient = await db.getPatientById(patientId);
      if (patient) {
        actualPatientId = patient.PM_Card_PK;
      } else {
        return res.status(400).json({ error: 'Patient not found with the provided ID' });
      }
    }

    // Map the request body to the database fields
    const newBodyData = {
      ...bodyData,
      patientId: actualPatientId,
      name: bodyData.name || 'Unknown'
    };

    // Add to database
    const newBody = await db.addBody(newBodyData);

    // ... (rest of the function)
    res.status(201).json(newBody);
  } catch (error) {
    console.error('Error in addBody controller:', error);
    res.status(500).json({ 
      error: 'Failed to add body',
      details: error.message 
    });
  }
};

export const verifyBody = async (req, res) => {
  try {
    const { id } = req.params;
    const verificationData = {
      ...req.body,
      verifiedBy: req.body.verifiedBy || 'Staff',
      verifiedAt: new Date().toISOString()
    };

    // Use the appropriate database function based on the backend
    if ((process.env.DATA_SOURCE || 'mssql') === 'mssql') {
      // For MSSQL, use the updateBodyVerification function
      const updatedBody = await db.updateBodyVerification(parseInt(id), verificationData);
      if (updatedBody) {
        const responseBody = {
          id: updatedBody.BD_ID_PK,
          status: updatedBody.BD_Status,
          verifiedBy: verificationData.verifiedBy,
          verifiedAt: verificationData.verifiedAt
        };
        return res.status(200).json(responseBody);
      } else {
        return res.status(404).json({ error: 'Body not found' });
      }
    } else {
      // For dbjson backend
      const bodies = await db.getBodies();
      const bodyIndex = bodies.findIndex(b => b.id == id || String(b.id) === String(id));
      
      if (bodyIndex !== -1) {
        const body = bodies[bodyIndex];
        body.status = 'verified';
        body.verifiedBy = verificationData.verifiedBy;
        body.verifiedAt = verificationData.verifiedAt;
        
        // Update verification log if it exists
        if (!Array.isArray(body.verificationLog)) {
          body.verificationLog = [];
        }
        body.verificationLog.push({
          ...verificationData,
          date: new Date().toISOString()
        });
        
        // Save the updated bodies array
        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        dbData.bodies[bodyIndex] = body;
        writeDbJson(dbData);
        
        return res.status(200).json({
          id: body.id,
          status: body.status,
          verifiedBy: body.verifiedBy,
          verifiedAt: body.verifiedAt
        });
      } else {
        return res.status(404).json({ 
          error: 'Body not found',
          searchedId: id
        });
      }
    }
  } catch (error) {
    console.error('Error in verifyBody:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
};

// GET /api/exits
export const getExitsWithStorageInfo = async (req, res) => {
  try {
    const exits = await db.getExitsWithStorageInfo();
    res.json(exits);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const addExit = async (req, res) => {
  try {
    const bodies = await db.getBodies();
    const { id } = req.params;
    const exitDetails = req.body;

    const bodyIndex = bodies.findIndex(b => b.id === id);

    if (bodyIndex !== -1) {
      // Get the body to be released
      const bodyToExit = bodies[bodyIndex];
      
      // Create exit record
      const exitRecord = {
        ...bodyToExit,
        ...exitDetails,
        witnessingStaff: exitDetails.witnessingStaff || '',
        receiverType: exitDetails.receiverType || '',
        receiverIdProof: exitDetails.receiverIdProof || '',
        releaseConditions: exitDetails.releaseConditions || '',
        status: 'released', // Mark the body as released
        nocGenerated: true, // Mark NOC as generated
        exitDate: new Date().toISOString()
      };
      
      // Remove the body from the bodies array
      bodies.splice(bodyIndex, 1);
      
      // Get existing exits and add the new exit record
      const exits = await db.getExits();
      exits.push(exitRecord);
      
      // Update the database
      if ((process.env.DATA_SOURCE || 'mssql') === 'dbjson') {
        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        dbData.bodies = bodies; // Save without the released body
        dbData.exits = exits;   // Add to exits
        writeDbJson(dbData);
      } else {
        // For other data sources, update both bodies and exits
        await db.updateBodies(bodies);
        await db.updateExits(exits);
      }
      
      res.status(200).json(exitRecord);
    } else {
      res.status(404).send('Body not found');
    }
  } catch (error) {
    console.error('Error in addExit:', error);
    res.status(500).send(error.message);
  }
};


export const getBodyById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Looking for body with ID: ${id} (type: ${typeof id})`);
    
    // First, try to find the body in the active bodies (body_details table)
    const bodies = await db.getBodies();
    let body = bodies.find(b => {
      console.log(`Comparing with active body ID: ${b.id} (type: ${typeof b.id})`);
      return b.id == id || b.id === id || String(b.id) === String(id);
    });
    
    if (body) {
      console.log('Found active body:', body.name);
      return res.status(200).json(body);
    }
    
    // If not found in active bodies, check if it's a released body in exit_bodies table
    console.log('Body not found in active bodies, checking exit records...');
    
    if ((process.env.DATA_SOURCE || 'mssql') === 'mssql') {
      // For MSSQL, query the database directly to get released body details
      const pool = await sql.connect({
        user: process.env.MSSQL_USER,
        password: process.env.MSSQL_PASSWORD,
        server: process.env.MSSQL_SERVER,
        database: process.env.MSSQL_DATABASE,
        options: {
          encrypt: false,
          trustServerCertificate: true
        }
      });
      
      // Get body details from body_details table (even if released)
      const bodyResult = await pool.request()
        .input('bodyId', sql.Int, parseInt(id))
        .query(`
          SELECT 
            BD_ID_PK as id,
            BD_Name as name,
            BD_Patient_FK as patientId,
            BD_Date_Of_Death as dateOfDeath,
            BD_Time_Of_Death as timeOfDeath,
            BD_Place_Of_Death as placeOfDeath,
            BD_Cause_Of_Death as causeOfDeath,
            BD_MLC_Case as mlcCase,
            BD_MLC_Number as mlcNumber,
            BD_Police_Station as policeStation,
            BD_Incident_Type as incidentType,
            BD_Risk_Level as riskLevel,
            BD_Storage_Unit as storageUnit,
            BD_Status as status,
            BD_Status_Flag as statusFlag,
            BD_Notes as notes,
            BD_Photo_Path as photoPath,
            BD_Tag_Number as tagNumber,
            BD_Verification_Status as verificationStatus,
            BD_Added_On as registrationDate,
            BD_Modified_On as lastModified,
            BD_Added_By as addedBy,
            BD_Provider_FK as providerId,
            BD_Outlet_FK as outletId
          FROM body_details
          WHERE BD_ID_PK = @bodyId
        `);
      
      if (bodyResult.recordset.length > 0) {
        const bodyRecord = bodyResult.recordset[0];
        
        // Check if this body has an exit record
        const exitResult = await pool.request()
          .input('bodyId', sql.Int, parseInt(id))
          .query(`
            SELECT 
              EB_Id_pk as exitId,
              EB_Exit_Date as exitDate,
              EB_Exit_Time as exitTime,
              EB_Exit_Reason as exitReason,
              EB_Exit_Processed_By as exitProcessedBy,
              EB_Exit_Notes as exitNotes
            FROM exit_bodies
            WHERE EB_Body_Details_FK = @bodyId AND EB_Status = 'Active'
          `);
        
        // Format the body data similar to getBodies() function
        let timeOfDeath;
        if (bodyRecord.timeOfDeath && bodyRecord.dateOfDeath) {
          const timeOnly = bodyRecord.timeOfDeath.toTimeString().substring(0, 8);
          const dateOnly = bodyRecord.dateOfDeath.toISOString().split('T')[0];
          timeOfDeath = `${dateOnly}T${timeOnly}`;
        } else if (bodyRecord.dateOfDeath) {
          timeOfDeath = `${bodyRecord.dateOfDeath.toISOString().split('T')[0]}T12:00:00`;
        } else {
          timeOfDeath = new Date().toISOString();
        }
        
        const formattedBody = {
          ...bodyRecord,
          id: bodyRecord.id || `bd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: bodyRecord.name || 'Unknown',
          timeOfDeath: timeOfDeath,
          status: bodyRecord.status || 'pending',
          riskLevel: bodyRecord.riskLevel || 'medium',
          storageUnit: bodyRecord.storageUnit || 'F-01',
          incidentType: bodyRecord.incidentType || 'natural',
          dateOfDeath: bodyRecord.dateOfDeath ? bodyRecord.dateOfDeath.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          gender: bodyRecord.gender || 'Unknown',
          age: bodyRecord.age || 'Unknown',
          mlcCase: Boolean(bodyRecord.mlcCase),
          photo: bodyRecord.photoPath || '',
          belongings: bodyRecord.belongings || [],
          notes: bodyRecord.notes || '',
          tagNumber: bodyRecord.tagNumber || `TAG-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
          fromDischarge: false,
          dischargeId: bodyRecord.dischargeId || null,
          registrationDate: bodyRecord.registrationDate || new Date().toISOString(),
          // Add exit information if available
          isReleased: exitResult.recordset.length > 0,
          exitId: exitResult.recordset.length > 0 ? exitResult.recordset[0].exitId : null,
          exitDate: exitResult.recordset.length > 0 ? exitResult.recordset[0].exitDate : null,
          exitReason: exitResult.recordset.length > 0 ? exitResult.recordset[0].exitReason : null,
          exitProcessedBy: exitResult.recordset.length > 0 ? exitResult.recordset[0].exitProcessedBy : null,
          exitNotes: exitResult.recordset.length > 0 ? exitResult.recordset[0].exitNotes : null
        };
        
        await pool.close();
        console.log('Found body (including released):', formattedBody.name, 'Released:', formattedBody.isReleased);
        return res.status(200).json(formattedBody);
      }
      
      await pool.close();
    } else {
      // For dbjson backend, check both bodies and exits arrays
      const exits = await db.getExits();
      const exitBody = exits.find(e => e.id == id || String(e.id) === String(id));
      
      if (exitBody) {
        console.log('Found released body in exits:', exitBody.name);
        return res.status(200).json({
          ...exitBody,
          isReleased: true,
          exitDate: exitBody.exitDate
        });
      }
    }
    
    console.log('Body not found in either active or released records');
    res.status(404).json({ 
      error: 'Body not found',
      message: `Body with ID "${id}" was not found. It may have been deleted or the ID may be incorrect.`,
      searchedId: id
    });
  } catch (error) {
    console.error('Error in getBodyById:', error);
    res.status(500).send(error.message);
  }
};

export const patchBody = async (req, res) => {
  try {
    const bodies = await db.getBodies();
    const { id } = req.params;
    const updates = req.body;
    const body = bodies.find(b => b.id == id || String(b.id) === String(id));
    if (body) {
      // Check if storage unit is being updated and if it's already occupied
      if (updates.storageUnit && updates.storageUnit !== '' && updates.storageUnit !== body.storageUnit) {
        const activeBodies = bodies.filter(b => b.status !== 'released');
        const occupiedUnit = activeBodies.find(b => b.storageUnit === updates.storageUnit && (b.id != id && String(b.id) !== String(id)));
        
        if (occupiedUnit) {
          return res.status(400).json({
            error: 'Storage unit already occupied',
            details: `Storage unit ${updates.storageUnit} is already assigned to body ${occupiedUnit.name} (ID: ${occupiedUnit.id})`
          });
        }
      }

      const oldStorageUnit = body.storageUnit;
      Object.assign(body, updates);

      // If storageUnit is being assigned (and is not empty), set status to "In Storage"
      if (updates.storageUnit && updates.storageUnit !== '') {
        body.status = 'In Storage';
      }

      // Log movement if storage unit changes
      if (updates.storageUnit && oldStorageUnit !== updates.storageUnit) {
        if (!Array.isArray(body.movements)) body.movements = [];
        const movementLog = {
          from: oldStorageUnit,
          to: updates.storageUnit,
          timestamp: new Date().toISOString()
        };
        body.movements.push(movementLog);
        
        // Create storage allocation if storage unit is assigned and not empty
        if (updates.storageUnit && updates.storageUnit !== '') {
          try {
            await db.createStorageAllocation({
              bodyId: body.id,
              storageUnitId: updates.storageUnit, // This will be converted to DB ID by the controller
              allocatedBy: 1, // Default user
              status: 'Active',
              priorityLevel: body.riskLevel === 'high' || body.riskLevel === 'urgent' ? 'High' : 'Normal',
              temperatureRequired: -18.0,
              providerId: 1,
              outletId: 1,
              expectedDurationDays: 7,
              allocationType: 'Updated'
            });
            console.log(`Created storage allocation for body ${body.id} during update`);
          } catch (error) {
            console.error('Error creating storage allocation during body update:', error);
          }
        }
      }

      if ((process.env.DATA_SOURCE || 'mssql') === 'dbjson') {
        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        const idx = dbData.bodies.findIndex(b => b.id == id || String(b.id) === String(id));
        if (idx !== -1) dbData.bodies[idx] = body;
        writeDbJson(dbData);
      } else {
        // For MSSQL backend, we need to update the database
        // The body object here is a mapped result from database, so we need to update DB directly
        console.log('Updated body in-memory, database update would be handled by the MSSQL layer');
      }
      res.status(200).json(body);
    } else {
      res.status(404).send('Body not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteBody = async (req, res) => {
  try {
    const bodies = await db.getBodies();
    const { id } = req.params;
    const index = bodies.findIndex(b => b.id == id || String(b.id) === String(id));
    if (index !== -1) {
      bodies.splice(index, 1);
      if ((process.env.DATA_SOURCE || 'mssql') === 'dbjson') {
        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        dbData.bodies = bodies;
        writeDbJson(dbData);
      } else {
        await bodies.write();
      }
      res.status(204).send();
    } else {
      res.status(404).send('Body not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getDischarges = async (req, res) => {
  try {
    console.log('Fetching discharges from database...');
    const discharges = await db.getDischarges();
    console.log(`Retrieved ${discharges ? discharges.length : 0} discharge records from database`);
    
    if (discharges && discharges.length > 0) {
      console.log('First discharge record sample:', JSON.stringify(discharges[0], null, 2));
    }
    
    // Filter only expired patients from discharge table
    const expiredDischarges = discharges.filter(discharge => {
      const isExpired = discharge.dischargeStatus === 'Expired' || 
                       (typeof discharge.dischargeStatus === 'string' && 
                        discharge.dischargeStatus.toLowerCase().includes('expired'));
      return isExpired;
    });
    
    console.log(`Filtered to ${expiredDischarges.length} expired discharge records`);
    
    if (expiredDischarges.length === 0 && discharges.length > 0) {
      console.log('No expired discharges found. All discharge statuses:', 
        [...new Set(discharges.map(d => d.dischargeStatus))]);
    }
    
    res.json(expiredDischarges);
  } catch (error) {
    console.error('Error in getDischarges controller:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getDischargeById = async (req, res) => {
  try {
    const discharges = await db.getDischarges();
    const { id } = req.params;
    const discharge = discharges.find(d => d.id === id);
    if (discharge) {
      res.status(200).json(discharge);
    } else {
      res.status(404).send('Discharge record not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
}; 

export const getPendingVerifications = async (req, res) => {
  try {
    const bodies = await db.getBodies();
    const pendingBodies = bodies.filter(body => body.status === 'Pending');
    res.json(pendingBodies);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getAverageStayDuration = async (req, res) => {
  try {
    const exits = await db.getExits();
    if (exits.length === 0) {
      return res.json({ averageDays: 0 });
    }

    const totalDuration = exits.reduce((acc, exit) => {
      const admissionDate = new Date(exit.registrationDate);
      const exitDate = new Date(exit.exitDate);
      const duration = (exitDate - admissionDate) / (1000 * 60 * 60 * 24); // in days
      return acc + duration;
    }, 0);

    const averageDays = totalDuration / exits.length;
    res.json({ averageDays });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getOccupancyTrends = async (req, res) => {
  try {
    const bodies = await db.getBodies();
    const exits = await db.getExits();
    const trends = {};

    // Helper to format date as YYYY-MM-DD
    const formatDate = (date) => new Date(date).toISOString().split('T')[0];

    // Process admissions
    bodies.forEach(body => {
      const date = formatDate(body.registrationDate);
      if (!trends[date]) trends[date] = { date, admissions: 0, releases: 0 };
      trends[date].admissions++;
    });

    // Process exits
    exits.forEach(exit => {
      const date = formatDate(exit.exitDate);
      if (!trends[date]) trends[date] = { date, admissions: 0, releases: 0 };
      trends[date].releases++;
    });

    // Calculate daily occupancy
    const sortedDates = Object.keys(trends).sort();
    let occupied = 0;
    const occupancyData = sortedDates.map(date => {
      occupied += trends[date].admissions - trends[date].releases;
      return { date, occupied };
    });

    res.json(occupancyData);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getBodyMovements = async (req, res) => {
  try {
    const movements = await db.getMovements();
    res.json(movements);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getDepartmentDeathLogs = async (req, res) => {
  try {
    const exits = await db.getExits();
    const { department } = req.query;
    let logs = exits;

    if (department) {
      logs = logs.filter(log => log.department === department);
    }

    res.json(logs);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const logBodyVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const verificationData = req.body;

    // Use the appropriate database function based on the backend
    if ((process.env.DATA_SOURCE || 'mssql') === 'mssql') {
      const updatedBody = await db.updateBodyVerification(parseInt(id), verificationData);
      if (updatedBody) {
        const responseBody = {
          id: updatedBody.BD_ID_PK,
          name: updatedBody.BD_Name,
          status: updatedBody.BD_Status,
          verificationLog: await db.getBodyVerificationLog(parseInt(id))
        };
        return res.status(200).json(responseBody);
      } else {
        return res.status(404).json({ error: 'Body not found' });
      }
    } else {
      // This is the logic for the dbjson backend
      const bodies = await db.getBodies();
      const body = bodies.find(b => b.id == id || String(b.id) === String(id));
      
      if (body) {
        body.status = 'verified';
        if (!Array.isArray(body.verificationLog)) {
          body.verificationLog = [];
        }
        body.verificationLog.push({
          ...verificationData,
          date: new Date().toISOString()
        });
        
        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        const idx = dbData.bodies.findIndex(b => b.id == id || String(b.id) === String(id));
        if (idx !== -1) {
          dbData.bodies[idx] = body;
          writeDbJson(dbData);
        }
        
        return res.status(200).json(body);
      } else {
        return res.status(404).json({ 
          error: 'Body not found',
          searchedId: id
        });
      }
    }
  } catch (error) {
    console.error('Error in logBodyVerification:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const getTrends = async (req, res) => {
  const { from, to } = req.query;
  const bodies = await db.getBodies();
  const fromDate = new Date(from);
  const toDate = new Date(to);

  // Build a date map for the range
  const days = [];
  for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
    days.push(formatDate(new Date(d)));
  }

  // Count admissions and releases per day
  const admissions = bodies || [];
  const releases = await db.getExits();
  const trend = days.map(date => ({
    date,
    admitted: admissions.filter(b => b.registrationDate && b.registrationDate.startsWith(date)).length,
    released: releases.filter(e => e.exitDate && e.exitDate.startsWith(date)).length,
  }));

  res.json(trend);
}; 

export const getBodyVerifyLog = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Use the appropriate database function based on the backend
    if ((process.env.DATA_SOURCE || 'mssql') === 'mssql') {
      const verificationLog = await db.getBodyVerificationLog(parseInt(id));
      res.status(200).json(verificationLog || []);
    } else {
      // This is the logic for the dbjson backend
      const bodies = await db.getBodies();
      // Handle both string and numeric ID comparisons
      const body = bodies.find(b => b.id == id || b.id === id || String(b.id) === String(id));
      if (body) {
        res.status(200).json(body.verificationLog || []);
      } else {
        res.status(404).json({ 
          message: 'Body not found',
          searchedId: id,
          availableIds: bodies.map(b => b.id)
        });
      }
    }
  } catch (error) {
    console.error('Error in getBodyVerifyLog:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/storage-allocations:
 *   get:
 *     summary: Get all storage allocations
 *     tags: [Storage]
 *     responses:
 *       200:
 *         description: List of storage allocations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StorageAllocation'
 */
export const getStorageAllocations = async (req, res) => {
  try {
    console.log('Fetching storage allocations...');
    const allocations = await db.getStorageAllocations();
    console.log('Storage allocations from database:', allocations);
    
    if (!allocations || allocations.length === 0) {
      console.log('No storage allocations found in the database');
    }
    
    res.json(allocations);
  } catch (error) {
    console.error('Error in getStorageAllocations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch storage allocations', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Create missing storage allocations
export const createMissingStorageAllocations = async (req, res) => {
  try {
    console.log('Creating missing storage allocations...');
    const result = await db.createMissingStorageAllocations();
    console.log('Missing storage allocations result:', result);
    
    res.json({ 
      message: `Successfully processed ${result.processed} bodies`, 
      processed: result.processed,
      success: true
    });
  } catch (error) {
    console.error('Error in createMissingStorageAllocations:', error);
    res.status(500).json({ 
      error: 'Failed to create missing storage allocations', 
      details: error.message 
    });
  }
};

/**
 * @swagger
 * /api/storage-allocations:
 *   post:
 *     summary: Create a new storage allocation
 *     tags: [Storage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StorageAllocationInput'
 *     responses:
 *       201:
 *         description: Created storage allocation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StorageAllocation'
 *       400:
 *         description: Invalid input
 */
export const createStorageAllocation = async (req, res) => {
  try {
    const { bodyId, storageUnitId, allocatedBy, providerId, outletId, ...rest } = req.body;
    
    if (!bodyId || !storageUnitId || !allocatedBy || !providerId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['bodyId', 'storageUnitId', 'allocatedBy', 'providerId']
      });
    }

    // Convert string storage unit ID (like "F-01") to database ID
    let actualStorageUnitId;
    if (typeof storageUnitId === 'string' && storageUnitId.startsWith('F-')) {
      // This is a unit code, get the database ID
      actualStorageUnitId = await getStorageUnitIdByCode(storageUnitId);
      
      if (!actualStorageUnitId) {
        // Create the storage unit if it doesn't exist
        const created = await createDefaultStorageUnit(storageUnitId, providerId, outletId || 1);
        if (created) {
          actualStorageUnitId = await getStorageUnitIdByCode(storageUnitId);
        }
        
        if (!actualStorageUnitId) {
          return res.status(400).json({ 
            error: 'Storage unit not found and could not be created',
            storageUnitId: storageUnitId
          });
        }
      }
    } else {
      // Assume it's already a database ID
      actualStorageUnitId = storageUnitId;
    }

    const newAllocation = await db.createStorageAllocation({
      bodyId,
      storageUnitId: actualStorageUnitId,
      allocatedBy,
      providerId,
      outletId: outletId || null,
      ...rest
    });

    // Return with unit code for frontend compatibility
    const responseAllocation = {
      ...newAllocation,
      storageUnitCode: typeof storageUnitId === 'string' && storageUnitId.startsWith('F-') ? storageUnitId : `F-${String(actualStorageUnitId).padStart(2, '0')}`
    };

    res.status(201).json(responseAllocation);
  } catch (error) {
    console.error('Error in createStorageAllocation:', error);
    res.status(500).json({ error: 'Failed to create storage allocation', details: error.message });
  }
};

/**
 * @swagger
 * /api/storage-allocations/{id}/status:
 *   patch:
 *     summary: Update storage allocation status
 *     tags: [Storage]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Storage allocation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - userId
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Released, Maintenance]
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       404:
 *         description: Storage allocation not found
 *       500:
 *         description: Server error
 */
export const updateStorageAllocationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, userId } = req.body;

    if (!status || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['status', 'userId']
      });
    }

    const success = await db.updateStorageAllocationStatus(parseInt(id), status, userId);
    
    if (!success) {
      return res.status(404).json({ error: 'Storage allocation not found' });
    }

    res.json({ success: true, message: 'Storage allocation status updated' });
  } catch (error) {
    console.error('Error in updateStorageAllocationStatus:', error);
    res.status(500).json({ error: 'Failed to update storage allocation status', details: error.message });
  }
};

/**
 * @swagger
 * /api/available-storage-units:
 *   get:
 *     summary: Get available storage units
 *     tags: [Storage]
 *     parameters:
 *       - in: query
 *         name: providerId
 *         schema:
 *           type: integer
 *         description: ID of the provider
 *       - in: query
 *         name: outletId
 *         schema:
 *           type: integer
 *         description: ID of the outlet (optional)
 *     responses:
 *       200:
 *         description: List of available storage units
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StorageUnit'
 */
export const getAvailableStorageUnits = async (req, res) => {
  try {
    const { providerId, outletId } = req.query;
    
    if (!providerId) {
      return res.status(400).json({ error: 'providerId is required' });
    }

    const units = await db.getAvailableStorageUnits(parseInt(providerId), outletId ? parseInt(outletId) : null);
    res.json(units);
  } catch (error) {
    console.error('Error in getAvailableStorageUnits:', error);
    res.status(500).json({ error: 'Failed to fetch available storage units', details: error.message });
  }
};

// Debug endpoint to check bodies with storage units but no allocations
export const debugCheckStorageAllocations = async (req, res) => {
  try {
    // Get all bodies with storage units
    const bodies = await db.getBodies();
    const bodiesWithStorage = bodies.filter(body => body.BD_Storage_Unit);
    
    // Get all storage allocations
    const allocations = await db.getStorageAllocations();
    const allocatedBodyIds = new Set(allocations.map(a => a.bodyId));
    
    // Find bodies with storage units but no allocations
    const bodiesWithoutAllocations = bodiesWithStorage.filter(
      body => !allocatedBodyIds.has(body.BD_ID_PK)
    );
    
    res.json({
      totalBodies: bodies.length,
      bodiesWithStorage: bodiesWithStorage.length,
      totalAllocations: allocations.length,
      bodiesWithoutAllocations: bodiesWithoutAllocations.map(body => ({
        id: body.BD_ID_PK,
        name: body.BD_name,
        storageUnit: body.BD_Storage_Unit,
        status: body.BD_Status
      }))
    });
  } catch (error) {
    console.error('Error in debugCheckStorageAllocations:', error);
    res.status(500).json({ 
      error: 'Failed to check storage allocations', 
      details: error.message 
    });
  }
};

// =====================================================
// EXIT TABLES CONTROLLER FUNCTIONS
// =====================================================

// Lookup Table Functions
export const getExitTypes = async (req, res) => {
  try {
    if ((process.env.DATA_SOURCE || 'mssql') === 'mssql') {
      const pool = await sql.connect({
        user: process.env.MSSQL_USER,
        password: process.env.MSSQL_PASSWORD,
        server: process.env.MSSQL_SERVER,
        database: process.env.MSSQL_DATABASE,
        options: {
          encrypt: false,
          trustServerCertificate: true
        }
      });
      
      const result = await pool.request()
        .query('SELECT * FROM exit_type_lookup WHERE ETL_Status = \'Active\' ORDER BY ETL_Type_Name');
      
      await pool.close();
      res.json(result.recordset);
    } else {
      res.status(500).json({ error: 'MSSQL data source required for exit types' });
    }
  } catch (error) {
    console.error('Error in getExitTypes:', error);
    res.status(500).json({ error: 'Failed to fetch exit types', details: error.message });
  }
};

export const getExitStatuses = async (req, res) => {
  try {
    if ((process.env.DATA_SOURCE || 'mssql') === 'mssql') {
      const pool = await sql.connect({
        user: process.env.MSSQL_USER,
        password: process.env.MSSQL_PASSWORD,
        server: process.env.MSSQL_SERVER,
        database: process.env.MSSQL_DATABASE,
        options: {
          encrypt: false,
          trustServerCertificate: true
        }
      });
      
      const result = await pool.request()
        .query('SELECT * FROM exit_status_lookup WHERE ESL_Status = \'Active\' ORDER BY ESL_Status_Name');
      
      await pool.close();
      res.json(result.recordset);
    } else {
      res.status(500).json({ error: 'MSSQL data source required for exit statuses' });
    }
  } catch (error) {
    console.error('Error in getExitStatuses:', error);
    res.status(500).json({ error: 'Failed to fetch exit statuses', details: error.message });
  }
};

export const getReceiverTypes = async (req, res) => {
  try {
    if ((process.env.DATA_SOURCE || 'mssql') === 'mssql') {
      const pool = await sql.connect({
        user: process.env.MSSQL_USER,
        password: process.env.MSSQL_PASSWORD,
        server: process.env.MSSQL_SERVER,
        database: process.env.MSSQL_DATABASE,
        options: {
          encrypt: false,
          trustServerCertificate: true
        }
      });
      
      const result = await pool.request()
        .query('SELECT * FROM receiver_type_lookup WHERE RTL_Status = \'Active\' ORDER BY RTL_Type_Name');
      
      await pool.close();
      res.json(result.recordset);
    } else {
      res.status(500).json({ error: 'MSSQL data source required for receiver types' });
    }
  } catch (error) {
    console.error('Error in getReceiverTypes:', error);
    res.status(500).json({ error: 'Failed to fetch receiver types', details: error.message });
  }
};

export const getIdProofTypes = async (req, res) => {
  try {
    if ((process.env.DATA_SOURCE || 'mssql') === 'mssql') {
      const pool = await sql.connect({
        user: process.env.MSSQL_USER,
        password: process.env.MSSQL_PASSWORD,
        server: process.env.MSSQL_SERVER,
        database: process.env.MSSQL_DATABASE,
        options: {
          encrypt: false,
          trustServerCertificate: true
        }
      });
      
      const result = await pool.request()
        .query('SELECT * FROM id_proof_type_lookup WHERE IDL_Status = \'Active\' ORDER BY IDL_Proof_Name');
      
      await pool.close();
      res.json(result.recordset);
    } else {
      res.status(500).json({ error: 'MSSQL data source required for ID proof types' });
    }
  } catch (error) {
    console.error('Error in getIdProofTypes:', error);
    res.status(500).json({ error: 'Failed to fetch ID proof types', details: error.message });
  }
};

export const getRelationships = async (req, res) => {
  try {
    if ((process.env.DATA_SOURCE || 'mssql') === 'mssql') {
      const pool = await sql.connect({
        user: process.env.MSSQL_USER,
        password: process.env.MSSQL_PASSWORD,
        server: process.env.MSSQL_SERVER,
        database: process.env.MSSQL_DATABASE,
        options: {
          encrypt: false,
          trustServerCertificate: true
        }
      });
      
      const result = await pool.request()
        .query('SELECT * FROM relationship_lookup WHERE RLL_Status = \'Active\' ORDER BY RLL_Relationship_Name');
      
      await pool.close();
      res.json(result.recordset);
    } else {
      res.status(500).json({ error: 'MSSQL data source required for relationships' });
    }
  } catch (error) {
    console.error('Error in getRelationships:', error);
    res.status(500).json({ error: 'Failed to fetch relationships', details: error.message });
  }
};

export const getAuthorizationLevels = async (req, res) => {
  try {
    if ((process.env.DATA_SOURCE || 'mssql') === 'mssql') {
      const pool = await sql.connect({
        user: process.env.MSSQL_USER,
        password: process.env.MSSQL_PASSWORD,
        server: process.env.MSSQL_SERVER,
        database: process.env.MSSQL_DATABASE,
        options: {
          encrypt: false,
          trustServerCertificate: true
        }
      });
      
      const result = await pool.request()
        .query('SELECT * FROM exit_authorization_level_lookup WHERE EAL_Status = \'Active\' ORDER BY EAL_Level_Name');
      
      await pool.close();
      res.json(result.recordset);
    } else {
      res.status(500).json({ error: 'MSSQL data source required for authorization levels' });
    }
  } catch (error) {
    console.error('Error in getAuthorizationLevels:', error);
    res.status(500).json({ error: 'Failed to fetch authorization levels', details: error.message });
  }
};

// Exit Bodies Functions
export const getExitBodies = async (req, res) => {
  try {
    const exitBodies = await db.getExitBodies();
    res.json(exitBodies);
  } catch (error) {
    console.error('Error in getExitBodies:', error);
    res.status(500).json({ error: 'Failed to fetch exit bodies', details: error.message });
  }
};

export const createExitBody = async (req, res) => {
  try {
    if ((process.env.DATA_SOURCE || 'mssql') === 'mssql') {
      const pool = await sql.connect({
        user: process.env.MSSQL_USER,
        password: process.env.MSSQL_PASSWORD,
        server: process.env.MSSQL_SERVER,
        database: process.env.MSSQL_DATABASE,
        options: {
          encrypt: false,
          trustServerCertificate: true
        }
      });
      
      // Parse and validate request body with proper type conversion
      const body = req.body;
      
      // Convert string values to numbers where needed
      const EB_Body_Details_FK = parseInt(body.EB_Body_Details_FK, 10);
      const EB_Exit_Type_FK = parseInt(body.EB_Exit_Type_FK, 10) || null;
      const EB_Exit_Status_FK = parseInt(body.EB_Exit_Status_FK, 10) || null;
      const EB_Exit_Authorization_Level_FK = parseInt(body.EB_Exit_Authorization_Level_FK, 10) || null;
      const EB_Provider_fk = parseInt(body.EB_Provider_fk, 10) || 1; // Default to 1 if not provided
      const EB_Outlet_fk = parseInt(body.EB_Outlet_fk, 10) || 1; // Default to 1 if not provided
      
      // Parse dates
      const EB_Exit_Date = body.EB_Exit_Date || new Date();
      const EB_Expected_Exit_Date = body.EB_Expected_Exit_Date || null;
      const EB_Actual_Exit_Date = body.EB_Actual_Exit_Date || null;
      const EB_Exit_Authorization_Date = body.EB_Exit_Authorization_Date || new Date();
      
      // Parse boolean values
      const parseBool = (value) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return Boolean(value);
      };
      
      const EB_Medical_Clearance_Obtained = parseBool(body.EB_Medical_Clearance_Obtained);
      const EB_Police_Clearance_Obtained = parseBool(body.EB_Police_Clearance_Obtained);
      const EB_Administrative_Clearance_Obtained = parseBool(body.EB_Administrative_Clearance_Obtained);
      const EB_Financial_Clearance_Obtained = parseBool(body.EB_Financial_Clearance_Obtained);
      const EB_All_Documents_Complete = parseBool(body.EB_All_Documents_Complete);
      
      // Text fields
      const EB_Exit_Reason = body.EB_Exit_Reason || '';
      const EB_Exit_Time = body.EB_Exit_Time || new Date().toLocaleTimeString();
      const EB_Exit_Authorized_By = body.EB_Exit_Authorized_By || 'System';
      const EB_Exit_Processed_By = body.EB_Exit_Processed_By || 'System';
      const EB_Exit_Notes = body.EB_Exit_Notes || '';
      const EB_Added_by = parseInt(body.EB_Added_by, 10) || 1; // Default to user ID 1
      
      // Helper function to safely format dates for logging
      const formatDateForLog = (date) => {
        if (!date) return null;
        if (date instanceof Date) return date.toISOString();
        if (typeof date === 'string') return date;
        return String(date);
      };

      // Debug log the values being passed to the query
      console.log('Creating exit body with values:', {
        EB_Body_Details_FK,
        EB_Exit_Type_FK,
        EB_Exit_Status_FK,
        EB_Exit_Date: formatDateForLog(EB_Exit_Date),
        EB_Exit_Time,
        EB_Expected_Exit_Date: formatDateForLog(EB_Expected_Exit_Date),
        EB_Actual_Exit_Date: formatDateForLog(EB_Actual_Exit_Date),
        EB_Exit_Reason,
        EB_Medical_Clearance_Obtained,
        EB_Police_Clearance_Obtained,
        EB_Administrative_Clearance_Obtained,
        EB_Financial_Clearance_Obtained,
        EB_All_Documents_Complete,
        EB_Exit_Authorized_By,
        EB_Exit_Authorization_Level_FK,
        EB_Exit_Authorization_Date: formatDateForLog(EB_Exit_Authorization_Date),
        EB_Exit_Processed_By,
        EB_Exit_Notes,
        EB_Added_by,
        EB_Provider_fk,
        EB_Outlet_fk
      });

      // First, create the exit body record
      const result = await pool.request()
        .input('BodyDetailsFK', sql.Int, EB_Body_Details_FK)
        .input('ExitTypeFK', sql.Int, EB_Exit_Type_FK)
        .input('ExitStatusFK', sql.Int, EB_Exit_Status_FK)
        .input('ExitDate', sql.DateTime2, EB_Exit_Date || new Date())
        .input('ExitTime', sql.Time, EB_Exit_Time ? new Date(`1970-01-01T${EB_Exit_Time}`) : new Date())
        .input('ExpectedExitDate', sql.DateTime2, EB_Expected_Exit_Date || null)
        .input('ActualExitDate', sql.DateTime2, EB_Actual_Exit_Date || null)
        .input('ExitReason', sql.NVarChar(500), EB_Exit_Reason || '')
        .input('MedicalClearance', sql.Bit, EB_Medical_Clearance_Obtained ? 1 : 0)
        .input('PoliceClearance', sql.Bit, EB_Police_Clearance_Obtained ? 1 : 0)
        .input('AdministrativeClearance', sql.Bit, EB_Administrative_Clearance_Obtained ? 1 : 0)
        .input('FinancialClearance', sql.Bit, EB_Financial_Clearance_Obtained ? 1 : 0)
        .input('AllDocumentsComplete', sql.Bit, EB_All_Documents_Complete ? 1 : 0)
        .input('ExitAuthorizedBy', sql.NVarChar(100), EB_Exit_Authorized_By || 'System')
        .input('ExitAuthorizationLevelFK', sql.Int, EB_Exit_Authorization_Level_FK || 1) // Default to 1 if not provided
        .input('ExitAuthorizationDate', sql.DateTime2, EB_Exit_Authorization_Date || new Date())
        .input('ExitProcessedBy', sql.NVarChar(100), EB_Exit_Processed_By || 'System')
        .input('ExitNotes', sql.NVarChar(1000), EB_Exit_Notes || '')
        .input('AddedBy', sql.Int, EB_Added_by || 1)
        .input('ProviderFK', sql.Int, EB_Provider_fk || 1) // Default to 1 if not provided
        .input('OutletFK', sql.Int, EB_Outlet_fk || 1) // Default to 1 if not provided
        .query(`
          INSERT INTO exit_bodies (
            EB_Body_Details_FK, EB_Exit_Type_FK, EB_Exit_Status_FK, EB_Exit_Date, EB_Exit_Time,
            EB_Expected_Exit_Date, EB_Actual_Exit_Date, EB_Exit_Reason, EB_Medical_Clearance_Obtained,
            EB_Police_Clearance_Obtained, EB_Administrative_Clearance_Obtained, EB_Financial_Clearance_Obtained,
            EB_All_Documents_Complete, EB_Exit_Authorized_By, EB_Exit_Authorization_Level_FK,
            EB_Exit_Authorization_Date, EB_Exit_Processed_By, EB_Exit_Notes, EB_Added_by, EB_Provider_fk, EB_Outlet_fk
          ) VALUES (
            @BodyDetailsFK, @ExitTypeFK, @ExitStatusFK, @ExitDate, @ExitTime,
            @ExpectedExitDate, @ActualExitDate, @ExitReason, @MedicalClearance,
            @PoliceClearance, @AdministrativeClearance, @FinancialClearance,
            @AllDocumentsComplete, @ExitAuthorizedBy, @ExitAuthorizationLevelFK,
            @ExitAuthorizationDate, @ExitProcessedBy, @ExitNotes, @AddedBy, @ProviderFK, @OutletFK
          );
          SELECT SCOPE_IDENTITY() as Id;
        `);
      
      const newId = result.recordset[0].Id;
      
      // Now update the body status to inactive (0) and set status to 'released'
      await pool.request()
        .input('BodyDetailsFK', sql.Int, EB_Body_Details_FK)
        .input('ModifiedBy', sql.Int, EB_Added_by)
        .query(`
          UPDATE body_details 
          SET BD_Status_Flag = 0, 
              BD_Status = 'released',
              BD_Modified_By = @ModifiedBy,
              BD_Modified_On = GETDATE()
          WHERE BD_ID_PK = @BodyDetailsFK
        `);
      
      // Update the storage allocation status to 'Released' for this body
      const updateResult = await pool.request()
        .input('BodyDetailsFK', sql.Int, EB_Body_Details_FK)
        .input('ModifiedBy', sql.Int, EB_Added_by)
        .query(`
          -- First, log the current state for debugging
          SELECT SA_ID_PK, SA_Status, SA_Body_FK 
          FROM storage_allocation 
          WHERE SA_Body_FK = @BodyDetailsFK;
          
          -- Then update the status
          UPDATE storage_allocation 
          SET SA_Status = 'Released',
              SA_Modified_By = @ModifiedBy,
              SA_Modified_On = GETDATE()
          WHERE SA_Body_FK = @BodyDetailsFK 
          AND (SA_Status = 'Active' OR SA_Status IS NULL OR SA_Status = '');
          
          -- Verify the update
          SELECT SA_ID_PK, SA_Status, SA_Body_FK 
          FROM storage_allocation 
          WHERE SA_Body_FK = @BodyDetailsFK;
        `);
        
      console.log('Storage allocation update result:', {
        recordsAffected: updateResult.recordsets.length > 1 ? updateResult.recordsets[1].rowsAffected : 0,
        beforeState: updateResult.recordsets[0],
        afterState: updateResult.recordsets[2]
      });
      
      await pool.close();
      
      res.status(201).json({ 
        message: 'Exit body created successfully', 
        id: newId 
      });
    } else {
      res.status(500).json({ error: 'MSSQL data source required for creating exit bodies' });
    }
  } catch (error) {
    console.error('Error in createExitBody:', error);
    res.status(500).json({ error: 'Failed to create exit body', details: error.message });
  }
};

export const getExitBodyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if ((process.env.DATA_SOURCE || 'mssql') === 'mssql') {
      const pool = await sql.connect({
        user: process.env.MSSQL_USER,
        password: process.env.MSSQL_PASSWORD,
        server: process.env.MSSQL_SERVER,
        database: process.env.MSSQL_DATABASE,
        options: {
          encrypt: false,
          trustServerCertificate: true
        }
      });
      
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          SELECT 
            eb.*,
            bd.BD_name as BodyName,
            bd.BD_age as BodyAge,
            bd.BD_gender as BodyGender,
            etl.ETL_Type_Name as ExitTypeName,
            esl.ESL_Status_Name as ExitStatusName,
            eal.EAL_Level_Name as AuthorizationLevelName
          FROM exit_bodies eb
          LEFT JOIN body_details bd ON eb.EB_Body_Details_FK = bd.BD_Id_pk
          LEFT JOIN exit_type_lookup etl ON eb.EB_Exit_Type_FK = etl.ETL_Id_pk
          LEFT JOIN exit_status_lookup esl ON eb.EB_Exit_Status_FK = esl.ESL_Id_pk
          LEFT JOIN exit_authorization_level_lookup eal ON eb.EB_Exit_Authorization_Level_FK = eal.EAL_Id_pk
          WHERE eb.EB_Id_pk = @id AND eb.EB_Status = 'Active'
        `);
      
      await pool.close();
      
      if (result.recordset.length > 0) {
        res.json(result.recordset[0]);
      } else {
        res.status(404).json({ error: 'Exit body not found' });
      }
    } else {
      res.status(500).json({ error: 'MSSQL data source required for exit bodies' });
    }
  } catch (error) {
    console.error('Error in getExitBodyById:', error);
    res.status(500).json({ error: 'Failed to fetch exit body', details: error.message });
  }
};

export const updateExitBody = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if ((process.env.DATA_SOURCE || 'mssql') === 'mssql') {
      const pool = await sql.connect({
        user: process.env.MSSQL_USER,
        password: process.env.MSSQL_PASSWORD,
        server: process.env.MSSQL_SERVER,
        database: process.env.MSSQL_DATABASE,
        options: {
          encrypt: false,
          trustServerCertificate: true
        }
      });
      
      // Build dynamic update query
      const updateFields = [];
      const inputs = [];
      
      Object.keys(updates).forEach(key => {
        if (key !== 'EB_Id_pk' && key !== 'EB_Added_by' && key !== 'EB_Added_on') {
          updateFields.push(`${key} = @${key}`);
          inputs.push({ name: key, value: updates[key] });
        }
      });
      
      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }
      
      updateFields.push('EB_Modified_by = @ModifiedBy');
      updateFields.push('EB_Modified_on = GETDATE()');
      inputs.push({ name: 'ModifiedBy', value: updates.EB_Modified_by || 'System' });
      inputs.push({ name: 'id', value: parseInt(id) });
      
      const request = pool.request();
      inputs.forEach(input => {
        request.input(input.name, input.value);
      });
      
      const result = await request.query(`
        UPDATE exit_bodies 
        SET ${updateFields.join(', ')}
        WHERE EB_Id_pk = @id;
        
        SELECT @@ROWCOUNT as affectedRows;
      `);
      
      await pool.close();
      
      if (result.recordset[0].affectedRows > 0) {
        res.json({ message: 'Exit body updated successfully' });
      } else {
        res.status(404).json({ error: 'Exit body not found' });
      }
    } else {
      res.status(500).json({ error: 'MSSQL data source required for updating exit bodies' });
    }
  } catch (error) {
    console.error('Error in updateExitBody:', error);
    res.status(500).json({ error: 'Failed to update exit body', details: error.message });
  }
};

export const deleteExitBody = async (req, res) => {
  try {
    const { id } = req.params;
    
    if ((process.env.DATA_SOURCE || 'mssql') === 'mssql') {
      const pool = await sql.connect({
        user: process.env.MSSQL_USER,
        password: process.env.MSSQL_PASSWORD,
        server: process.env.MSSQL_SERVER,
        database: process.env.MSSQL_DATABASE,
        options: {
          encrypt: false,
          trustServerCertificate: true
        }
      });
      
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          UPDATE exit_bodies 
          SET EB_Status = 'Inactive', EB_Modified_on = GETDATE()
          WHERE EB_Id_pk = @id;
          
          SELECT @@ROWCOUNT as affectedRows;
        `);
      
      await pool.close();
      
      if (result.recordset[0].affectedRows > 0) {
        res.json({ message: 'Exit body deleted successfully' });
      } else {
        res.status(404).json({ error: 'Exit body not found' });
      }
    } else {
      res.status(500).json({ error: 'MSSQL data source required for deleting exit bodies' });
    }
  } catch (error) {
    console.error('Error in deleteExitBody:', error);
    res.status(500).json({ error: 'Failed to delete exit body', details: error.message });
  }
};

// Placeholder functions for other exit-related endpoints
export const getExitReceivers = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const createExitReceiver = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const getExitReceiverById = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const updateExitReceiver = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const deleteExitReceiver = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const getExitDocuments = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const createExitDocument = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const getExitDocumentById = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const updateExitDocument = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const deleteExitDocument = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const getExitClearances = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const createExitClearance = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const getExitClearanceById = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const updateExitClearance = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const deleteExitClearance = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const getExitWitnesses = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const createExitWitness = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const getExitWitnessById = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const updateExitWitness = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const deleteExitWitness = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const getExitHandoverItems = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const createExitHandoverItem = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const getExitHandoverItemById = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const updateExitHandoverItem = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const deleteExitHandoverItem = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const getExitAuditTrail = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const createExitAuditTrail = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const completeExitProcess = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const getExitBodyReceivers = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const getExitBodyDocuments = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const getExitBodyClearances = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const getExitBodyWitnesses = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const getExitBodyHandoverItems = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const getExitBodyAuditTrail = async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
};

export const getActiveStorageAllocations = async (req, res) => {
  try {
    const allocations = await db.getActiveStorageAllocations();
    res.json(allocations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch active storage allocations', details: err.message });
  }
};