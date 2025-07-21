-- Create the database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'mortuary_db')
BEGIN
  CREATE DATABASE mortuary_db;
END;
GO

USE mortuary_db;
GO

-- Master/Lookup Tables first

CREATE TABLE Patients (
    PT_patientId      VARCHAR(20)   PRIMARY KEY,
    PT_name           VARCHAR(100)  NOT NULL,
    PT_age            INT,
    PT_gender         VARCHAR(10),
    PT_address        VARCHAR(255),
    PT_contactNumber  VARCHAR(20)
);

CREATE TABLE StorageUnits (
    SU_unit_id     VARCHAR(10)   PRIMARY KEY,
    SU_location   VARCHAR(50)
);

CREATE TABLE Discharges (
    DC_dischargeId      VARCHAR(20)   PRIMARY KEY,
    DC_patientId        VARCHAR(20)   NOT NULL,
    DC_dischargeStatus  VARCHAR(20),
    FOREIGN KEY (DC_patientId) REFERENCES Patients(PT_patientId)
);

CREATE TABLE Providers (
    PR_Id_pk   INT           IDENTITY(1,1) PRIMARY KEY,
    PR_name    VARCHAR(100)
);

CREATE TABLE Outlets (
    OT_Id_pk   INT           IDENTITY(1,1) PRIMARY KEY,
    OT_name    VARCHAR(100)
);

-- Main Transactional Tables

CREATE TABLE body_details (
    BD_Id_pk             INT           IDENTITY(1,1) PRIMARY KEY,
    BD_patientId_fk      VARCHAR(20)   FOREIGN KEY REFERENCES Patients(PT_patientId),
    BD_tagNumber         VARCHAR(20),
    BD_name              VARCHAR(100),
    BD_age               INT,
    BD_gender            VARCHAR(10),
    BD_dateOfDeath       DATE,
    BD_timeOfDeath       DATETIME,
    BD_placeOfDeath      VARCHAR(100),
    BD_address           VARCHAR(255),
    BD_contactPerson     VARCHAR(100),
    BD_contactNumber     VARCHAR(20),
    BD_incidentType      VARCHAR(50),
    BD_notes             TEXT,
    BD_belongings        NVARCHAR(MAX), -- For JSON
    BD_accompanyingPersons NVARCHAR(MAX), -- For JSON
    BD_mlcCase           BIT,
    BD_policeInvolved    BIT,
    BD_status            VARCHAR(20),
    BD_storageLocation   VARCHAR(50),
    BD_registeredBy      VARCHAR(100),
    BD_registrationDate  DATETIME,
    BD_storageUnit       VARCHAR(10)   FOREIGN KEY REFERENCES StorageUnits(SU_unit_id),
    BD_riskLevel         VARCHAR(10),
    BD_verifiedBy        VARCHAR(100),
    BD_exitDate          DATETIME,
    BD_receiverName      VARCHAR(100),
    BD_receiverId        VARCHAR(50),
    BD_relationship      VARCHAR(50),
    BD_fromDischarge     BIT,
    BD_dischargeId       VARCHAR(20)   FOREIGN KEY REFERENCES Discharges(DC_dischargeId),
    BD_Added_by          VARCHAR(100),
    BD_Added_on          DATETIME      DEFAULT GETDATE(),
    BD_Modified_by       VARCHAR(100),
    BD_Modified_on       DATETIME,
    BD_Status            VARCHAR(20),
    BD_Provider_fk       INT           FOREIGN KEY REFERENCES Providers(PR_Id_pk),
    BD_Outlet_fk         INT           FOREIGN KEY REFERENCES Outlets(OT_Id_pk)
);

CREATE TABLE storage_unit (
    SU_unit_id           INT           IDENTITY(1,1) PRIMARY KEY,
    SU_unit_number       VARCHAR(10)   UNIQUE,
    SU_status            VARCHAR(20),
    SU_temperature       DECIMAL(4,1),
    SU_body_id           INT           FOREIGN KEY REFERENCES body_details(BD_Id_pk),
    SU_last_maintenance  DATETIME,
    SU_capacity          VARCHAR(20),
    SU_location          VARCHAR(50),
    SU_Added_by          VARCHAR(100),
    SU_Added_on          DATETIME      DEFAULT GETDATE(),
    SU_Modified_by       VARCHAR(100),
    SU_Modified_on       DATETIME,
    SU_Status            VARCHAR(20),
    SU_Provider_fk       INT           FOREIGN KEY REFERENCES Providers(PR_Id_pk),
    SU_Outlet_fk         INT           FOREIGN KEY REFERENCES Outlets(OT_Id_pk)
);

CREATE TABLE body_exit (
    BE_exit_id           INT           IDENTITY(1,1) PRIMARY KEY,
    BE_body_id           INT           NOT NULL FOREIGN KEY REFERENCES body_details(BD_Id_pk),
    BE_receiverName      VARCHAR(100),
    BE_receiverId        VARCHAR(50),
    BE_relationship      VARCHAR(50),
    BE_releaseTime       DATETIME,
    BE_remarks           TEXT,
    BE_exitDate          DATETIME,
    BE_processedBy       VARCHAR(100),
    BE_nocGenerated      BIT,
    BE_Added_by          VARCHAR(100),
    BE_Added_on          DATETIME      DEFAULT GETDATE(),
    BE_Modified_by       VARCHAR(100),
    BE_Modified_on       DATETIME,
    BE_Status            VARCHAR(20),
    BE_Provider_fk       INT           FOREIGN KEY REFERENCES Providers(PR_Id_pk),
    BE_Outlet_fk         INT           FOREIGN KEY REFERENCES Outlets(OT_Id_pk)
);

CREATE TABLE movements (
    MV_movementId    INT           IDENTITY(1,1) PRIMARY KEY,
    MV_bodyId        INT           NOT NULL FOREIGN KEY REFERENCES body_details(BD_Id_pk),
    MV_fromStorage   VARCHAR(10)   FOREIGN KEY REFERENCES StorageUnits(SU_unit_id),
    MV_toStorage     VARCHAR(10)   FOREIGN KEY REFERENCES StorageUnits(SU_unit_id),
    MV_movedBy       VARCHAR(100),
    MV_timestamp     DATETIME      DEFAULT GETDATE()
);

CREATE TABLE accompanying_persons (
    AP_id         INT           IDENTITY(1,1) PRIMARY KEY,
    AP_bodyId     INT           NOT NULL FOREIGN KEY REFERENCES body_details(BD_Id_pk),
    AP_name       VARCHAR(100),
    AP_contact    VARCHAR(20)
);

CREATE TABLE belongings (
    BL_id         INT           IDENTITY(1,1) PRIMARY KEY,
    BL_bodyId     INT           NOT NULL FOREIGN KEY REFERENCES body_details(BD_Id_pk),
    BL_item       VARCHAR(100)
); 