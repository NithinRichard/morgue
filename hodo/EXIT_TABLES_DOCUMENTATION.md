# Exit Bodies Tables Documentation

## Overview
This document describes the comprehensive table structure for managing exit bodies in the mortuary management system. All tables follow the specified naming conventions and include the required standard fields.

## Table Naming Conventions
- **Master/Lookup Tables**: End with `_lookup` (e.g., `exit_type_lookup`)
- **Column Prefixes**: Use meaningful prefixes to identify the table (e.g., `ETL_` for Exit Type Lookup)
- **Table Names**: Use underscores to separate words (e.g., `exit_bodies`)

## Standard Fields
All tables include the following standard fields:
- `Id_pk`: Primary key (auto-increment)
- `Added_by`: User who created the record
- `Added_on`: Creation timestamp
- `Modified_by`: User who last modified the record
- `Modified_on`: Last modification timestamp
- `Status`: Record status (Active/Inactive/Deleted)
- `Provider_fk`: Foreign key to provider
- `Outlet_fk`: Foreign key to outlet (optional)

## Table Structure

### 1. Lookup Tables (Master Data)

#### 1.1 exit_type_lookup (ETL_)
**Purpose**: Defines different types of body exits
**Key Fields**:
- `ETL_Type_Name`: Exit type name (Family Release, Police Handover, etc.)
- `ETL_Requires_Verification`: Whether verification is required
- `ETL_Requires_NOC`: Whether NOC is required
- `ETL_Requires_Authorization`: Whether special authorization is needed

#### 1.2 exit_status_lookup (ESL_)
**Purpose**: Defines possible exit statuses
**Key Fields**:
- `ESL_Status_Name`: Status name (Pending, Approved, Completed, etc.)
- `ESL_Color_Code`: Color code for UI display
- `ESL_Is_Active`: Whether this status is currently active

#### 1.3 receiver_type_lookup (RTL_)
**Purpose**: Defines types of body receivers
**Key Fields**:
- `RTL_Type_Name`: Receiver type (Family Member, Police Officer, etc.)
- `RTL_Requires_ID_Proof`: Whether ID proof is required
- `RTL_Requires_Authorization`: Whether authorization is required

#### 1.4 id_proof_type_lookup (IDL_)
**Purpose**: Defines acceptable ID proof types
**Key Fields**:
- `IDL_Proof_Name`: ID proof name (Aadhaar Card, PAN Card, etc.)
- `IDL_Is_Government_Issued`: Whether it's government-issued

#### 1.5 relationship_lookup (RLL_)
**Purpose**: Defines relationships to the deceased
**Key Fields**:
- `RLL_Relationship_Name`: Relationship name (Spouse, Son, Father, etc.)
- `RLL_Is_Immediate_Family`: Whether it's immediate family

#### 1.6 exit_authorization_level_lookup (EAL_)
**Purpose**: Defines authorization levels for exits
**Key Fields**:
- `EAL_Level_Name`: Authorization level name
- `EAL_Minimum_Rank`: Minimum rank required for this level

### 2. Main Transactional Tables

#### 2.1 exit_bodies (EB_)
**Purpose**: Main table for exit body records
**Key Relationships**:
- `EB_Body_Details_FK`: Links to `body_details` table
- `EB_Exit_Type_FK`: Links to `exit_type_lookup`
- `EB_Exit_Status_FK`: Links to `exit_status_lookup`
- `EB_Exit_Authorization_Level_FK`: Links to `exit_authorization_level_lookup`

**Key Fields**:
- `EB_Exit_Date`: Date of exit request
- `EB_Exit_Time`: Time of exit
- `EB_Expected_Exit_Date`: Expected exit date
- `EB_Actual_Exit_Date`: Actual exit date
- `EB_Exit_Reason`: Reason for exit
- `EB_Medical_Clearance_Obtained`: Medical clearance status
- `EB_Police_Clearance_Obtained`: Police clearance status
- `EB_Administrative_Clearance_Obtained`: Administrative clearance status
- `EB_Financial_Clearance_Obtained`: Financial clearance status
- `EB_All_Documents_Complete`: All documents complete flag
- `EB_Exit_Authorized_By`: Person who authorized the exit
- `EB_Exit_Processed_By`: Person who processed the exit

#### 2.2 exit_receivers (ER_)
**Purpose**: Stores information about body receivers
**Key Relationships**:
- `ER_Exit_Bodies_FK`: Links to `exit_bodies`
- `ER_Receiver_Type_FK`: Links to `receiver_type_lookup`
- `ER_Relationship_FK`: Links to `relationship_lookup`
- `ER_ID_Proof_Type_FK`: Links to `id_proof_type_lookup`

**Key Fields**:
- `ER_Receiver_Name`: Name of the receiver
- `ER_Receiver_Contact_Number`: Contact number
- `ER_Receiver_Email`: Email address
- `ER_Receiver_Address`: Address
- `ER_ID_Proof_Number`: ID proof number
- `ER_ID_Proof_Issued_By`: ID proof issuing authority
- `ER_Is_Primary_Receiver`: Whether this is the primary receiver

#### 2.3 exit_documents (ED_)
**Purpose**: Tracks documents required and received for exit
**Key Relationships**:
- `ED_Exit_Bodies_FK`: Links to `exit_bodies`

**Key Fields**:
- `ED_Document_Type`: Type of document
- `ED_Document_Name`: Name of the document
- `ED_Document_Number`: Document number
- `ED_Document_Date`: Document date
- `ED_Document_Issued_By`: Document issuing authority
- `ED_Document_File_Path`: File path for uploaded document
- `ED_Is_Required`: Whether document is required
- `ED_Is_Received`: Whether document has been received
- `ED_Received_Date`: Date document was received
- `ED_Received_By`: Person who received the document

#### 2.4 exit_clearances (EC_)
**Purpose**: Tracks various clearances required for exit
**Key Relationships**:
- `EC_Exit_Bodies_FK`: Links to `exit_bodies`

**Key Fields**:
- `EC_Clearance_Type`: Type of clearance
- `EC_Clearance_Name`: Name of the clearance
- `EC_Clearance_Status`: Status of clearance
- `EC_Clearance_Date`: Date clearance was obtained
- `EC_Clearance_By`: Person who provided clearance
- `EC_Clearance_Reference_Number`: Reference number
- `EC_Is_Required`: Whether clearance is required
- `EC_Is_Obtained`: Whether clearance has been obtained

#### 2.5 exit_witnesses (EW_)
**Purpose**: Records witnesses present during exit
**Key Relationships**:
- `EW_Exit_Bodies_FK`: Links to `exit_bodies`

**Key Fields**:
- `EW_Witness_Name`: Name of the witness
- `EW_Witness_Designation`: Designation/role
- `EW_Witness_Contact_Number`: Contact number
- `EW_Witness_Email`: Email address
- `EW_Witness_Address`: Address
- `EW_Witness_Type`: Type of witness (Staff, Police, Family Member, etc.)
- `EW_Witness_Signature_File_Path`: Path to signature file

#### 2.6 exit_handover_items (EHI_)
**Purpose**: Tracks items handed over during exit
**Key Relationships**:
- `EHI_Exit_Bodies_FK`: Links to `exit_bodies`

**Key Fields**:
- `EHI_Item_Name`: Name of the item
- `EHI_Item_Description`: Description of the item
- `EHI_Item_Category`: Category (Belongings, Documents, Keys, etc.)
- `EHI_Item_Quantity`: Quantity
- `EHI_Item_Condition`: Condition (Good, Damaged, Missing, etc.)
- `EHI_Item_Value`: Estimated value
- `EHI_Is_Handed_Over`: Whether item has been handed over
- `EHI_Handover_Date`: Date of handover
- `EHI_Handover_To`: Person to whom item was handed over

#### 2.7 exit_audit_trail (EAT_)
**Purpose**: Maintains audit trail of all exit-related activities
**Key Relationships**:
- `EAT_Exit_Bodies_FK`: Links to `exit_bodies`

**Key Fields**:
- `EAT_Action_Type`: Type of action (Created, Updated, Status Changed, etc.)
- `EAT_Action_Description`: Description of the action
- `EAT_Action_By`: Person who performed the action
- `EAT_Action_Date`: Date and time of action
- `EAT_Old_Values`: Previous values (JSON format)
- `EAT_New_Values`: New values (JSON format)
- `EAT_IP_Address`: IP address of the user
- `EAT_User_Agent`: User agent string

## Relationships

### Primary Relationships
1. **exit_bodies** → **body_details**: Each exit record is linked to a body
2. **exit_bodies** → **exit_type_lookup**: Defines the type of exit
3. **exit_bodies** → **exit_status_lookup**: Tracks the current status
4. **exit_receivers** → **exit_bodies**: Multiple receivers per exit
5. **exit_documents** → **exit_bodies**: Multiple documents per exit
6. **exit_clearances** → **exit_bodies**: Multiple clearances per exit
7. **exit_witnesses** → **exit_bodies**: Multiple witnesses per exit
8. **exit_handover_items** → **exit_bodies**: Multiple items per exit
9. **exit_audit_trail** → **exit_bodies**: Complete audit trail

### Lookup Relationships
- All lookup tables provide reference data for the main tables
- Lookup tables are designed to be extensible and maintainable

## Sample Data

The script includes sample data for all lookup tables:
- **Exit Types**: Family Release, Police Handover, Medical Transfer, Cremation, Burial
- **Exit Statuses**: Pending, Under Review, Approved, Rejected, Completed, Cancelled
- **Receiver Types**: Family Member, Legal Guardian, Police Officer, Medical Staff, Funeral Director, Authorized Representative
- **ID Proof Types**: Aadhaar Card, PAN Card, Driving License, Passport, Voter ID, Police ID, Medical License, Funeral License
- **Relationships**: Spouse, Son, Daughter, Father, Mother, Brother, Sister, Grandfather, Grandmother, Uncle, Aunt, Cousin, Friend, Neighbor, Legal Representative
- **Authorization Levels**: Staff Level, Supervisor Level, Manager Level, Medical Director, Hospital Administrator, Police Authorization

## Indexes

Performance indexes have been created on:
- Foreign key columns for faster joins
- Date columns for efficient date-based queries
- Status columns for filtering
- Frequently queried columns

## Usage Guidelines

### 1. Creating an Exit Record
1. Insert into `exit_bodies` with basic exit information
2. Add receivers in `exit_receivers`
3. Add required documents in `exit_documents`
4. Add required clearances in `exit_clearances`
5. Add witnesses in `exit_witnesses`
6. Add handover items in `exit_handover_items`

### 2. Updating Exit Status
1. Update status in `exit_bodies`
2. Record the change in `exit_audit_trail`

### 3. Document Management
1. Mark documents as received in `exit_documents`
2. Update clearance status in `exit_clearances`

### 4. Handover Process
1. Mark items as handed over in `exit_handover_items`
2. Update exit status to "Completed" in `exit_bodies`
3. Record completion in `exit_audit_trail`

## Security Considerations

1. **Audit Trail**: All changes are tracked in `exit_audit_trail`
2. **Authorization Levels**: Different authorization levels for different exit types
3. **Document Verification**: Track document receipt and verification
4. **Witness Requirements**: Record witnesses for legal compliance
5. **Clearance Tracking**: Ensure all required clearances are obtained

## Compliance Features

1. **Document Tracking**: Complete document lifecycle management
2. **Clearance Management**: Track all required clearances
3. **Witness Recording**: Legal witness requirements
4. **Audit Trail**: Complete audit trail for compliance
5. **Authorization Levels**: Proper authorization hierarchy
6. **Status Management**: Clear status progression tracking 