import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DATABASE,
  pool: {
    max: 20, // Increased pool size
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000
  },
  connectionTimeout: 30000,
  requestTimeout: 30000
};

let pool;

export async function connect() {
  if (pool) return pool;
  try {
    console.log('Initializing database connection pool...');
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('Database connection pool established');

    pool.on('error', err => {
      console.error('Database pool error', err);
    });

    return pool;
  } catch (err) {
    console.error('Database connection failed:', err);
    pool = null; // Reset pool on error
    throw err;
  }
}

export function getPool() {
  if (!pool) {
    throw new Error('Connection pool has not been initialized. Please call connect() first.');
  }
  return pool;
}

export const addBody = async (bodyData) => {
  let pool;
  try {
    pool = await sql.connect(config);

    // Generate tag number
    const tagResult = await pool.request()
      .query(`SELECT TOP 1 BD_Tag_Number 
          FROM body_details 
          WHERE BD_Tag_Number LIKE 'TAG-%'
          ORDER BY BD_Added_On DESC`);

    let nextTagNum = 1;
    if (tagResult.recordset.length > 0) {
      const lastTag = tagResult.recordset[0].BD_Tag_Number;
      const lastNum = parseInt(lastTag.split('-')[1], 10) || 0;
      nextTagNum = lastNum + 1;
    }
    const tagNumber = `TAG-${nextTagNum}`;

    // Prepare the query
    const query = `
      INSERT INTO body_details (
        BD_Name,
        BD_Patient_FK,
        BD_Tag_Number,
        BD_Date_Of_Death,
        BD_Time_Of_Death,
        BD_Place_Of_Death,
        BD_Cause_Of_Death,
        BD_MLC_Case,
        BD_MLC_Number,
        BD_Police_Station,
        BD_Incident_Type,
        BD_Risk_Level,
        BD_Storage_Unit,
        BD_Status,
        BD_Status_Flag,
        BD_Notes,
        BD_Photo_Path,
        BD_Verification_Status,
        BD_Discharge_ID_FK,
        BD_Added_By,
        BD_Provider_FK,
        BD_Outlet_FK
      ) VALUES (
        @name,
        @patientId,
        @tagNumber,
        @dateOfDeath,
        @timeOfDeath,
        @placeOfDeath,
        @causeOfDeath,
        @isMLCCase,
        @mlcNumber,
        @policeStation,
        @incidentType,
        @riskLevel,
        @storageUnit,
        @status,
        @statusFlag,
        @notes,
        @photoPath,
        @verificationStatus,
        @dischargeId,
        @addedBy,
        @providerId,
        @outletId
      );
      SELECT SCOPE_IDENTITY() as id;
    `;

    // Execute the query
    console.log('DEBUG: bodyData.timeOfDeath =', bodyData.timeOfDeath, 'type =', typeof bodyData.timeOfDeath);
    let timeValue;

    if (typeof bodyData.timeOfDeath === 'string') {
        let dateTimeStr = bodyData.timeOfDeath;
        // Ensure the string has seconds for robust parsing
        if (dateTimeStr.includes('T') && dateTimeStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
            dateTimeStr += ':00';
        }
        timeValue = new Date(dateTimeStr);
    } else if (bodyData.timeOfDeath instanceof Date) {
        timeValue = bodyData.timeOfDeath;
    } else {
      console.warn(`timeOfDeath is not a string or Date ('${bodyData.timeOfDeath}'), using current time.`);
      timeValue = new Date();
    }

    // Validate the resulting date
    if (isNaN(timeValue.getTime())) {
        console.warn(`Invalid timeOfDeath value '${bodyData.timeOfDeath}', using current time instead.`);
        timeValue = new Date();
    }

    console.log('DEBUG: using timeValue for datetime parameter =', timeValue);
    
    const result = await pool.request()
      .input('name', sql.NVarChar(255), bodyData.name || 'Unknown')
      .input('patientId', sql.BigInt, bodyData.patientId ? parseInt(bodyData.patientId) : null)
      .input('tagNumber', sql.VarChar(50), tagNumber)
      .input('dateOfDeath', sql.DateTime, bodyData.dateOfDeath || new Date())
      .input('timeOfDeath', sql.Time, timeValue)
      .input('placeOfDeath', sql.NVarChar(255), bodyData.placeOfDeath || null)
      .input('causeOfDeath', sql.NVarChar(500), bodyData.causeOfDeath || null)
      .input('isMLCCase', sql.Bit, bodyData.isMLCCase || 0)
      .input('mlcNumber', sql.VarChar(50), bodyData.mlcNumber || null)
      .input('policeStation', sql.NVarChar(100), bodyData.policeStation || null)
      .input('incidentType', sql.VarChar(50), bodyData.incidentType || 'Natural')
      .input('riskLevel', sql.VarChar(20), bodyData.riskLevel || 'Medium')
      .input('storageUnit', sql.VarChar(20), bodyData.storageUnit || null)
      .input('status', sql.VarChar(20), bodyData.status || 'Pending')
      .input('statusFlag', sql.Int, 10) // Set to 10 (active) for new bodies
      .input('notes', sql.NVarChar(sql.MAX), bodyData.notes || null)
      .input('photoPath', sql.VarChar(255), bodyData.photoPath || null)
      .input('verificationStatus', sql.VarChar(20), 'Pending')
      .input('dischargeId', sql.Int, bodyData.dischargeId || null)
      .input('addedBy', sql.Int, bodyData.addedBy || 1) // Default to user ID 1 if not provided
      .input('providerId', sql.Int, bodyData.providerId || 1) // Default to provider ID 1 if not provided
      .input('outletId', sql.Int, bodyData.outletId || 1) // Default to outlet ID 1 if not provided
      .query(query);

    // Get the inserted body details
    const bodyId = result.recordset[0].id;
    const insertedBody = await pool.request()
      .input('id', sql.Int, bodyId)
      .query('SELECT * FROM body_details WHERE BD_ID_PK = @id');

    // If a storage unit was assigned, create a storage allocation record
    if (bodyData.storageUnit) {
      try {
        // Get storage unit ID by code
        const storageUnitResult = await pool.request()
          .input('unitCode', sql.NVarChar(20), bodyData.storageUnit)
          .query('SELECT SU_ID_PK FROM storage_unit_master WHERE SU_Unit_Code = @unitCode');
        
        if (storageUnitResult.recordset.length > 0) {
          const storageUnitId = storageUnitResult.recordset[0].SU_ID_PK;
          
          // Create storage allocation
          await pool.request()
            .input('bodyId', sql.Int, bodyId)
            .input('storageUnitId', sql.Int, storageUnitId)
            .input('allocatedBy', sql.Int, bodyData.addedBy || 1)
            .input('status', sql.NVarChar(20), 'Active')
            .input('priority', sql.NVarChar(20), bodyData.riskLevel === 'high' || bodyData.riskLevel === 'urgent' ? 'High' : 'Normal')
            .input('tempRequired', sql.Decimal(5,2), -18.0)
            .input('providerId', sql.Int, bodyData.providerId || 1)
            .input('outletId', sql.Int, bodyData.outletId || 1)
            .input('expectedDays', sql.Int, 7)
            .input('allocationType', sql.NVarChar(30), 'Standard')
            .query(`
              INSERT INTO storage_allocation (
                SA_Body_FK, 
                SA_Storage_Unit_FK, 
                SA_Allocated_By,
                SA_Status, 
                SA_Priority_Level, 
                SA_Temperature_Required,
                SA_Provider_FK, 
                SA_Outlet_FK,
                SA_Expected_Duration_Days,
                SA_Allocation_Type,
                SA_Added_By
              ) VALUES (
                @bodyId, 
                @storageUnitId, 
                @allocatedBy,
                @status, 
                @priority, 
                @tempRequired,
                @providerId, 
                @outletId,
                @expectedDays,
                @allocationType,
                @allocatedBy
              )
            `);
          
          console.log(`Created storage allocation for body ${bodyId} in storage unit ${bodyData.storageUnit}`);
        } else {
          // Storage unit doesn't exist, create it automatically
          console.log(`Storage unit ${bodyData.storageUnit} not found, creating it automatically`);
          
          // Determine unit type based on code (F- = Freezer, C- = Cooler)
          const unitType = bodyData.storageUnit.startsWith('F-') ? 1 : 2; // 1 = Freezer, 2 = Cooler
          
          // Create the storage unit
          const newStorageUnitResult = await pool.request()
            .input('unitCode', sql.NVarChar(20), bodyData.storageUnit)
            .input('unitName', sql.NVarChar(100), `${bodyData.storageUnit.startsWith('F-') ? 'Freezer' : 'Cooler'} Unit ${bodyData.storageUnit.substring(2)}`)
            .input('unitType', sql.Int, unitType)
            .input('location', sql.Int, 1) // Default to Main Mortuary
            .input('status', sql.NVarChar(20), 'Available')
            .input('capacity', sql.Int, 10)
            .input('providerId', sql.Int, bodyData.providerId || 1)
            .input('outletId', sql.Int, bodyData.outletId || 1)
            .input('addedBy', sql.Int, bodyData.addedBy || 1)
            .query(`
              INSERT INTO storage_unit_master (
                SU_Unit_Code, SU_Unit_Name, SU_Type_FK, SU_Location_FK, 
                SU_Status, SU_Capacity, SU_Provider_FK, SU_Outlet_FK, SU_Added_By
              ) VALUES (
                @unitCode, @unitName, @unitType, @location,
                @status, @capacity, @providerId, @outletId, @addedBy
              );
              SELECT SCOPE_IDENTITY() as id;
            `);
          
          const newStorageUnitId = newStorageUnitResult.recordset[0].id;
          console.log(`Created new storage unit ${bodyData.storageUnit} with ID ${newStorageUnitId}`);
          
          // Now create the storage allocation
          await pool.request()
            .input('bodyId', sql.Int, bodyId)
            .input('storageUnitId', sql.Int, newStorageUnitId)
            .input('allocatedBy', sql.Int, bodyData.addedBy || 1)
            .input('status', sql.NVarChar(20), 'Active')
            .input('priority', sql.NVarChar(20), bodyData.riskLevel === 'high' || bodyData.riskLevel === 'urgent' ? 'High' : 'Normal')
            .input('tempRequired', sql.Decimal(5,2), -18.0)
            .input('providerId', sql.Int, bodyData.providerId || 1)
            .input('outletId', sql.Int, bodyData.outletId || 1)
            .input('expectedDays', sql.Int, 7)
            .input('allocationType', sql.NVarChar(30), 'Standard')
            .query(`
              INSERT INTO storage_allocation (
                SA_Body_FK, 
                SA_Storage_Unit_FK, 
                SA_Allocated_By,
                SA_Status, 
                SA_Priority_Level, 
                SA_Temperature_Required,
                SA_Provider_FK, 
                SA_Outlet_FK,
                SA_Expected_Duration_Days,
                SA_Allocation_Type,
                SA_Added_By
              ) VALUES (
                @bodyId, 
                @storageUnitId, 
                @allocatedBy,
                @status, 
                @priority, 
                @tempRequired,
                @providerId, 
                @outletId,
                @expectedDays,
                @allocationType,
                @allocatedBy
              )
            `);
          
          console.log(`Created storage allocation for body ${bodyId} in newly created storage unit ${bodyData.storageUnit}`);
        }
      } catch (allocationError) {
        console.error('Error creating storage allocation:', allocationError);
        // Don't fail the entire body creation if allocation fails
      }
    }

    return insertedBody.recordset[0];
  } catch (error) {
    console.error('Error adding body to database:', {
      message: error.message,
      code: error.code,
      number: error.number,
      state: error.state,
      severity: error.severity,
      originalError: error.originalError
    });
    throw error;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

export const getBodies = async () => {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.query(`
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
        BD_Outlet_FK as outletId,
        -- Check if body has been released/exited
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM exit_bodies eb 
            WHERE eb.EB_Body_Details_FK = BD_ID_PK 
            AND eb.EB_Status = 'Active'
          ) THEN 'released'
          ELSE BD_Status
        END as actualStatus
      FROM body_details
      WHERE BD_Status_Flag = 10
      ORDER BY BD_Added_On DESC
    `);

    // Map the database fields to the expected frontend format
    const mappedResults = result.recordset.map(record => {
      // Handle time of death properly - combine date and time
      let timeOfDeath;
      if (record.timeOfDeath && record.dateOfDeath) {
        // Extract time from the time field (which comes as 1970 date with correct time)
        const timeOnly = record.timeOfDeath.toTimeString().substring(0, 8); // HH:MM:SS
        const dateOnly = record.dateOfDeath.toISOString().split('T')[0]; // YYYY-MM-DD
        timeOfDeath = `${dateOnly}T${timeOnly}`;
      } else if (record.dateOfDeath) {
        // If no time, use date with default time
        timeOfDeath = `${record.dateOfDeath.toISOString().split('T')[0]}T12:00:00`;
      } else {
        // Fallback to current timestamp
        timeOfDeath = new Date().toISOString();
      }

      return {
        // Include all other fields from the record first
        ...record,
        
        // Then override with processed fields
        id: record.id || `bd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: record.name || 'Unknown',
        timeOfDeath: timeOfDeath, // This will override the original timeOfDeath
        status: record.actualStatus || record.status || 'pending', // Use actualStatus if available
        riskLevel: record.riskLevel || 'medium',
        storageUnit: record.storageUnit || 'F-01',
        incidentType: record.incidentType || 'natural',
        dateOfDeath: record.dateOfDeath ? record.dateOfDeath.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        gender: record.gender || 'Unknown',
        age: record.age || 'Unknown',
        mlcCase: Boolean(record.mlcCase),
        photo: record.photoPath || '',
        belongings: record.belongings || [],
        notes: record.notes || '',
        tagNumber: record.tagNumber || `TAG-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        fromDischarge: false,
        dischargeId: record.dischargeId || null,
        registrationDate: record.registrationDate || new Date().toISOString()
      };
    });

    return mappedResults;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

export const getExits = async () => {
  await sql.connect(config);
  const result = await sql.query('SELECT * FROM body_exit ORDER BY BE_Added_on DESC');
  return result.recordset;
};

export const getExitBodies = async () => {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.query(`
      SELECT 
        eb.EB_Id_pk as id,
        eb.EB_Body_Details_FK as bodyId,
        eb.EB_Exit_Type_FK as exitTypeId,
        eb.EB_Exit_Status_FK as exitStatusId,
        eb.EB_Exit_Date as exitDate,
        eb.EB_Exit_Time as exitTime,
        eb.EB_Expected_Exit_Date as expectedExitDate,
        eb.EB_Actual_Exit_Date as actualExitDate,
        eb.EB_Exit_Reason as exitReason,
        eb.EB_Medical_Clearance_Obtained as medicalClearance,
        eb.EB_Police_Clearance_Obtained as policeClearance,
        eb.EB_Administrative_Clearance_Obtained as administrativeClearance,
        eb.EB_Financial_Clearance_Obtained as financialClearance,
        eb.EB_All_Documents_Complete as allDocumentsComplete,
        eb.EB_Exit_Authorized_By as exitAuthorizedBy,
        eb.EB_Exit_Authorization_Level_FK as authorizationLevelId,
        eb.EB_Exit_Authorization_Date as authorizationDate,
        eb.EB_Exit_Processed_By as exitProcessedBy,
        eb.EB_Exit_Notes as exitNotes,
        eb.EB_Added_on as registrationDate,
        eb.EB_Modified_on as lastModified,
        eb.EB_Added_by as addedBy,
        eb.EB_Provider_fk as providerId,
        eb.EB_Outlet_fk as outletId,
        bd.BD_Name as bodyName,
        bd.BD_Tag_Number as tagNumber,
        etl.ETL_Type_Name as exitTypeName,
        esl.ESL_Status_Name as exitStatusName,
        eal.EAL_Level_Name as authorizationLevelName
      FROM exit_bodies eb
      LEFT JOIN body_details bd ON eb.EB_Body_Details_FK = bd.BD_ID_PK
      LEFT JOIN exit_type_lookup etl ON eb.EB_Exit_Type_FK = etl.ETL_ID_PK
      LEFT JOIN exit_status_lookup esl ON eb.EB_Exit_Status_FK = esl.ESL_ID_PK
      LEFT JOIN exit_authorization_level_lookup eal ON eb.EB_Exit_Authorization_Level_FK = eal.EAL_ID_PK
      WHERE eb.EB_Status = 'Active'
      ORDER BY eb.EB_Exit_Date DESC, eb.EB_Added_on DESC
    `);

    // Map the database fields to the expected frontend format
    const mappedResults = result.recordset.map(record => {
      // Handle exit time properly - combine date and time
      let exitDateTime;
      if (record.exitTime && record.exitDate) {
        // Extract time from the time field (which comes as 1970 date with correct time)
        const timeOnly = record.exitTime.toTimeString().substring(0, 8); // HH:MM:SS
        const dateOnly = record.exitDate.toISOString().split('T')[0]; // YYYY-MM-DD
        exitDateTime = `${dateOnly}T${timeOnly}`;
      } else if (record.exitDate) {
        // If no time, use date with default time
        exitDateTime = `${record.exitDate.toISOString().split('T')[0]}T12:00:00`;
      } else {
        // Fallback to current timestamp
        exitDateTime = new Date().toISOString();
      }

      return {
          // Include all other fields from the record first
          ...record,
          
          // Then override with processed fields that match frontend expectations
          EB_Id_pk: record.id || `eb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          BodyName: record.bodyName || 'Unknown',
          EB_Exit_Date: record.exitDate ? record.exitDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          EB_Exit_Time: exitDateTime, // Combined date and time for display
          EB_Exit_Reason: record.exitReason || '',
          EB_Exit_Processed_By: record.exitProcessedBy || '',
          EB_Exit_Authorized_By: record.exitAuthorizedBy || '',
          EB_Expected_Exit_Date: record.expectedExitDate ? record.expectedExitDate.toISOString().split('T')[0] : null,
          EB_Actual_Exit_Date: record.actualExitDate ? record.actualExitDate.toISOString().split('T')[0] : null,
          EB_Exit_Authorization_Date: record.authorizationDate ? record.authorizationDate.toISOString().split('T')[0] : null,
          ExitTypeName: record.exitTypeName || '',
          ExitStatusName: record.exitStatusName || '',
          AuthorizationLevelName: record.authorizationLevelName || '',
          
          // Keep some additional fields for compatibility
          id: record.id,
          bodyName: record.bodyName,
          exitDateTime: exitDateTime,
          exitDate: record.exitDate ? record.exitDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          exitTime: exitDateTime,
          registrationDate: record.registrationDate || new Date().toISOString(),
          lastModified: record.lastModified || null,
          medicalClearance: Boolean(record.medicalClearance),
          policeClearance: Boolean(record.policeClearance),
          administrativeClearance: Boolean(record.administrativeClearance),
          financialClearance: Boolean(record.financialClearance),
          allDocumentsComplete: Boolean(record.allDocumentsComplete)
        };
    });

    return mappedResults;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
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

// Get a patient by their external ID or name
export const getPatientById = async (patientId) => {
  let pool;
  try {
    console.log('[DEBUG] getPatientById called with:', { patientId, type: typeof patientId });
    pool = await sql.connect(config);
    
    // Try to find the patient by their card primary key first
    let result = await pool.request()
      .input('patientId', sql.BigInt, patientId)
      .query('SELECT PM_Card_PK, PM_FirstName, PM_LastName FROM PAT_Patient_Master_1 WHERE PM_Card_PK = @patientId');
    
    console.log('[DEBUG] Patient lookup result:', result.recordset);
    
    if (result.recordset.length > 0) {
      return result.recordset[0];
    }
    
    // If not found, try to find by external ID
    result = await pool.request()
      .input('patientId', sql.VarChar(50), String(patientId))
      .query('SELECT PM_Card_PK, PM_FirstName, PM_LastName FROM PAT_Patient_Master_1 WHERE PM_ExternalID = @patientId');
      
    console.log('[DEBUG] External ID lookup result:', result.recordset);
    if (result.recordset.length > 0) {
      return result.recordset[0];
    }
    
    // If still not found, try to find by name
    result = await pool.request()
      .input('patientName', sql.NVarChar(255), `%${String(patientId)}%`)
      .query(`SELECT PM_Card_PK, PM_FirstName, PM_LastName FROM PAT_Patient_Master_1 WHERE CONCAT(PM_FirstName, ' ', PM_LastName) LIKE @patientName`);
      
    console.log('[DEBUG] Name lookup result:', result.recordset);
    return result.recordset.length > 0 ? result.recordset[0] : null;
    
  } catch (error) {
    console.error('[ERROR] Error getting patient by ID:', error);
    return null;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

// Add verification log to a body
export const updateBodyVerification = async (bodyId, verificationData) => {
  let pool;
  try {
    console.log('[DEBUG] updateBodyVerification called with:', { bodyId, verificationData });
    pool = await sql.connect(config);
    
    // First, check if the body exists
    const bodyCheck = await pool.request()
      .input('bodyId', sql.Int, bodyId)
      .query('SELECT BD_ID_PK, BD_Name FROM body_details WHERE BD_ID_PK = @bodyId');
    
    console.log('[DEBUG] Body check result:', bodyCheck.recordset);
    
    if (bodyCheck.recordset.length === 0) {
      console.log('[ERROR] Body not found in database with ID:', bodyId);
      throw new Error(`Body with ID ${bodyId} not found`);
    }
    
    // Update the body status to verified and set verification status
    const updateResult = await pool.request()
      .input('bodyId', sql.Int, bodyId)
      .input('status', sql.VarChar(20), 'verified')
      .input('verificationStatus', sql.NVarChar(50), 'Verified')
      .query(`
        UPDATE body_details 
        SET 
          BD_Status = @status,
          BD_Verification_Status = @verificationStatus
        WHERE BD_ID_PK = @bodyId
      `);
    
    console.log('[DEBUG] Update result:', updateResult.rowsAffected);
    
    // Then, insert the verification log record
    const logResult = await pool.request()
      .input('bodyId', sql.Int, bodyId)
      .input('name', sql.NVarChar(255), verificationData.name)
      .input('relation', sql.NVarChar(100), verificationData.relation || null)
      .input('contact', sql.VarChar(20), verificationData.contact)
      .input('idProof', sql.NVarChar(100), verificationData.idProof || null)
      .input('remarks', sql.NVarChar(500), verificationData.remarks || null)
      .input('verifierType', sql.VarChar(50), verificationData.verifierType)
      .input('medicalRegNo', sql.VarChar(50), verificationData.medicalRegNo || null)
      .input('badgeNumber', sql.VarChar(50), verificationData.badgeNumber || null)
      .input('verificationDate', sql.DateTime, new Date())
      .query(`
        INSERT INTO body_verification_log (
          BVL_Body_FK, BVL_Verifier_Name, BVL_Relation, BVL_Contact, 
          BVL_ID_Proof, BVL_Remarks, BVL_Verifier_Type, BVL_Medical_Reg_No,
          BVL_Badge_Number, BVL_Verification_Date, BVL_Added_By
        ) VALUES (
          @bodyId, @name, @relation, @contact, @idProof, @remarks, 
          @verifierType, @medicalRegNo, @badgeNumber, @verificationDate, 1
        )
      `);
    
    console.log('[DEBUG] Log insert result:', logResult.rowsAffected);
    
    // Return the updated body
    const updatedBody = await pool.request()
      .input('bodyId', sql.Int, bodyId)
      .query('SELECT * FROM body_details WHERE BD_ID_PK = @bodyId');
    
    console.log('[DEBUG] Updated body:', updatedBody.recordset[0]);
    return updatedBody.recordset[0];
  } catch (error) {
    console.error('[ERROR] Error updating body verification:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

// Get verification log for a body
export const getBodyVerificationLog = async (bodyId) => {
  let pool;
  try {
    console.log('[DEBUG] getBodyVerificationLog called with bodyId:', bodyId);
    pool = await sql.connect(config);
    
    const result = await pool.request()
      .input('bodyId', sql.Int, bodyId)
      .query(`
        SELECT 
          BVL_Verifier_Name as name,
          BVL_Relation as relation,
          BVL_Contact as contact,
          BVL_ID_Proof as idProof,
          BVL_Remarks as remarks,
          BVL_Verifier_Type as verifierType,
          BVL_Medical_Reg_No as medicalRegNo,
          BVL_Badge_Number as badgeNumber,
          BVL_Verification_Date as date
        FROM body_verification_log 
        WHERE BVL_Body_FK = @bodyId 
        ORDER BY BVL_Verification_Date DESC
      `);
    
    console.log('[DEBUG] getBodyVerificationLog result:', result.recordset);
    return result.recordset;
  } catch (error) {
    console.error('[ERROR] Error getting body verification log:', error);
    return [];
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

export const getDischarges = async () => {
  try {
    console.log('Connecting to database...');
    await sql.connect(config);

    // First, let's check the structure of the IP_Admission_Details table
    const columnsResult = await sql.query`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'IP_Admission_Details'
    `;
    console.log('Columns in IP_Admission_Details:', columnsResult.recordset.map(c => c.COLUMN_NAME).join(', '));

    // Let's try a simpler query first to see what data we can get
    const simpleQuery = `
      SELECT TOP 10 
        ds.IDS_ID_PK as id,
        iad.IAD_Patient_fk as patientId,
        CONCAT(COALESCE(pmv.PM_FirstName, ''), ' ', 
               CASE WHEN pmv.PM_MiddleName IS NOT NULL AND pmv.PM_MiddleName != '' 
                    THEN pmv.PM_MiddleName + ' ' ELSE '' END, 
               COALESCE(pmv.PM_LastName, '')) as patientName,
        pmv.PM_PatientAgeYear as age,
        pmv.PM_Sex_FK as gender,
        iad.IAD_Admission_DateTime as admissionDate,
        iad.IAD_Discharge_Date as dischargeDate,
        NULL as ward, -- Removed IAD_Ward_FK as it doesn't exist
        COALESCE(ds.IDS_Diagnosis, '') as diagnosis,
        COALESCE(iad.IAD_Discharge_Reason, '') as dischargeStatus,
        'N/A' as contactPerson,
        'N/A' as contactNumber,
        'N/A' as address,
        0 as mlcCase,
        0 as policeInvolved,
        COALESCE(ds.IDS_Clinical_History, '') as notes,
        'N/A' as dischargedBy,
        iad.IAD_Discharge_Date as dischargeTime
      FROM IP_Discharge_Summary ds
      INNER JOIN IP_Admission_Details iad ON ds.IDS_Admit_Fk = iad.IAD_ID_PK
      LEFT JOIN patient_master_view pmv ON iad.IAD_Patient_fk = pmv.PM_Card_PK
      WHERE iad.IAD_Discharge_Date IS NOT NULL
      ORDER BY iad.IAD_Discharge_Date DESC
    `;

    console.log('Executing discharge query...');
    const result = await sql.query(simpleQuery);
    console.log(`Retrieved ${result.recordset ? result.recordset.length : 0} discharge records`);

    if (result.recordset && result.recordset.length > 0) {
      console.log('Sample discharge record:', JSON.stringify(result.recordset[0], null, 2));
    } else {
      console.log('No discharge records found. Checking if tables have data...');

      // Check if tables have data
      const checkTable = async (tableName) => {
        try {
          const countResult = await sql.query`SELECT COUNT(*) as count FROM ${tableName}`;
          console.log(`Table ${tableName} has ${countResult.recordset[0].count} rows`);
          return countResult.recordset[0].count > 0;
        } catch (err) {
          console.error(`Error checking table ${tableName}:`, err.message);
          return false;
        }
      };

      await checkTable('IP_Discharge_Summary');
      await checkTable('IP_Admission_Details');
      await checkTable('patient_master_view');
    }

    return result.recordset || [];
  } catch (error) {
    console.error('Error in getDischarges:', error);
    throw error;
  }
};

export const getExpiredPatients = async () => {
  let pool;
  try {
    console.log('Connecting to database...');
    pool = await sql.connect(config);
    console.log('Database connection successful');

    try {
      // First, let's get the column names from the ip_admission_details table
      const columnsResult = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'ip_admission_details'
        ORDER BY ORDINAL_POSITION;
      `);

      console.log('Columns in ip_admission_details:',
        columnsResult.recordset.map(c => c.COLUMN_NAME).join(', '));

      // Now, let's find the date column that might be used for discharge
      const dateColumn = columnsResult.recordset.find(c =>
        c.COLUMN_NAME.toLowerCase().includes('discharge') ||
        c.COLUMN_NAME.toLowerCase().includes('date') ||
        c.COLUMN_NAME.toLowerCase().includes('time')
      )?.COLUMN_NAME || 'IAD_Admission_DateTime';

      // Build and execute the query with patient details
      // Filter out patients who have already been registered as bodies
      const expiredPatientsQuery = `
        SELECT 
          -- Admission details (for reference)
          iad.IAD_ID_PK as admissionId,
          iad.IAD_Admission_DateTime as admissionDate,
          iad.IAD_Discharge_Date as dischargeDate,
          iad.IAD_Discharge_Reason as dischargeReason,
          iad.IAD_Discharge_Number as dischargeNumber,
          
          -- Patient details for dropdown and autofill
          pmv.PM_Card_PK as id,
          CONCAT(
            pmv.PM_FirstName, 
            CASE WHEN pmv.PM_MiddleName IS NOT NULL AND pmv.PM_MiddleName != '' THEN ' ' + pmv.PM_MiddleName ELSE '' END, 
            ' ', 
            pmv.PM_LastName
          ) as name,
          pmv.PM_FirstName as firstName,
          pmv.PM_MiddleName as middleName,
          pmv.PM_LastName as lastName,
          pmv.PM_DOB as dateOfBirth,
          -- Calculate age from date of birth (PM_DOB)
          CASE 
            WHEN pmv.PM_DOB IS NOT NULL
            THEN CAST(DATEDIFF(YEAR, pmv.PM_DOB, GETDATE()) - 
                 CASE 
                   WHEN MONTH(pmv.PM_DOB) > MONTH(GETDATE()) OR 
                        (MONTH(pmv.PM_DOB) = MONTH(GETDATE()) AND DAY(pmv.PM_DOB) > DAY(GETDATE()))
                   THEN 1 
                   ELSE 0 
                 END AS VARCHAR)
            ELSE 'Unknown'
          END as age,
          -- Join with gender lookup table to get actual gender name instead of foreign key
          COALESCE(gsl.SL_Name, 'Unknown') as gender,
         
          -- Join with blood group lookup table to get actual blood group name instead of foreign key
          pmv.PM_PrimaryIdentification as idNumber,
          pmv.PM_Occupation as occupation,
          pmv.PM_Mstatus as maritalStatus,
          pmv.PM_ParentName as parentOrSpouse,
          pmv.PM_OwnerName as ownerName,
          pmv.PM_ExternalID as externalId,
          
          -- Basic contact information from patient master
          'N/A' as contactNumber,
          'N/A' as address
          
        FROM 
          ip_admission_details iad
          INNER JOIN patient_master_view pmv ON iad.IAD_Patient_fk = pmv.PM_Card_PK
          LEFT JOIN GEN_Sex_Lookup gsl ON pmv.PM_Sex_FK = gsl.SL_ID_PK
          LEFT JOIN body_details bd ON bd.BD_Patient_FK = pmv.PM_Card_PK
        WHERE 
          iad.IAD_Discharge_Reason = @dischargeReason
          AND bd.BD_Patient_FK IS NULL  -- Exclude patients who already have body records
        GROUP BY
          iad.IAD_ID_PK, iad.IAD_Admission_DateTime, iad.IAD_Discharge_Date, 
          iad.IAD_Discharge_Reason, iad.IAD_Discharge_Number, pmv.PM_Card_PK, 
          pmv.PM_FirstName, pmv.PM_MiddleName, pmv.PM_LastName, pmv.PM_DOB,
          pmv.PM_PatientAgeYear, pmv.PM_Sex_FK, gsl.SL_Name, 
          pmv.PM_PrimaryIdentification, pmv.PM_Occupation, pmv.PM_Mstatus,
          pmv.PM_ParentName, pmv.PM_OwnerName, pmv.PM_ExternalID
        ORDER BY 
          iad.${dateColumn} DESC
      `;

      console.log('Executing query:', expiredPatientsQuery);
      const result = await pool.request()
        .input('dischargeReason', sql.Int, 2)
        .query(expiredPatientsQuery);

      console.log(`Found ${result.recordset.length} records with discharge reason = 2`);

      if (result.recordset.length > 0) {
        console.log('Sample record:', JSON.stringify(result.recordset[0], null, 2));
        return result.recordset;
      } else {
        console.log('No records found with discharge reason = 2');
        return [];
      }
    } catch (error) {
      console.error('Error in getExpiredPatients:', {
        message: error.message,
        code: error.code,
        number: error.number,
        state: error.state,
        stack: error.stack
      });
      throw error;
    }

  } catch (error) {
    console.error('Database error in getExpiredPatients:', {
      message: error.message,
      code: error.code,
      number: error.number,
      state: error.state,
      stack: error.stack
    });
    throw error; // Re-throw to be handled by the controller
  } finally {
    // Close the connection if it was opened
    if (pool) {
      try {
        await pool.close();
        console.log('Database connection closed');
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
    }
  }
};

// Get all storage allocations
export async function getStorageAllocations() {
  try {
    console.log('Fetching storage allocations...');
    const pool = getPool();
    
    // First, check if the storage_allocation table exists
    const tableCheck = await pool.request().query(`
      SELECT COUNT(*) as tableExists 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'storage_allocation'
    `);
    
    if (tableCheck.recordset[0].tableExists === 0) {
      console.error('storage_allocation table does not exist');
      return [];
    }
    
    console.log('Executing storage allocation query...');
    const result = await pool.request().query(`
      SELECT 
        sa.SA_ID_PK as id,
        sa.SA_Body_FK as bodyId,
        bd.BD_Name as bodyName,
        sa.SA_Storage_Unit_FK as storageUnitId,
        su.SU_Unit_Code as storageUnitCode,
        sa.SA_Allocated_Date as allocatedDate,
        sa.SA_Expected_Duration_Days as expectedDurationDays,
        sa.SA_Status as status,
        sa.SA_Priority_Level as priorityLevel,
        sa.SA_Temperature_Required as temperatureRequired,
        su.SU_Temperature as currentTemperature
      FROM storage_allocation sa
      INNER JOIN storage_unit_master su ON sa.SA_Storage_Unit_FK = su.SU_ID_PK
      INNER JOIN body_details bd ON sa.SA_Body_FK = bd.BD_ID_PK
      ORDER BY sa.SA_Allocated_Date DESC
    `);
    
    console.log(`Found ${result.recordset.length} storage allocations`);
    return result.recordset;
  } catch (error) {
    console.error('Error fetching storage allocations:', error);
    throw error;
  }
}

// Create a new storage allocation
export async function createStorageAllocation(allocationData) {
  let pool;
  try {
    pool = await sql.connect(config);
    const transaction = new sql.Transaction(pool);
    
    await transaction.begin();
    
    const result = await transaction.request()
      .input('bodyId', sql.Int, allocationData.bodyId)
      .input('storageUnitId', sql.Int, allocationData.storageUnitId)
      .input('allocatedBy', sql.Int, allocationData.allocatedBy)
      .input('status', sql.NVarChar(20), allocationData.status || 'Active')
      .input('priority', sql.NVarChar(20), allocationData.priorityLevel || 'Normal')
      .input('tempRequired', sql.Decimal(5,2), allocationData.temperatureRequired || -18.0)
      .input('providerId', sql.Int, allocationData.providerId)
      .input('outletId', sql.Int, allocationData.outletId || null)
      .input('expectedDays', sql.Int, allocationData.expectedDurationDays || 7)
      .input('allocationType', sql.NVarChar(30), allocationData.allocationType || 'Standard')
      .input('notes', sql.NVarChar(sql.MAX), allocationData.notes || null)
      .query(`
        INSERT INTO storage_allocation (
          SA_Body_FK, 
          SA_Storage_Unit_FK, 
          SA_Allocated_By,
          SA_Status, 
          SA_Priority_Level, 
          SA_Temperature_Required,
          SA_Provider_FK, 
          SA_Outlet_FK,
          SA_Expected_Duration_Days,
          SA_Allocation_Type,
          SA_Notes,
          SA_Added_By
        )
        OUTPUT INSERTED.SA_ID_PK as id
        VALUES (
          @bodyId, 
          @storageUnitId, 
          @allocatedBy,
          @status, 
          @priority, 
          @tempRequired,
          @providerId, 
          @outletId,
          @expectedDays,
          @allocationType,
          @notes,
          @allocatedBy
        )
      `);
    
    await transaction.commit();
    return { id: result.recordset[0].id };
  } catch (error) {
    if (pool) {
      try {
        await pool.request().query('ROLLBACK TRANSACTION');
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }
    console.error('Error creating storage allocation:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

// Update storage allocation status
export async function updateStorageAllocationStatus(allocationId, status, userId) {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('id', sql.Int, allocationId)
      .input('status', sql.NVarChar(20), status)
      .input('modifiedBy', sql.Int, userId)
      .query(`
        UPDATE storage_allocation 
        SET 
          SA_Status = @status,
          SA_Modified_By = @modifiedBy,
          SA_Modified_On = GETDATE()
        WHERE SA_ID_PK = @id
      `);
    
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error('Error updating storage allocation status:', error);
    throw error;
  }
}

// Create storage allocations for bodies that don't have them
export async function createMissingStorageAllocations() {
  let pool;
  try {
    pool = await sql.connect(config);
    
    // Find bodies that have storage units but no allocations
    const bodiesWithoutAllocations = await pool.request().query(`
      SELECT 
        bd.BD_ID_PK as bodyId,
        bd.BD_Name as bodyName,
        bd.BD_Storage_Unit as storageUnit,
        bd.BD_Risk_Level as riskLevel,
        bd.BD_Provider_FK as providerId,
        bd.BD_Outlet_FK as outletId,
        bd.BD_Added_By as addedBy
      FROM body_details bd
      LEFT JOIN storage_allocation sa ON bd.BD_ID_PK = sa.SA_Body_FK
      WHERE sa.SA_Body_FK IS NULL 
        AND bd.BD_Storage_Unit IS NOT NULL 
        AND bd.BD_Status_Flag = 10
    `);
    
    console.log(`Found ${bodiesWithoutAllocations.recordset.length} bodies without storage allocations`);
    
    for (const body of bodiesWithoutAllocations.recordset) {
      try {
        // Check if storage unit exists
        const storageUnitResult = await pool.request()
          .input('unitCode', sql.NVarChar(20), body.storageUnit)
          .query('SELECT SU_ID_PK FROM storage_unit_master WHERE SU_Unit_Code = @unitCode');
        
        let storageUnitId;
        
        if (storageUnitResult.recordset.length > 0) {
          storageUnitId = storageUnitResult.recordset[0].SU_ID_PK;
        } else {
          // Create the storage unit
          const unitType = body.storageUnit.startsWith('F-') ? 1 : 2;
          const newStorageUnitResult = await pool.request()
            .input('unitCode', sql.NVarChar(20), body.storageUnit)
            .input('unitName', sql.NVarChar(100), `${body.storageUnit.startsWith('F-') ? 'Freezer' : 'Cooler'} Unit ${body.storageUnit.substring(2)}`)
            .input('unitType', sql.Int, unitType)
            .input('location', sql.Int, 1)
            .input('status', sql.NVarChar(20), 'Available')
            .input('capacity', sql.Int, 10)
            .input('providerId', sql.Int, body.providerId || 1)
            .input('outletId', sql.Int, body.outletId || 1)
            .input('addedBy', sql.Int, body.addedBy || 1)
            .query(`
              INSERT INTO storage_unit_master (
                SU_Unit_Code, SU_Unit_Name, SU_Type_FK, SU_Location_FK, 
                SU_Status, SU_Capacity, SU_Provider_FK, SU_Outlet_FK, SU_Added_By
              ) VALUES (
                @unitCode, @unitName, @unitType, @location,
                @status, @capacity, @providerId, @outletId, @addedBy
              );
              SELECT SCOPE_IDENTITY() as id;
            `);
          
          storageUnitId = newStorageUnitResult.recordset[0].id;
          console.log(`Created storage unit ${body.storageUnit} with ID ${storageUnitId}`);
        }
        
        // Create storage allocation
        await pool.request()
          .input('bodyId', sql.Int, body.bodyId)
          .input('storageUnitId', sql.Int, storageUnitId)
          .input('allocatedBy', sql.Int, body.addedBy || 1)
          .input('status', sql.NVarChar(20), 'Active')
          .input('priority', sql.NVarChar(20), body.riskLevel === 'high' || body.riskLevel === 'urgent' ? 'High' : 'Normal')
          .input('tempRequired', sql.Decimal(5,2), -18.0)
          .input('providerId', sql.Int, body.providerId || 1)
          .input('outletId', sql.Int, body.outletId || 1)
          .input('expectedDays', sql.Int, 7)
          .input('allocationType', sql.NVarChar(30), 'Standard')
          .query(`
            INSERT INTO storage_allocation (
              SA_Body_FK, 
              SA_Storage_Unit_FK, 
              SA_Allocated_By,
              SA_Status, 
              SA_Priority_Level, 
              SA_Temperature_Required,
              SA_Provider_FK, 
              SA_Outlet_FK,
              SA_Expected_Duration_Days,
              SA_Allocation_Type,
              SA_Added_By
            ) VALUES (
              @bodyId, 
              @storageUnitId, 
              @allocatedBy,
              @status, 
              @priority, 
              @tempRequired,
              @providerId, 
              @outletId,
              @expectedDays,
              @allocationType,
              @allocatedBy
            )
          `);
        
        console.log(`Created storage allocation for body ${body.bodyId} (${body.bodyName}) in storage unit ${body.storageUnit}`);
      } catch (error) {
        console.error(`Error creating storage allocation for body ${body.bodyId}:`, error);
      }
    }
    
    return { success: true, processed: bodiesWithoutAllocations.recordset.length };
  } catch (error) {
    console.error('Error creating missing storage allocations:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

// Get available storage units
export async function getAvailableStorageUnits(providerId, outletId = null) {
  let pool;
  try {
    pool = await sql.connect(config);
    
    // Check if the storage_unit_master table exists
    const tableCheck = await pool.request().query(`
      SELECT COUNT(*) as tableExists 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'storage_unit_master'
    `);
    
    if (tableCheck.recordset[0].tableExists === 0) {
      console.warn('storage_unit_master table does not exist, returning empty array');
      return [];
    }
    
    let query = `
      SELECT 
        su.SU_ID_PK as id,
        su.SU_Unit_Code as unitCode,
        su.SU_Unit_Name as unitName,
        su.SU_Status as status,
        su.SU_Capacity as capacity,
        su.SU_Current_Occupancy as currentOccupancy,
        su.SU_Temperature as temperature,
        sll.SLL_Location_Name as location,
        sutl.SUTL_Type_Name as unitType
      FROM storage_unit_master su
      LEFT JOIN storage_location_lookup sll ON su.SU_Location_FK = sll.SLL_ID_PK
      LEFT JOIN storage_unit_type_lookup sutl ON su.SU_Type_FK = sutl.SUTL_ID_PK
      WHERE su.SU_Status IN ('Available', 'Partially_Occupied')
        AND su.SU_Provider_FK = @providerId
        AND (su.SU_Current_Occupancy < su.SU_Capacity OR su.SU_Current_Occupancy IS NULL)
    `;
    
    const request = pool.request()
      .input('providerId', sql.Int, providerId);
    
    if (outletId) {
      query += ` AND (su.SU_Outlet_FK = @outletId OR su.SU_Outlet_FK IS NULL)`;
      request.input('outletId', sql.Int, outletId);
    }
    
    query += ` ORDER BY su.SU_Unit_Code`;
    
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error('Error fetching available storage units:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

// Get all active storage allocations with body details (not yet exited)
export async function getActiveStorageAllocations() {
  console.log('getActiveStorageAllocations called');
  let pool = getPool();
  
  try {
    // Simplified and more reliable query to get active storage allocations
    const activeAllocationsQuery = `
      SELECT 
        sa.SA_ID_PK as storageAllocationId,
        sa.SA_Body_FK as bodyId,
        sa.SA_Storage_Unit_FK as storageUnitId,
        su.SU_Unit_Code as storageUnitCode,
        sa.SA_Status as storageStatus,
        bd.BD_Name as bodyName,
        bd.BD_Status_Flag as statusFlag,
        bd.BD_Verification_Status as verificationStatus,
        bd.BD_Status as bodyStatus,
        bd.BD_Added_By as addedBy,
        bd.BD_Added_On as registrationDate
      FROM storage_allocation sa
      INNER JOIN body_details bd ON sa.SA_Body_FK = bd.BD_Id_PK
      LEFT JOIN storage_unit_master su ON sa.SA_Storage_Unit_FK = su.SU_ID_PK
      WHERE 
        -- Storage allocation must be Active (not Released)
        sa.SA_Status = 'Active'
        -- Body must have active status flag (10 or 'Active')
        AND (
          bd.BD_Status_Flag = 10 OR 
          bd.BD_Status_Flag = '10' OR 
          UPPER(LTRIM(RTRIM(CAST(bd.BD_Status_Flag AS NVARCHAR(20))))) = 'ACTIVE'
        )
      ORDER BY sa.SA_Allocated_Date DESC, bd.BD_Added_On DESC
    `;
    
    console.log('Executing simplified active storage allocations query...');
    const result = await pool.request().query(activeAllocationsQuery);
    
    console.log(`Found ${result.recordset.length} active storage allocations`);
    
    // Log sample results for debugging
    if (result.recordset.length > 0) {
      console.log('Sample active allocation:', {
        storageAllocationId: result.recordset[0].storageAllocationId,
        bodyId: result.recordset[0].bodyId,
        bodyName: result.recordset[0].bodyName,
        storageStatus: result.recordset[0].storageStatus,
        bodyStatus: result.recordset[0].bodyStatus,
        statusFlag: result.recordset[0].statusFlag,
        verificationStatus: result.recordset[0].verificationStatus
      });
    }
    
    // Process the results to ensure consistent data types
    const processedResults = result.recordset.map(record => ({
      ...record,
      // Convert status flags to consistent string format
      statusFlag: record.statusFlag !== null ? String(record.statusFlag) : null,
      verificationStatus: record.verificationStatus !== null ? String(record.verificationStatus) : 'Pending',
      // Ensure dates are properly formatted
      registrationDate: record.registrationDate ? new Date(record.registrationDate).toISOString() : null,
      // Use storage unit code if available, otherwise use ID
      storageUnitId: record.storageUnitCode || record.storageUnitId
    }));
    
    return processedResults;
    
  } catch (err) {
    console.error('Error in getActiveStorageAllocations:', {
      message: err.message,
      code: err.code,
      number: err.number,
      lineNumber: err.lineNumber,
      sqlState: err.sqlState,
      stack: err.stack
    });
    throw err;
  }
} 