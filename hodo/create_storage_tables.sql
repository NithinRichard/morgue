-- =====================================================
-- MORTUARY MANAGEMENT SYSTEM - STORAGE TABLES
-- =====================================================

-- 1. Storage Unit Types Lookup Table
-- Prefix: SUTL_ (Storage Unit Type Lookup)
CREATE TABLE storage_unit_type_lookup (
    SUTL_ID_PK INT IDENTITY(1,1) PRIMARY KEY,
    SUTL_Type_Name NVARCHAR(50) NOT NULL,
    SUTL_Description NVARCHAR(255),
    SUTL_Capacity INT DEFAULT 1,
    SUTL_Temperature_Range NVARCHAR(50), -- e.g., "2-8°C", "-18°C"
    SUTL_Added_By INT NOT NULL,
    SUTL_Added_On DATETIME2 DEFAULT GETDATE(),
    SUTL_Modified_By INT,
    SUTL_Modified_On DATETIME2,
    SUTL_Status NVARCHAR(20) DEFAULT 'Active',
    SUTL_Provider_FK INT NOT NULL,
    SUTL_Outlet_FK INT
);

-- 2. Storage Location Lookup Table  
-- Prefix: SLL_ (Storage Location Lookup)
CREATE TABLE storage_location_lookup (
    SLL_ID_PK INT IDENTITY(1,1) PRIMARY KEY,
    SLL_Location_Name NVARCHAR(100) NOT NULL,
    SLL_Building NVARCHAR(50),
    SLL_Floor NVARCHAR(20),
    SLL_Wing NVARCHAR(50),
    SLL_Room_Number NVARCHAR(20),
    SLL_Description NVARCHAR(255),
    SLL_Added_By INT NOT NULL,
    SLL_Added_On DATETIME2 DEFAULT GETDATE(),
    SLL_Modified_By INT,
    SLL_Modified_On DATETIME2,
    SLL_Status NVARCHAR(20) DEFAULT 'Active',
    SLL_Provider_FK INT NOT NULL,
    SLL_Outlet_FK INT
);

-- 3. Storage Unit Master Table
-- Prefix: SU_ (Storage Unit)
CREATE TABLE storage_unit_master (
    SU_ID_PK INT IDENTITY(1,1) PRIMARY KEY,
    SU_Unit_Code NVARCHAR(20) NOT NULL UNIQUE, -- e.g., "F-01", "C-15"
    SU_Unit_Name NVARCHAR(100),
    SU_Type_FK INT NOT NULL,
    SU_Location_FK INT NOT NULL,
    SU_Capacity INT DEFAULT 1,
    SU_Current_Occupancy INT DEFAULT 0,
    SU_Temperature DECIMAL(5,2), -- Current temperature
    SU_Humidity DECIMAL(5,2), -- Current humidity %
    SU_Power_Status NVARCHAR(20) DEFAULT 'ON', -- ON/OFF/BACKUP
    SU_Maintenance_Due DATE,
    SU_Last_Cleaned DATETIME2,
    SU_Installation_Date DATE,
    SU_Warranty_Expiry DATE,
    SU_Serial_Number NVARCHAR(50),
    SU_Manufacturer NVARCHAR(100),
    SU_Model NVARCHAR(50),
    SU_Notes NVARCHAR(MAX),
    SU_Added_By INT NOT NULL,
    SU_Added_On DATETIME2 DEFAULT GETDATE(),
    SU_Modified_By INT,
    SU_Modified_On DATETIME2,
    SU_Status NVARCHAR(20) DEFAULT 'Available', -- Available/Occupied/Maintenance/Out_of_Order
    SU_Provider_FK INT NOT NULL,
    SU_Outlet_FK INT,
    
    CONSTRAINT FK_SU_Type FOREIGN KEY (SU_Type_FK) REFERENCES storage_unit_type_lookup(SUTL_ID_PK),
    CONSTRAINT FK_SU_Location FOREIGN KEY (SU_Location_FK) REFERENCES storage_location_lookup(SLL_ID_PK)
);

-- 4. Storage Allocation Table (Links bodies to storage units)
-- Prefix: SA_ (Storage Allocation)
CREATE TABLE storage_allocation (
    SA_ID_PK INT IDENTITY(1,1) PRIMARY KEY,
    SA_Body_FK INT NOT NULL,
    SA_Storage_Unit_FK INT NOT NULL,
    SA_Allocated_Date DATETIME2 DEFAULT GETDATE(),
    SA_Expected_Duration_Days INT, -- Expected storage duration
    SA_Actual_Release_Date DATETIME2,
    SA_Allocation_Type NVARCHAR(30) DEFAULT 'Standard', -- Standard/Emergency/Extended
    SA_Priority_Level NVARCHAR(20) DEFAULT 'Normal', -- High/Normal/Low
    SA_Special_Instructions NVARCHAR(MAX),
    SA_Temperature_Required DECIMAL(5,2),
    SA_Allocated_By INT NOT NULL, -- Staff who allocated
    SA_Released_By INT, -- Staff who released
    SA_Notes NVARCHAR(MAX),
    SA_Added_By INT NOT NULL,
    SA_Added_On DATETIME2 DEFAULT GETDATE(),
    SA_Modified_By INT,
    SA_Modified_On DATETIME2,
    SA_Status NVARCHAR(20) DEFAULT 'Active', -- Active/Released/Transferred
    SA_Provider_FK INT NOT NULL,
    SA_Outlet_FK INT,
    
    CONSTRAINT FK_SA_Body FOREIGN KEY (SA_Body_FK) REFERENCES body_details(BD_ID_PK),
    CONSTRAINT FK_SA_Storage_Unit FOREIGN KEY (SA_Storage_Unit_FK) REFERENCES storage_unit_master(SU_ID_PK)
);

-- 5. Storage Transfer History Table
-- Prefix: STH_ (Storage Transfer History)
CREATE TABLE storage_transfer_history (
    STH_ID_PK INT IDENTITY(1,1) PRIMARY KEY,
    STH_Body_FK INT NOT NULL,
    STH_From_Storage_Unit_FK INT,
    STH_To_Storage_Unit_FK INT NOT NULL,
    STH_Transfer_Date DATETIME2 DEFAULT GETDATE(),
    STH_Transfer_Reason NVARCHAR(255),
    STH_Authorized_By INT NOT NULL,
    STH_Performed_By INT NOT NULL,
    STH_Witness_Staff INT,
    STH_Transfer_Notes NVARCHAR(MAX),
    STH_From_Temperature DECIMAL(5,2),
    STH_To_Temperature DECIMAL(5,2),
    STH_Duration_Minutes INT, -- Time taken for transfer
    STH_Added_By INT NOT NULL,
    STH_Added_On DATETIME2 DEFAULT GETDATE(),
    STH_Modified_By INT,
    STH_Modified_On DATETIME2,
    STH_Status NVARCHAR(20) DEFAULT 'Completed',
    STH_Provider_FK INT NOT NULL,
    STH_Outlet_FK INT,
    
    CONSTRAINT FK_STH_Body FOREIGN KEY (STH_Body_FK) REFERENCES body_details(BD_ID_PK),
    CONSTRAINT FK_STH_From_Unit FOREIGN KEY (STH_From_Storage_Unit_FK) REFERENCES storage_unit_master(SU_ID_PK),
    CONSTRAINT FK_STH_To_Unit FOREIGN KEY (STH_To_Storage_Unit_FK) REFERENCES storage_unit_master(SU_ID_PK)
);

-- 6. Storage Maintenance Log Table
-- Prefix: SML_ (Storage Maintenance Log)
CREATE TABLE storage_maintenance_log (
    SML_ID_PK INT IDENTITY(1,1) PRIMARY KEY,
    SML_Storage_Unit_FK INT NOT NULL,
    SML_Maintenance_Type NVARCHAR(50) NOT NULL, -- Cleaning/Repair/Inspection/Calibration
    SML_Scheduled_Date DATE,
    SML_Actual_Date DATETIME2,
    SML_Duration_Minutes INT,
    SML_Performed_By INT NOT NULL,
    SML_Supervisor INT,
    SML_Issues_Found NVARCHAR(MAX),
    SML_Actions_Taken NVARCHAR(MAX),
    SML_Parts_Replaced NVARCHAR(MAX),
    SML_Cost DECIMAL(10,2),
    SML_Next_Due_Date DATE,
    SML_Maintenance_Notes NVARCHAR(MAX),
    SML_Before_Temperature DECIMAL(5,2),
    SML_After_Temperature DECIMAL(5,2),
    SML_Added_By INT NOT NULL,
    SML_Added_On DATETIME2 DEFAULT GETDATE(),
    SML_Modified_By INT,
    SML_Modified_On DATETIME2,
    SML_Status NVARCHAR(20) DEFAULT 'Completed',
    SML_Provider_FK INT NOT NULL,
    SML_Outlet_FK INT,
    
    CONSTRAINT FK_SML_Storage_Unit FOREIGN KEY (SML_Storage_Unit_FK) REFERENCES storage_unit_master(SU_ID_PK)
);

-- 7. Storage Temperature Log Table (for monitoring)
-- Prefix: STL_ (Storage Temperature Log)
CREATE TABLE storage_temperature_log (
    STL_ID_PK INT IDENTITY(1,1) PRIMARY KEY,
    STL_Storage_Unit_FK INT NOT NULL,
    STL_Temperature DECIMAL(5,2) NOT NULL,
    STL_Humidity DECIMAL(5,2),
    STL_Recorded_DateTime DATETIME2 DEFAULT GETDATE(),
    STL_Alert_Level NVARCHAR(20) DEFAULT 'Normal', -- Normal/Warning/Critical
    STL_System_Generated BIT DEFAULT 1, -- 1 for auto, 0 for manual entry
    STL_Recorded_By INT,
    STL_Notes NVARCHAR(255),
    STL_Added_By INT NOT NULL,
    STL_Added_On DATETIME2 DEFAULT GETDATE(),
    STL_Modified_By INT,
    STL_Modified_On DATETIME2,
    STL_Status NVARCHAR(20) DEFAULT 'Active',
    STL_Provider_FK INT NOT NULL,
    STL_Outlet_FK INT,
    
    CONSTRAINT FK_STL_Storage_Unit FOREIGN KEY (STL_Storage_Unit_FK) REFERENCES storage_unit_master(SU_ID_PK)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Storage Unit Master indexes
CREATE INDEX IX_SU_Unit_Code ON storage_unit_master(SU_Unit_Code);
CREATE INDEX IX_SU_Status ON storage_unit_master(SU_Status);
CREATE INDEX IX_SU_Type_FK ON storage_unit_master(SU_Type_FK);
CREATE INDEX IX_SU_Location_FK ON storage_unit_master(SU_Location_FK);

-- Storage Allocation indexes
CREATE INDEX IX_SA_Body_FK ON storage_allocation(SA_Body_FK);
CREATE INDEX IX_SA_Storage_Unit_FK ON storage_allocation(SA_Storage_Unit_FK);
CREATE INDEX IX_SA_Status ON storage_allocation(SA_Status);
CREATE INDEX IX_SA_Allocated_Date ON storage_allocation(SA_Allocated_Date);

-- Storage Transfer History indexes
CREATE INDEX IX_STH_Body_FK ON storage_transfer_history(STH_Body_FK);
CREATE INDEX IX_STH_Transfer_Date ON storage_transfer_history(STH_Transfer_Date);

-- Temperature Log indexes
CREATE INDEX IX_STL_Storage_Unit_FK ON storage_temperature_log(STL_Storage_Unit_FK);
CREATE INDEX IX_STL_Recorded_DateTime ON storage_temperature_log(STL_Recorded_DateTime);
CREATE INDEX IX_STL_Alert_Level ON storage_temperature_log(STL_Alert_Level);

-- =====================================================
-- INITIAL DATA INSERTS
-- =====================================================

-- Insert default storage unit types
INSERT INTO storage_unit_type_lookup (SUTL_Type_Name, SUTL_Description, SUTL_Capacity, SUTL_Temperature_Range, SUTL_Added_By, SUTL_Provider_FK)
VALUES 
    ('Freezer', 'Standard mortuary freezer unit', 1, '-18°C to -20°C', 1, 1),
    ('Cooler', 'Refrigerated cooling unit', 1, '2°C to 8°C', 1, 1),
    ('Multi-Chamber', 'Multi-body storage unit', 4, '-18°C to -20°C', 1, 1),
    ('Viewing Chamber', 'Temperature controlled viewing unit', 1, '2°C to 8°C', 1, 1);

-- Insert default storage locations
INSERT INTO storage_location_lookup (SLL_Location_Name, SLL_Building, SLL_Floor, SLL_Wing, SLL_Added_By, SLL_Provider_FK)
VALUES 
    ('Main Mortuary', 'Hospital Main', 'Basement', 'West Wing', 1, 1),
    ('Emergency Mortuary', 'Hospital Main', 'Ground Floor', 'East Wing', 1, 1),
    ('Overflow Storage', 'Auxiliary Building', 'Ground Floor', 'North Wing', 1, 1);

-- Insert sample storage units
INSERT INTO storage_unit_master (SU_Unit_Code, SU_Unit_Name, SU_Type_FK, SU_Location_FK, SU_Added_By, SU_Provider_FK)
VALUES 
    ('F-01', 'Freezer Unit 01', 1, 1, 1, 1),
    ('F-02', 'Freezer Unit 02', 1, 1, 1, 1),
    ('F-03', 'Freezer Unit 03', 1, 1, 1, 1),
    ('C-01', 'Cooler Unit 01', 2, 1, 1, 1),
    ('C-02', 'Cooler Unit 02', 2, 1, 1, 1),
    ('M-01', 'Multi-Chamber Unit 01', 3, 1, 1, 1),
    ('V-01', 'Viewing Chamber 01', 4, 1, 1, 1);
