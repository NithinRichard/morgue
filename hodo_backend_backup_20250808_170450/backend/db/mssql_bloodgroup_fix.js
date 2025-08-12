// Quick fix for the blood group issue - replace the expiredPatientsQuery section

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
    iad.IAD_Discharge_Date DESC
`;

// Instructions:
// 1. Find the expiredPatientsQuery variable assignment in mssql.js (around line 900-960)
// 2. Replace the entire query string with the above corrected version
// 3. Make sure to include the LEFT JOIN GEN_BloodGroup_Lookup line
// 4. Make sure the GROUP BY includes bgl.BGL_BloodGroup_Name
// 5. Fix the ORDER BY to use IAD_Discharge_Date instead of the dynamic dateColumn