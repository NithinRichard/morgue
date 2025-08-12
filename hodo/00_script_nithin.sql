-- =====================================================
-- MORTUARY MANAGEMENT SYSTEM - EXIT BODIES TABLES
-- =====================================================

PRINT 'Nithin Start.....';

USE devdb;
GO

-- 1. Exit Type Lookup Table
-- Prefix: ETL_ (Exit Type Lookup)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[exit_type_lookup]') AND type in (N'U'))
BEGIN
    CREATE TABLE exit_type_lookup (
        ETL_Id_pk INT IDENTITY(1,1) PRIMARY KEY,
        ETL_Type_Name NVARCHAR(50) NOT NULL,
        ETL_Description NVARCHAR(255),
        ETL_Requires_Verification BIT DEFAULT 1,
        ETL_Requires_NOC BIT DEFAULT 1,
        ETL_Requires_Authorization BIT DEFAULT 0,
        ETL_Added_by NVARCHAR(100) NOT NULL,
        ETL_Added_on DATETIME2 DEFAULT GETDATE(),
        ETL_Modified_by NVARCHAR(100),
        ETL_Modified_on DATETIME2,
        ETL_Status NVARCHAR(20) DEFAULT 'Active',
        ETL_Provider_fk INT NOT NULL,
        ETL_Outlet_fk INT
    );
    PRINT 'Table exit_type_lookup created successfully.';
END
ELSE
BEGIN
    PRINT 'Table exit_type_lookup already exists.';
END

-- 2. Exit Status Lookup Table
-- Prefix: ESL_ (Exit Status Lookup)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[exit_status_lookup]') AND type in (N'U'))
BEGIN
    CREATE TABLE exit_status_lookup (
        ESL_Id_pk INT IDENTITY(1,1) PRIMARY KEY,
        ESL_Status_Name NVARCHAR(50) NOT NULL,
        ESL_Description NVARCHAR(255),
        ESL_Is_Active BIT DEFAULT 1,
        ESL_Color_Code NVARCHAR(10), -- For UI display
        ESL_Added_by NVARCHAR(100) NOT NULL,
        ESL_Added_on DATETIME2 DEFAULT GETDATE(),
        ESL_Modified_by NVARCHAR(100),
        ESL_Modified_on DATETIME2,
        ESL_Status NVARCHAR(20) DEFAULT 'Active',
        ESL_Provider_fk INT NOT NULL,
        ESL_Outlet_fk INT
    );
    PRINT 'Table exit_status_lookup created successfully.';
END
ELSE
BEGIN
    PRINT 'Table exit_status_lookup already exists.';
END

-- 3. Receiver Type Lookup Table
-- Prefix: RTL_ (Receiver Type Lookup)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[receiver_type_lookup]') AND type in (N'U'))
BEGIN
    CREATE TABLE receiver_type_lookup (
        RTL_Id_pk INT IDENTITY(1,1) PRIMARY KEY,
        RTL_Type_Name NVARCHAR(50) NOT NULL,
        RTL_Description NVARCHAR(255),
        RTL_Requires_ID_Proof BIT DEFAULT 1,
        RTL_Requires_Authorization BIT DEFAULT 0,
        RTL_Added_by NVARCHAR(100) NOT NULL,
        RTL_Added_on DATETIME2 DEFAULT GETDATE(),
        RTL_Modified_by NVARCHAR(100),
        RTL_Modified_on DATETIME2,
        RTL_Status NVARCHAR(20) DEFAULT 'Active',
        RTL_Provider_fk INT NOT NULL,
        RTL_Outlet_fk INT
    );
    PRINT 'Table receiver_type_lookup created successfully.';
END
ELSE
BEGIN
    PRINT 'Table receiver_type_lookup already exists.';
END

-- 4. ID Proof Type Lookup Table
-- Prefix: IDL_ (ID Proof Type Lookup)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[id_proof_type_lookup]') AND type in (N'U'))
BEGIN
    CREATE TABLE id_proof_type_lookup (
        IDL_Id_pk INT IDENTITY(1,1) PRIMARY KEY,
        IDL_Proof_Name NVARCHAR(50) NOT NULL,
        IDL_Description NVARCHAR(255),
        IDL_Is_Government_Issued BIT DEFAULT 1,
        IDL_Added_by NVARCHAR(100) NOT NULL,
        IDL_Added_on DATETIME2 DEFAULT GETDATE(),
        IDL_Modified_by NVARCHAR(100),
        IDL_Modified_on DATETIME2,
        IDL_Status NVARCHAR(20) DEFAULT 'Active',
        IDL_Provider_fk INT NOT NULL,
        IDL_Outlet_fk INT
    );
    PRINT 'Table id_proof_type_lookup created successfully.';
END
ELSE
BEGIN
    PRINT 'Table id_proof_type_lookup already exists.';
END

-- 5. Relationship Lookup Table
-- Prefix: RLL_ (Relationship Lookup)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[relationship_lookup]') AND type in (N'U'))
BEGIN
    CREATE TABLE relationship_lookup (
        RLL_Id_pk INT IDENTITY(1,1) PRIMARY KEY,
        RLL_Relationship_Name NVARCHAR(50) NOT NULL,
        RLL_Description NVARCHAR(255),
        RLL_Is_Immediate_Family BIT DEFAULT 0,
        RLL_Added_by NVARCHAR(100) NOT NULL,
        RLL_Added_on DATETIME2 DEFAULT GETDATE(),
        RLL_Modified_by NVARCHAR(100),
        RLL_Modified_on DATETIME2,
        RLL_Status NVARCHAR(20) DEFAULT 'Active',
        RLL_Provider_fk INT NOT NULL,
        RLL_Outlet_fk INT
    );
    PRINT 'Table relationship_lookup created successfully.';
END
ELSE
BEGIN
    PRINT 'Table relationship_lookup already exists.';
END

-- 6. Exit Authorization Level Lookup Table
-- Prefix: EAL_ (Exit Authorization Level Lookup)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[exit_authorization_level_lookup]') AND type in (N'U'))
BEGIN
    CREATE TABLE exit_authorization_level_lookup (
        EAL_Id_pk INT IDENTITY(1,1) PRIMARY KEY,
        EAL_Level_Name NVARCHAR(50) NOT NULL,
        EAL_Description NVARCHAR(255),
        EAL_Minimum_Rank NVARCHAR(50),
        EAL_Added_by NVARCHAR(100) NOT NULL,
        EAL_Added_on DATETIME2 DEFAULT GETDATE(),
        EAL_Modified_by NVARCHAR(100),
        EAL_Modified_on DATETIME2,
        EAL_Status NVARCHAR(20) DEFAULT 'Active',
        EAL_Provider_fk INT NOT NULL,
        EAL_Outlet_fk INT
    );
    PRINT 'Table exit_authorization_level_lookup created successfully.';
END
ELSE
BEGIN
    PRINT 'Table exit_authorization_level_lookup already exists.';
END

-- 7. Main Exit Bodies Table
-- Prefix: EB_ (Exit Bodies)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[exit_bodies]') AND type in (N'U'))
BEGIN
    CREATE TABLE exit_bodies (
        EB_Id_pk INT IDENTITY(1,1) PRIMARY KEY,
        EB_Body_Details_FK INT NOT NULL,
        EB_Exit_Type_FK INT NOT NULL,
        EB_Exit_Status_FK INT NOT NULL,
        EB_Exit_Date DATETIME2 NOT NULL,
        EB_Exit_Time TIME NOT NULL,
        EB_Expected_Exit_Date DATETIME2,
        EB_Actual_Exit_Date DATETIME2,
        EB_Exit_Reason NVARCHAR(500),
        EB_Medical_Clearance_Obtained BIT DEFAULT 0,
        EB_Police_Clearance_Obtained BIT DEFAULT 0,
        EB_Administrative_Clearance_Obtained BIT DEFAULT 0,
        EB_Financial_Clearance_Obtained BIT DEFAULT 0,
        EB_All_Documents_Complete BIT DEFAULT 0,
        EB_Exit_Authorized_By NVARCHAR(100),
        EB_Exit_Authorization_Level_FK INT,
        EB_Exit_Authorization_Date DATETIME2,
        EB_Exit_Processed_By NVARCHAR(100) NOT NULL,
        EB_Exit_Notes NVARCHAR(MAX),
        EB_Added_by NVARCHAR(100) NOT NULL,
        EB_Added_on DATETIME2 DEFAULT GETDATE(),
        EB_Modified_by NVARCHAR(100),
        EB_Modified_on DATETIME2,
        EB_Status NVARCHAR(20) DEFAULT 'Active',
        EB_Provider_fk INT NOT NULL,
        EB_Outlet_fk INT
    );
    PRINT 'Table exit_bodies created successfully.';
END
ELSE
BEGIN
    PRINT 'Table exit_bodies already exists.';
END

-- 8. Exit Receivers Table
-- Prefix: ER_ (Exit Receivers)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[exit_receivers]') AND type in (N'U'))
BEGIN
    CREATE TABLE exit_receivers (
        ER_Id_pk INT IDENTITY(1,1) PRIMARY KEY,
        ER_Exit_Bodies_FK INT NOT NULL,
        ER_Receiver_Type_FK INT NOT NULL,
        ER_Receiver_Name NVARCHAR(100) NOT NULL,
        ER_Receiver_Contact_Number NVARCHAR(20),
        ER_Receiver_Email NVARCHAR(100),
        ER_Receiver_Address NVARCHAR(500),
        ER_Relationship_FK INT NOT NULL,
        ER_ID_Proof_Type_FK INT,
        ER_ID_Proof_Number NVARCHAR(50),
        ER_ID_Proof_Issued_By NVARCHAR(100),
        ER_ID_Proof_Issued_Date DATE,
        ER_ID_Proof_Expiry_Date DATE,
        ER_Is_Primary_Receiver BIT DEFAULT 1,
        ER_Added_by NVARCHAR(100) NOT NULL,
        ER_Added_on DATETIME2 DEFAULT GETDATE(),
        ER_Modified_by NVARCHAR(100),
        ER_Modified_on DATETIME2,
        ER_Status NVARCHAR(20) DEFAULT 'Active',
        ER_Provider_fk INT NOT NULL,
        ER_Outlet_fk INT
    );
    PRINT 'Table exit_receivers created successfully.';
END
ELSE
BEGIN
    PRINT 'Table exit_receivers already exists.';
END

-- 9. Exit Documents Table
-- Prefix: ED_ (Exit Documents)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[exit_documents]') AND type in (N'U'))
BEGIN
    CREATE TABLE exit_documents (
        ED_Id_pk INT IDENTITY(1,1) PRIMARY KEY,
        ED_Exit_Bodies_FK INT NOT NULL,
        ED_Document_Type NVARCHAR(50) NOT NULL,
        ED_Document_Name NVARCHAR(100) NOT NULL,
        ED_Document_Number NVARCHAR(50),
        ED_Document_Date DATE,
        ED_Document_Issued_By NVARCHAR(100),
        ED_Document_File_Path NVARCHAR(500),
        ED_Document_File_Size INT,
        ED_Document_File_Type NVARCHAR(20),
        ED_Is_Required BIT DEFAULT 1,
        ED_Is_Received BIT DEFAULT 0,
        ED_Received_Date DATETIME2,
        ED_Received_By NVARCHAR(100),
        ED_Notes NVARCHAR(500),
        ED_Added_by NVARCHAR(100) NOT NULL,
        ED_Added_on DATETIME2 DEFAULT GETDATE(),
        ED_Modified_by NVARCHAR(100),
        ED_Modified_on DATETIME2,
        ED_Status NVARCHAR(20) DEFAULT 'Active',
        ED_Provider_fk INT NOT NULL,
        ED_Outlet_fk INT
    );
    PRINT 'Table exit_documents created successfully.';
END
ELSE
BEGIN
    PRINT 'Table exit_documents already exists.';
END

-- 10. Exit Clearances Table
-- Prefix: EC_ (Exit Clearances)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[exit_clearances]') AND type in (N'U'))
BEGIN
    CREATE TABLE exit_clearances (
        EC_Id_pk INT IDENTITY(1,1) PRIMARY KEY,
        EC_Exit_Bodies_FK INT NOT NULL,
        EC_Clearance_Type NVARCHAR(50) NOT NULL,
        EC_Clearance_Name NVARCHAR(100) NOT NULL,
        EC_Clearance_Status NVARCHAR(20) DEFAULT 'Pending',
        EC_Clearance_Date DATETIME2,
        EC_Clearance_By NVARCHAR(100),
        EC_Clearance_Reference_Number NVARCHAR(50),
        EC_Clearance_Notes NVARCHAR(500),
        EC_Is_Required BIT DEFAULT 1,
        EC_Is_Obtained BIT DEFAULT 0,
        EC_Added_by NVARCHAR(100) NOT NULL,
        EC_Added_on DATETIME2 DEFAULT GETDATE(),
        EC_Modified_by NVARCHAR(100),
        EC_Modified_on DATETIME2,
        EC_Status NVARCHAR(20) DEFAULT 'Active',
        EC_Provider_fk INT NOT NULL,
        EC_Outlet_fk INT
    );
    PRINT 'Table exit_clearances created successfully.';
END
ELSE
BEGIN
    PRINT 'Table exit_clearances already exists.';
END

-- 11. Exit Witnesses Table
-- Prefix: EW_ (Exit Witnesses)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[exit_witnesses]') AND type in (N'U'))
BEGIN
    CREATE TABLE exit_witnesses (
        EW_Id_pk INT IDENTITY(1,1) PRIMARY KEY,
        EW_Exit_Bodies_FK INT NOT NULL,
        EW_Witness_Name NVARCHAR(100) NOT NULL,
        EW_Witness_Designation NVARCHAR(100),
        EW_Witness_Contact_Number NVARCHAR(20),
        EW_Witness_Email NVARCHAR(100),
        EW_Witness_Address NVARCHAR(500),
        EW_Witness_Type NVARCHAR(50), -- Staff, Police, Family Member, etc.
        EW_Witness_Signature_File_Path NVARCHAR(500),
        EW_Witness_Notes NVARCHAR(500),
        EW_Added_by NVARCHAR(100) NOT NULL,
        EW_Added_on DATETIME2 DEFAULT GETDATE(),
        EW_Modified_by NVARCHAR(100),
        EW_Modified_on DATETIME2,
        EW_Status NVARCHAR(20) DEFAULT 'Active',
        EW_Provider_fk INT NOT NULL,
        EW_Outlet_fk INT
    );
    PRINT 'Table exit_witnesses created successfully.';
END
ELSE
BEGIN
    PRINT 'Table exit_witnesses already exists.';
END

-- 12. Exit Handover Items Table
-- Prefix: EHI_ (Exit Handover Items)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[exit_handover_items]') AND type in (N'U'))
BEGIN
    CREATE TABLE exit_handover_items (
        EHI_Id_pk INT IDENTITY(1,1) PRIMARY KEY,
        EHI_Exit_Bodies_FK INT NOT NULL,
        EHI_Item_Name NVARCHAR(100) NOT NULL,
        EHI_Item_Description NVARCHAR(500),
        EHI_Item_Category NVARCHAR(50), -- Belongings, Documents, Keys, etc.
        EHI_Item_Quantity INT DEFAULT 1,
        EHI_Item_Condition NVARCHAR(50), -- Good, Damaged, Missing, etc.
        EHI_Item_Value DECIMAL(10,2),
        EHI_Is_Handed_Over BIT DEFAULT 0,
        EHI_Handover_Date DATETIME2,
        EHI_Handover_To NVARCHAR(100),
        EHI_Handover_Notes NVARCHAR(500),
        EHI_Added_by NVARCHAR(100) NOT NULL,
        EHI_Added_on DATETIME2 DEFAULT GETDATE(),
        EHI_Modified_by NVARCHAR(100),
        EHI_Modified_on DATETIME2,
        EHI_Status NVARCHAR(20) DEFAULT 'Active',
        EHI_Provider_fk INT NOT NULL,
        EHI_Outlet_fk INT
    );
    PRINT 'Table exit_handover_items created successfully.';
END
ELSE
BEGIN
    PRINT 'Table exit_handover_items already exists.';
END

-- 13. Exit Audit Trail Table
-- Prefix: EAT_ (Exit Audit Trail)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[exit_audit_trail]') AND type in (N'U'))
BEGIN
    CREATE TABLE exit_audit_trail (
        EAT_Id_pk INT IDENTITY(1,1) PRIMARY KEY,
        EAT_Exit_Bodies_FK INT NOT NULL,
        EAT_Action_Type NVARCHAR(50) NOT NULL, -- Created, Updated, Status Changed, etc.
        EAT_Action_Description NVARCHAR(500),
        EAT_Action_By NVARCHAR(100) NOT NULL,
        EAT_Action_Date DATETIME2 DEFAULT GETDATE(),
        EAT_Old_Values NVARCHAR(MAX), -- JSON format for old values
        EAT_New_Values NVARCHAR(MAX), -- JSON format for new values
        EAT_IP_Address NVARCHAR(45),
        EAT_User_Agent NVARCHAR(500),
        EAT_Added_by NVARCHAR(100) NOT NULL,
        EAT_Added_on DATETIME2 DEFAULT GETDATE(),
        EAT_Modified_by NVARCHAR(100),
        EAT_Modified_on DATETIME2,
        EAT_Status NVARCHAR(20) DEFAULT 'Active',
        EAT_Provider_fk INT NOT NULL,
        EAT_Outlet_fk INT
    );
    PRINT 'Table exit_audit_trail created successfully.';
END
ELSE
BEGIN
    PRINT 'Table exit_audit_trail already exists.';
END

-- Add Foreign Key Constraints
PRINT 'Adding Foreign Key Constraints...';

-- Exit Bodies Foreign Keys
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_EB_Body_Details')
BEGIN
    ALTER TABLE exit_bodies ADD CONSTRAINT FK_EB_Body_Details 
    FOREIGN KEY (EB_Body_Details_FK) REFERENCES body_details(BD_Id_pk);
    PRINT 'Foreign Key FK_EB_Body_Details added successfully.';
END
ELSE
BEGIN
    PRINT 'Foreign Key FK_EB_Body_Details already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_EB_Exit_Type')
BEGIN
    ALTER TABLE exit_bodies ADD CONSTRAINT FK_EB_Exit_Type 
    FOREIGN KEY (EB_Exit_Type_FK) REFERENCES exit_type_lookup(ETL_Id_pk);
    PRINT 'Foreign Key FK_EB_Exit_Type added successfully.';
END
ELSE
BEGIN
    PRINT 'Foreign Key FK_EB_Exit_Type already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_EB_Exit_Status')
BEGIN
    ALTER TABLE exit_bodies ADD CONSTRAINT FK_EB_Exit_Status 
    FOREIGN KEY (EB_Exit_Status_FK) REFERENCES exit_status_lookup(ESL_Id_pk);
    PRINT 'Foreign Key FK_EB_Exit_Status added successfully.';
END
ELSE
BEGIN
    PRINT 'Foreign Key FK_EB_Exit_Status already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_EB_Exit_Authorization_Level')
BEGIN
    ALTER TABLE exit_bodies ADD CONSTRAINT FK_EB_Exit_Authorization_Level 
    FOREIGN KEY (EB_Exit_Authorization_Level_FK) REFERENCES exit_authorization_level_lookup(EAL_Id_pk);
    PRINT 'Foreign Key FK_EB_Exit_Authorization_Level added successfully.';
END
ELSE
BEGIN
    PRINT 'Foreign Key FK_EB_Exit_Authorization_Level already exists.';
END

-- Exit Receivers Foreign Keys
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ER_Exit_Bodies')
BEGIN
    ALTER TABLE exit_receivers ADD CONSTRAINT FK_ER_Exit_Bodies 
    FOREIGN KEY (ER_Exit_Bodies_FK) REFERENCES exit_bodies(EB_Id_pk);
    PRINT 'Foreign Key FK_ER_Exit_Bodies added successfully.';
END
ELSE
BEGIN
    PRINT 'Foreign Key FK_ER_Exit_Bodies already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ER_Receiver_Type')
BEGIN
    ALTER TABLE exit_receivers ADD CONSTRAINT FK_ER_Receiver_Type 
    FOREIGN KEY (ER_Receiver_Type_FK) REFERENCES receiver_type_lookup(RTL_Id_pk);
    PRINT 'Foreign Key FK_ER_Receiver_Type added successfully.';
END
ELSE
BEGIN
    PRINT 'Foreign Key FK_ER_Receiver_Type already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ER_Relationship')
BEGIN
    ALTER TABLE exit_receivers ADD CONSTRAINT FK_ER_Relationship 
    FOREIGN KEY (ER_Relationship_FK) REFERENCES relationship_lookup(RLL_Id_pk);
    PRINT 'Foreign Key FK_ER_Relationship added successfully.';
END
ELSE
BEGIN
    PRINT 'Foreign Key FK_ER_Relationship already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ER_ID_Proof_Type')
BEGIN
    ALTER TABLE exit_receivers ADD CONSTRAINT FK_ER_ID_Proof_Type 
    FOREIGN KEY (ER_ID_Proof_Type_FK) REFERENCES id_proof_type_lookup(IDL_Id_pk);
    PRINT 'Foreign Key FK_ER_ID_Proof_Type added successfully.';
END
ELSE
BEGIN
    PRINT 'Foreign Key FK_ER_ID_Proof_Type already exists.';
END

-- Exit Documents Foreign Keys
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ED_Exit_Bodies')
BEGIN
    ALTER TABLE exit_documents ADD CONSTRAINT FK_ED_Exit_Bodies 
    FOREIGN KEY (ED_Exit_Bodies_FK) REFERENCES exit_bodies(EB_Id_pk);
    PRINT 'Foreign Key FK_ED_Exit_Bodies added successfully.';
END
ELSE
BEGIN
    PRINT 'Foreign Key FK_ED_Exit_Bodies already exists.';
END

-- Exit Clearances Foreign Keys
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_EC_Exit_Bodies')
BEGIN
    ALTER TABLE exit_clearances ADD CONSTRAINT FK_EC_Exit_Bodies 
    FOREIGN KEY (EC_Exit_Bodies_FK) REFERENCES exit_bodies(EB_Id_pk);
    PRINT 'Foreign Key FK_EC_Exit_Bodies added successfully.';
END
ELSE
BEGIN
    PRINT 'Foreign Key FK_EC_Exit_Bodies already exists.';
END

-- Exit Witnesses Foreign Keys
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_EW_Exit_Bodies')
BEGIN
    ALTER TABLE exit_witnesses ADD CONSTRAINT FK_EW_Exit_Bodies 
    FOREIGN KEY (EW_Exit_Bodies_FK) REFERENCES exit_bodies(EB_Id_pk);
    PRINT 'Foreign Key FK_EW_Exit_Bodies added successfully.';
END
ELSE
BEGIN
    PRINT 'Foreign Key FK_EW_Exit_Bodies already exists.';
END

-- Exit Handover Items Foreign Keys
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_EHI_Exit_Bodies')
BEGIN
    ALTER TABLE exit_handover_items ADD CONSTRAINT FK_EHI_Exit_Bodies 
    FOREIGN KEY (EHI_Exit_Bodies_FK) REFERENCES exit_bodies(EB_Id_pk);
    PRINT 'Foreign Key FK_EHI_Exit_Bodies added successfully.';
END
ELSE
BEGIN
    PRINT 'Foreign Key FK_EHI_Exit_Bodies already exists.';
END

-- Exit Audit Trail Foreign Keys
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_EAT_Exit_Bodies')
BEGIN
    ALTER TABLE exit_audit_trail ADD CONSTRAINT FK_EAT_Exit_Bodies 
    FOREIGN KEY (EAT_Exit_Bodies_FK) REFERENCES exit_bodies(EB_Id_pk);
    PRINT 'Foreign Key FK_EAT_Exit_Bodies added successfully.';
END
ELSE
BEGIN
    PRINT 'Foreign Key FK_EAT_Exit_Bodies already exists.';
END

-- Create Indexes for better performance
PRINT 'Creating Indexes...';

-- Exit Bodies Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EB_Body_Details_FK')
BEGIN
    CREATE INDEX IX_EB_Body_Details_FK ON exit_bodies(EB_Body_Details_FK);
    PRINT 'Index IX_EB_Body_Details_FK created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_EB_Body_Details_FK already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EB_Exit_Type_FK')
BEGIN
    CREATE INDEX IX_EB_Exit_Type_FK ON exit_bodies(EB_Exit_Type_FK);
    PRINT 'Index IX_EB_Exit_Type_FK created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_EB_Exit_Type_FK already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EB_Exit_Status_FK')
BEGIN
    CREATE INDEX IX_EB_Exit_Status_FK ON exit_bodies(EB_Exit_Status_FK);
    PRINT 'Index IX_EB_Exit_Status_FK created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_EB_Exit_Status_FK already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EB_Exit_Date')
BEGIN
    CREATE INDEX IX_EB_Exit_Date ON exit_bodies(EB_Exit_Date);
    PRINT 'Index IX_EB_Exit_Date created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_EB_Exit_Date already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EB_Status')
BEGIN
    CREATE INDEX IX_EB_Status ON exit_bodies(EB_Status);
    PRINT 'Index IX_EB_Status created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_EB_Status already exists.';
END

-- Exit Receivers Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ER_Exit_Bodies_FK')
BEGIN
    CREATE INDEX IX_ER_Exit_Bodies_FK ON exit_receivers(ER_Exit_Bodies_FK);
    PRINT 'Index IX_ER_Exit_Bodies_FK created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_ER_Exit_Bodies_FK already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ER_Receiver_Type_FK')
BEGIN
    CREATE INDEX IX_ER_Receiver_Type_FK ON exit_receivers(ER_Receiver_Type_FK);
    PRINT 'Index IX_ER_Receiver_Type_FK created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_ER_Receiver_Type_FK already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ER_Is_Primary_Receiver')
BEGIN
    CREATE INDEX IX_ER_Is_Primary_Receiver ON exit_receivers(ER_Is_Primary_Receiver);
    PRINT 'Index IX_ER_Is_Primary_Receiver created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_ER_Is_Primary_Receiver already exists.';
END

-- Exit Documents Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ED_Exit_Bodies_FK')
BEGIN
    CREATE INDEX IX_ED_Exit_Bodies_FK ON exit_documents(ED_Exit_Bodies_FK);
    PRINT 'Index IX_ED_Exit_Bodies_FK created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_ED_Exit_Bodies_FK already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ED_Document_Type')
BEGIN
    CREATE INDEX IX_ED_Document_Type ON exit_documents(ED_Document_Type);
    PRINT 'Index IX_ED_Document_Type created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_ED_Document_Type already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ED_Is_Received')
BEGIN
    CREATE INDEX IX_ED_Is_Received ON exit_documents(ED_Is_Received);
    PRINT 'Index IX_ED_Is_Received created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_ED_Is_Received already exists.';
END

-- Exit Clearances Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EC_Exit_Bodies_FK')
BEGIN
    CREATE INDEX IX_EC_Exit_Bodies_FK ON exit_clearances(EC_Exit_Bodies_FK);
    PRINT 'Index IX_EC_Exit_Bodies_FK created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_EC_Exit_Bodies_FK already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EC_Clearance_Type')
BEGIN
    CREATE INDEX IX_EC_Clearance_Type ON exit_clearances(EC_Clearance_Type);
    PRINT 'Index IX_EC_Clearance_Type created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_EC_Clearance_Type already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EC_Clearance_Status')
BEGIN
    CREATE INDEX IX_EC_Clearance_Status ON exit_clearances(EC_Clearance_Status);
    PRINT 'Index IX_EC_Clearance_Status created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_EC_Clearance_Status already exists.';
END

-- Exit Witnesses Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EW_Exit_Bodies_FK')
BEGIN
    CREATE INDEX IX_EW_Exit_Bodies_FK ON exit_witnesses(EW_Exit_Bodies_FK);
    PRINT 'Index IX_EW_Exit_Bodies_FK created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_EW_Exit_Bodies_FK already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EW_Witness_Type')
BEGIN
    CREATE INDEX IX_EW_Witness_Type ON exit_witnesses(EW_Witness_Type);
    PRINT 'Index IX_EW_Witness_Type created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_EW_Witness_Type already exists.';
END

-- Exit Handover Items Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EHI_Exit_Bodies_FK')
BEGIN
    CREATE INDEX IX_EHI_Exit_Bodies_FK ON exit_handover_items(EHI_Exit_Bodies_FK);
    PRINT 'Index IX_EHI_Exit_Bodies_FK created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_EHI_Exit_Bodies_FK already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EHI_Item_Category')
BEGIN
    CREATE INDEX IX_EHI_Item_Category ON exit_handover_items(EHI_Item_Category);
    PRINT 'Index IX_EHI_Item_Category created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_EHI_Item_Category already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EHI_Is_Handed_Over')
BEGIN
    CREATE INDEX IX_EHI_Is_Handed_Over ON exit_handover_items(EHI_Is_Handed_Over);
    PRINT 'Index IX_EHI_Is_Handed_Over created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_EHI_Is_Handed_Over already exists.';
END

-- Exit Audit Trail Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EAT_Exit_Bodies_FK')
BEGIN
    CREATE INDEX IX_EAT_Exit_Bodies_FK ON exit_audit_trail(EAT_Exit_Bodies_FK);
    PRINT 'Index IX_EAT_Exit_Bodies_FK created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_EAT_Exit_Bodies_FK already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EAT_Action_Type')
BEGIN
    CREATE INDEX IX_EAT_Action_Type ON exit_audit_trail(EAT_Action_Type);
    PRINT 'Index IX_EAT_Action_Type created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_EAT_Action_Type already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EAT_Action_Date')
BEGIN
    CREATE INDEX IX_EAT_Action_Date ON exit_audit_trail(EAT_Action_Date);
    PRINT 'Index IX_EAT_Action_Date created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_EAT_Action_Date already exists.';
END

-- Insert sample data for lookup tables
PRINT 'Inserting sample data...';

-- Exit Type Lookup Data
IF NOT EXISTS (SELECT * FROM exit_type_lookup WHERE ETL_Type_Name = 'Family Release')
BEGIN
    INSERT INTO exit_type_lookup (ETL_Type_Name, ETL_Description, ETL_Requires_Verification, ETL_Requires_NOC, ETL_Requires_Authorization, ETL_Added_by, ETL_Provider_fk)
    VALUES ('Family Release', 'Standard release to family members', 1, 1, 0, 'System', 1);
    PRINT 'Inserted Family Release exit type.';
END

IF NOT EXISTS (SELECT * FROM exit_type_lookup WHERE ETL_Type_Name = 'Police Handover')
BEGIN
    INSERT INTO exit_type_lookup (ETL_Type_Name, ETL_Description, ETL_Requires_Verification, ETL_Requires_NOC, ETL_Requires_Authorization, ETL_Added_by, ETL_Provider_fk)
    VALUES ('Police Handover', 'Release to police authorities', 1, 1, 1, 'System', 1);
    PRINT 'Inserted Police Handover exit type.';
END

IF NOT EXISTS (SELECT * FROM exit_type_lookup WHERE ETL_Type_Name = 'Medical Transfer')
BEGIN
    INSERT INTO exit_type_lookup (ETL_Type_Name, ETL_Description, ETL_Requires_Verification, ETL_Requires_NOC, ETL_Requires_Authorization, ETL_Added_by, ETL_Provider_fk)
    VALUES ('Medical Transfer', 'Transfer to another medical facility', 1, 1, 0, 'System', 1);
    PRINT 'Inserted Medical Transfer exit type.';
END

IF NOT EXISTS (SELECT * FROM exit_type_lookup WHERE ETL_Type_Name = 'Cremation')
BEGIN
    INSERT INTO exit_type_lookup (ETL_Type_Name, ETL_Description, ETL_Requires_Verification, ETL_Requires_NOC, ETL_Requires_Authorization, ETL_Added_by, ETL_Provider_fk)
    VALUES ('Cremation', 'Direct cremation without family', 1, 1, 1, 'System', 1);
    PRINT 'Inserted Cremation exit type.';
END

IF NOT EXISTS (SELECT * FROM exit_type_lookup WHERE ETL_Type_Name = 'Burial')
BEGIN
    INSERT INTO exit_type_lookup (ETL_Type_Name, ETL_Description, ETL_Requires_Verification, ETL_Requires_NOC, ETL_Requires_Authorization, ETL_Added_by, ETL_Provider_fk)
    VALUES ('Burial', 'Direct burial without family', 1, 1, 1, 'System', 1);
    PRINT 'Inserted Burial exit type.';
END

-- Exit Status Lookup Data
IF NOT EXISTS (SELECT * FROM exit_status_lookup WHERE ESL_Status_Name = 'Pending')
BEGIN
    INSERT INTO exit_status_lookup (ESL_Status_Name, ESL_Description, ESL_Is_Active, ESL_Color_Code, ESL_Added_by, ESL_Provider_fk)
    VALUES ('Pending', 'Exit request submitted, awaiting processing', 1, '#FFA500', 'System', 1);
    PRINT 'Inserted Pending status.';
END

IF NOT EXISTS (SELECT * FROM exit_status_lookup WHERE ESL_Status_Name = 'Under Review')
BEGIN
    INSERT INTO exit_status_lookup (ESL_Status_Name, ESL_Description, ESL_Is_Active, ESL_Color_Code, ESL_Added_by, ESL_Provider_fk)
    VALUES ('Under Review', 'Exit request under administrative review', 1, '#FFD700', 'System', 1);
    PRINT 'Inserted Under Review status.';
END

IF NOT EXISTS (SELECT * FROM exit_status_lookup WHERE ESL_Status_Name = 'Approved')
BEGIN
    INSERT INTO exit_status_lookup (ESL_Status_Name, ESL_Description, ESL_Is_Active, ESL_Color_Code, ESL_Added_by, ESL_Provider_fk)
    VALUES ('Approved', 'Exit request approved, ready for release', 1, '#32CD32', 'System', 1);
    PRINT 'Inserted Approved status.';
END

IF NOT EXISTS (SELECT * FROM exit_status_lookup WHERE ESL_Status_Name = 'Rejected')
BEGIN
    INSERT INTO exit_status_lookup (ESL_Status_Name, ESL_Description, ESL_Is_Active, ESL_Color_Code, ESL_Added_by, ESL_Provider_fk)
    VALUES ('Rejected', 'Exit request rejected', 1, '#FF0000', 'System', 1);
    PRINT 'Inserted Rejected status.';
END

IF NOT EXISTS (SELECT * FROM exit_status_lookup WHERE ESL_Status_Name = 'Completed')
BEGIN
    INSERT INTO exit_status_lookup (ESL_Status_Name, ESL_Description, ESL_Is_Active, ESL_Color_Code, ESL_Added_by, ESL_Provider_fk)
    VALUES ('Completed', 'Body successfully released', 1, '#008000', 'System', 1);
    PRINT 'Inserted Completed status.';
END

IF NOT EXISTS (SELECT * FROM exit_status_lookup WHERE ESL_Status_Name = 'Cancelled')
BEGIN
    INSERT INTO exit_status_lookup (ESL_Status_Name, ESL_Description, ESL_Is_Active, ESL_Color_Code, ESL_Added_by, ESL_Provider_fk)
    VALUES ('Cancelled', 'Exit request cancelled', 1, '#808080', 'System', 1);
    PRINT 'Inserted Cancelled status.';
END

-- Receiver Type Lookup Data
IF NOT EXISTS (SELECT * FROM receiver_type_lookup WHERE RTL_Type_Name = 'Family Member')
BEGIN
    INSERT INTO receiver_type_lookup (RTL_Type_Name, RTL_Description, RTL_Requires_ID_Proof, RTL_Requires_Authorization, RTL_Added_by, RTL_Provider_fk)
    VALUES ('Family Member', 'Immediate family member', 1, 0, 'System', 1);
    PRINT 'Inserted Family Member receiver type.';
END

IF NOT EXISTS (SELECT * FROM receiver_type_lookup WHERE RTL_Type_Name = 'Legal Guardian')
BEGIN
    INSERT INTO receiver_type_lookup (RTL_Type_Name, RTL_Description, RTL_Requires_ID_Proof, RTL_Requires_Authorization, RTL_Added_by, RTL_Provider_fk)
    VALUES ('Legal Guardian', 'Legal guardian or custodian', 1, 1, 'System', 1);
    PRINT 'Inserted Legal Guardian receiver type.';
END

IF NOT EXISTS (SELECT * FROM receiver_type_lookup WHERE RTL_Type_Name = 'Police Officer')
BEGIN
    INSERT INTO receiver_type_lookup (RTL_Type_Name, RTL_Description, RTL_Requires_ID_Proof, RTL_Requires_Authorization, RTL_Added_by, RTL_Provider_fk)
    VALUES ('Police Officer', 'Law enforcement officer', 1, 1, 'System', 1);
    PRINT 'Inserted Police Officer receiver type.';
END

IF NOT EXISTS (SELECT * FROM receiver_type_lookup WHERE RTL_Type_Name = 'Medical Staff')
BEGIN
    INSERT INTO receiver_type_lookup (RTL_Type_Name, RTL_Description, RTL_Requires_ID_Proof, RTL_Requires_Authorization, RTL_Added_by, RTL_Provider_fk)
    VALUES ('Medical Staff', 'Medical professional from another facility', 1, 1, 'System', 1);
    PRINT 'Inserted Medical Staff receiver type.';
END

IF NOT EXISTS (SELECT * FROM receiver_type_lookup WHERE RTL_Type_Name = 'Funeral Director')
BEGIN
    INSERT INTO receiver_type_lookup (RTL_Type_Name, RTL_Description, RTL_Requires_ID_Proof, RTL_Requires_Authorization, RTL_Added_by, RTL_Provider_fk)
    VALUES ('Funeral Director', 'Licensed funeral director', 1, 1, 'System', 1);
    PRINT 'Inserted Funeral Director receiver type.';
END

IF NOT EXISTS (SELECT * FROM receiver_type_lookup WHERE RTL_Type_Name = 'Authorized Representative')
BEGIN
    INSERT INTO receiver_type_lookup (RTL_Type_Name, RTL_Description, RTL_Requires_ID_Proof, RTL_Requires_Authorization, RTL_Added_by, RTL_Provider_fk)
    VALUES ('Authorized Representative', 'Other authorized representative', 1, 1, 'System', 1);
    PRINT 'Inserted Authorized Representative receiver type.';
END

-- ID Proof Type Lookup Data
IF NOT EXISTS (SELECT * FROM id_proof_type_lookup WHERE IDL_Proof_Name = 'Aadhaar Card')
BEGIN
    INSERT INTO id_proof_type_lookup (IDL_Proof_Name, IDL_Description, IDL_Is_Government_Issued, IDL_Added_by, IDL_Provider_fk)
    VALUES ('Aadhaar Card', 'Indian Aadhaar identification', 1, 'System', 1);
    PRINT 'Inserted Aadhaar Card ID proof type.';
END

IF NOT EXISTS (SELECT * FROM id_proof_type_lookup WHERE IDL_Proof_Name = 'PAN Card')
BEGIN
    INSERT INTO id_proof_type_lookup (IDL_Proof_Name, IDL_Description, IDL_Is_Government_Issued, IDL_Added_by, IDL_Provider_fk)
    VALUES ('PAN Card', 'Permanent Account Number card', 1, 'System', 1);
    PRINT 'Inserted PAN Card ID proof type.';
END

IF NOT EXISTS (SELECT * FROM id_proof_type_lookup WHERE IDL_Proof_Name = 'Driving License')
BEGIN
    INSERT INTO id_proof_type_lookup (IDL_Proof_Name, IDL_Description, IDL_Is_Government_Issued, IDL_Added_by, IDL_Provider_fk)
    VALUES ('Driving License', 'Motor vehicle driving license', 1, 'System', 1);
    PRINT 'Inserted Driving License ID proof type.';
END

IF NOT EXISTS (SELECT * FROM id_proof_type_lookup WHERE IDL_Proof_Name = 'Passport')
BEGIN
    INSERT INTO id_proof_type_lookup (IDL_Proof_Name, IDL_Description, IDL_Is_Government_Issued, IDL_Added_by, IDL_Provider_fk)
    VALUES ('Passport', 'Indian passport', 1, 'System', 1);
    PRINT 'Inserted Passport ID proof type.';
END

IF NOT EXISTS (SELECT * FROM id_proof_type_lookup WHERE IDL_Proof_Name = 'Voter ID')
BEGIN
    INSERT INTO id_proof_type_lookup (IDL_Proof_Name, IDL_Description, IDL_Is_Government_Issued, IDL_Added_by, IDL_Provider_fk)
    VALUES ('Voter ID', 'Voter identification card', 1, 'System', 1);
    PRINT 'Inserted Voter ID proof type.';
END

IF NOT EXISTS (SELECT * FROM id_proof_type_lookup WHERE IDL_Proof_Name = 'Police ID')
BEGIN
    INSERT INTO id_proof_type_lookup (IDL_Proof_Name, IDL_Description, IDL_Is_Government_Issued, IDL_Added_by, IDL_Provider_fk)
    VALUES ('Police ID', 'Police identification card', 1, 'System', 1);
    PRINT 'Inserted Police ID proof type.';
END

IF NOT EXISTS (SELECT * FROM id_proof_type_lookup WHERE IDL_Proof_Name = 'Medical License')
BEGIN
    INSERT INTO id_proof_type_lookup (IDL_Proof_Name, IDL_Description, IDL_Is_Government_Issued, IDL_Added_by, IDL_Provider_fk)
    VALUES ('Medical License', 'Medical practitioner license', 1, 'System', 1);
    PRINT 'Inserted Medical License ID proof type.';
END

IF NOT EXISTS (SELECT * FROM id_proof_type_lookup WHERE IDL_Proof_Name = 'Funeral License')
BEGIN
    INSERT INTO id_proof_type_lookup (IDL_Proof_Name, IDL_Description, IDL_Is_Government_Issued, IDL_Added_by, IDL_Provider_fk)
    VALUES ('Funeral License', 'Funeral director license', 1, 'System', 1);
    PRINT 'Inserted Funeral License ID proof type.';
END

-- Relationship Lookup Data
IF NOT EXISTS (SELECT * FROM relationship_lookup WHERE RLL_Relationship_Name = 'Spouse')
BEGIN
    INSERT INTO relationship_lookup (RLL_Relationship_Name, RLL_Description, RLL_Is_Immediate_Family, RLL_Added_by, RLL_Provider_fk)
    VALUES ('Spouse', 'Husband or wife', 1, 'System', 1);
    PRINT 'Inserted Spouse relationship.';
END

IF NOT EXISTS (SELECT * FROM relationship_lookup WHERE RLL_Relationship_Name = 'Son')
BEGIN
    INSERT INTO relationship_lookup (RLL_Relationship_Name, RLL_Description, RLL_Is_Immediate_Family, RLL_Added_by, RLL_Provider_fk)
    VALUES ('Son', 'Male child', 1, 'System', 1);
    PRINT 'Inserted Son relationship.';
END

IF NOT EXISTS (SELECT * FROM relationship_lookup WHERE RLL_Relationship_Name = 'Daughter')
BEGIN
    INSERT INTO relationship_lookup (RLL_Relationship_Name, RLL_Description, RLL_Is_Immediate_Family, RLL_Added_by, RLL_Provider_fk)
    VALUES ('Daughter', 'Female child', 1, 'System', 1);
    PRINT 'Inserted Daughter relationship.';
END

IF NOT EXISTS (SELECT * FROM relationship_lookup WHERE RLL_Relationship_Name = 'Father')
BEGIN
    INSERT INTO relationship_lookup (RLL_Relationship_Name, RLL_Description, RLL_Is_Immediate_Family, RLL_Added_by, RLL_Provider_fk)
    VALUES ('Father', 'Male parent', 1, 'System', 1);
    PRINT 'Inserted Father relationship.';
END

IF NOT EXISTS (SELECT * FROM relationship_lookup WHERE RLL_Relationship_Name = 'Mother')
BEGIN
    INSERT INTO relationship_lookup (RLL_Relationship_Name, RLL_Description, RLL_Is_Immediate_Family, RLL_Added_by, RLL_Provider_fk)
    VALUES ('Mother', 'Female parent', 1, 'System', 1);
    PRINT 'Inserted Mother relationship.';
END

IF NOT EXISTS (SELECT * FROM relationship_lookup WHERE RLL_Relationship_Name = 'Brother')
BEGIN
    INSERT INTO relationship_lookup (RLL_Relationship_Name, RLL_Description, RLL_Is_Immediate_Family, RLL_Added_by, RLL_Provider_fk)
    VALUES ('Brother', 'Male sibling', 1, 'System', 1);
    PRINT 'Inserted Brother relationship.';
END

IF NOT EXISTS (SELECT * FROM relationship_lookup WHERE RLL_Relationship_Name = 'Sister')
BEGIN
    INSERT INTO relationship_lookup (RLL_Relationship_Name, RLL_Description, RLL_Is_Immediate_Family, RLL_Added_by, RLL_Provider_fk)
    VALUES ('Sister', 'Female sibling', 1, 'System', 1);
    PRINT 'Inserted Sister relationship.';
END

IF NOT EXISTS (SELECT * FROM relationship_lookup WHERE RLL_Relationship_Name = 'Grandfather')
BEGIN
    INSERT INTO relationship_lookup (RLL_Relationship_Name, RLL_Description, RLL_Is_Immediate_Family, RLL_Added_by, RLL_Provider_fk)
    VALUES ('Grandfather', 'Paternal or maternal grandfather', 1, 'System', 1);
    PRINT 'Inserted Grandfather relationship.';
END

IF NOT EXISTS (SELECT * FROM relationship_lookup WHERE RLL_Relationship_Name = 'Grandmother')
BEGIN
    INSERT INTO relationship_lookup (RLL_Relationship_Name, RLL_Description, RLL_Is_Immediate_Family, RLL_Added_by, RLL_Provider_fk)
    VALUES ('Grandmother', 'Paternal or maternal grandmother', 1, 'System', 1);
    PRINT 'Inserted Grandmother relationship.';
END

IF NOT EXISTS (SELECT * FROM relationship_lookup WHERE RLL_Relationship_Name = 'Uncle')
BEGIN
    INSERT INTO relationship_lookup (RLL_Relationship_Name, RLL_Description, RLL_Is_Immediate_Family, RLL_Added_by, RLL_Provider_fk)
    VALUES ('Uncle', 'Paternal or maternal uncle', 0, 'System', 1);
    PRINT 'Inserted Uncle relationship.';
END

IF NOT EXISTS (SELECT * FROM relationship_lookup WHERE RLL_Relationship_Name = 'Aunt')
BEGIN
    INSERT INTO relationship_lookup (RLL_Relationship_Name, RLL_Description, RLL_Is_Immediate_Family, RLL_Added_by, RLL_Provider_fk)
    VALUES ('Aunt', 'Paternal or maternal aunt', 0, 'System', 1);
    PRINT 'Inserted Aunt relationship.';
END

IF NOT EXISTS (SELECT * FROM relationship_lookup WHERE RLL_Relationship_Name = 'Cousin')
BEGIN
    INSERT INTO relationship_lookup (RLL_Relationship_Name, RLL_Description, RLL_Is_Immediate_Family, RLL_Added_by, RLL_Provider_fk)
    VALUES ('Cousin', 'Cousin', 0, 'System', 1);
    PRINT 'Inserted Cousin relationship.';
END

IF NOT EXISTS (SELECT * FROM relationship_lookup WHERE RLL_Relationship_Name = 'Friend')
BEGIN
    INSERT INTO relationship_lookup (RLL_Relationship_Name, RLL_Description, RLL_Is_Immediate_Family, RLL_Added_by, RLL_Provider_fk)
    VALUES ('Friend', 'Family friend', 0, 'System', 1);
    PRINT 'Inserted Friend relationship.';
END

IF NOT EXISTS (SELECT * FROM relationship_lookup WHERE RLL_Relationship_Name = 'Neighbor')
BEGIN
    INSERT INTO relationship_lookup (RLL_Relationship_Name, RLL_Description, RLL_Is_Immediate_Family, RLL_Added_by, RLL_Provider_fk)
    VALUES ('Neighbor', 'Neighbor', 0, 'System', 1);
    PRINT 'Inserted Neighbor relationship.';
END

IF NOT EXISTS (SELECT * FROM relationship_lookup WHERE RLL_Relationship_Name = 'Legal Representative')
BEGIN
    INSERT INTO relationship_lookup (RLL_Relationship_Name, RLL_Description, RLL_Is_Immediate_Family, RLL_Added_by, RLL_Provider_fk)
    VALUES ('Legal Representative', 'Legal representative', 0, 'System', 1);
    PRINT 'Inserted Legal Representative relationship.';
END

-- Exit Authorization Level Lookup Data
IF NOT EXISTS (SELECT * FROM exit_authorization_level_lookup WHERE EAL_Level_Name = 'Staff Level')
BEGIN
    INSERT INTO exit_authorization_level_lookup (EAL_Level_Name, EAL_Description, EAL_Minimum_Rank, EAL_Added_by, EAL_Provider_fk)
    VALUES ('Staff Level', 'Regular staff authorization', 'Staff', 'System', 1);
    PRINT 'Inserted Staff Level authorization.';
END

IF NOT EXISTS (SELECT * FROM exit_authorization_level_lookup WHERE EAL_Level_Name = 'Supervisor Level')
BEGIN
    INSERT INTO exit_authorization_level_lookup (EAL_Level_Name, EAL_Description, EAL_Minimum_Rank, EAL_Added_by, EAL_Provider_fk)
    VALUES ('Supervisor Level', 'Supervisor authorization', 'Supervisor', 'System', 1);
    PRINT 'Inserted Supervisor Level authorization.';
END

IF NOT EXISTS (SELECT * FROM exit_authorization_level_lookup WHERE EAL_Level_Name = 'Manager Level')
BEGIN
    INSERT INTO exit_authorization_level_lookup (EAL_Level_Name, EAL_Description, EAL_Minimum_Rank, EAL_Added_by, EAL_Provider_fk)
    VALUES ('Manager Level', 'Manager authorization', 'Manager', 'System', 1);
    PRINT 'Inserted Manager Level authorization.';
END

IF NOT EXISTS (SELECT * FROM exit_authorization_level_lookup WHERE EAL_Level_Name = 'Medical Director')
BEGIN
    INSERT INTO exit_authorization_level_lookup (EAL_Level_Name, EAL_Description, EAL_Minimum_Rank, EAL_Added_by, EAL_Provider_fk)
    VALUES ('Medical Director', 'Medical director authorization', 'Medical Director', 'System', 1);
    PRINT 'Inserted Medical Director authorization.';
END

IF NOT EXISTS (SELECT * FROM exit_authorization_level_lookup WHERE EAL_Level_Name = 'Hospital Administrator')
BEGIN
    INSERT INTO exit_authorization_level_lookup (EAL_Level_Name, EAL_Description, EAL_Minimum_Rank, EAL_Added_by, EAL_Provider_fk)
    VALUES ('Hospital Administrator', 'Hospital administrator authorization', 'Administrator', 'System', 1);
    PRINT 'Inserted Hospital Administrator authorization.';
END

IF NOT EXISTS (SELECT * FROM exit_authorization_level_lookup WHERE EAL_Level_Name = 'Police Authorization')
BEGIN
    INSERT INTO exit_authorization_level_lookup (EAL_Level_Name, EAL_Description, EAL_Minimum_Rank, EAL_Added_by, EAL_Provider_fk)
    VALUES ('Police Authorization', 'Police department authorization', 'Police Officer', 'System', 1);
    PRINT 'Inserted Police Authorization.';
END

PRINT 'All sample data inserted successfully.';
PRINT 'Exit tables creation completed successfully!'; 