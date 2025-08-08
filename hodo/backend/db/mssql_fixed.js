// Fixed getExpiredPatients function with proper blood group lookup
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
          pmv.PM_Sex_FK as gender,
          COALESCE(bgl.BGL_BloodGroup_Name, CAST(pmv.PM_BloodGroup AS NVARCHAR(50)), 'Unknown') as bloodGroup,
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
          LEFT JOIN GEN_BloodGroup_Lookup bgl ON pmv.PM_BloodGroup = bgl.BGL_ID_PK
          LEFT JOIN body_details bd ON bd.BD_Patient_FK = pmv.PM_Card_PK
        WHERE 
          iad.IAD_Discharge_Reason = @dischargeReason
          AND bd.BD_Patient_FK IS NULL  -- Exclude patients who already have body records
        GROUP BY
          iad.IAD_ID_PK, iad.IAD_Admission_DateTime, iad.IAD_Discharge_Date, 
          iad.IAD_Discharge_Reason, iad.IAD_Discharge_Number, pmv.PM_Card_PK, 
          pmv.PM_FirstName, pmv.PM_MiddleName, pmv.PM_LastName, pmv.PM_DOB,
          pmv.PM_PatientAgeYear, pmv.PM_Sex_FK, pmv.PM_BloodGroup, bgl.BGL_BloodGroup_Name,
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