// Base interface for all entities
export interface BaseEntity {
  Added_by: string;
  Added_on: string;
  Modified_by?: string;
  Modified_on?: string;
  Status: string;
  Provider_fk: number;
  Outlet_fk?: number;
}

// Lookup table interfaces
export interface ExitType extends BaseEntity {
  ETL_Id_pk: number;
  ETL_Type_Name: string;
  ETL_Description?: string;
  ETL_Requires_Verification: boolean;
  ETL_Requires_NOC: boolean;
  ETL_Requires_Authorization: boolean;
}

export interface ExitStatus extends BaseEntity {
  ESL_Id_pk: number;
  ESL_Status_Name: string;
  ESL_Description?: string;
  ESL_Is_Active: boolean;
  ESL_Color_Code?: string;
}

export interface ReceiverType extends BaseEntity {
  RTL_Id_pk: number;
  RTL_Type_Name: string;
  RTL_Description?: string;
  RTL_Requires_ID_Proof: boolean;
  RTL_Requires_Authorization: boolean;
}

export interface IdProofType extends BaseEntity {
  IDL_Id_pk: number;
  IDL_Proof_Name: string;
  IDL_Description?: string;
  IDL_Is_Government_Issued: boolean;
}

export interface Relationship extends BaseEntity {
  RLL_Id_pk: number;
  RLL_Relationship_Name: string;
  RLL_Description?: string;
  RLL_Is_Immediate_Family: boolean;
}

export interface AuthorizationLevel extends BaseEntity {
  EAL_Id_pk: number;
  EAL_Level_Name: string;
  EAL_Description?: string;
  EAL_Minimum_Rank?: number;
}

// Main exit body interface
export interface ExitBody extends BaseEntity {
  EB_Id_pk: number;
  EB_Body_Details_FK: number;
  EB_Exit_Type_FK: number;
  EB_Exit_Status_FK: number;
  EB_Exit_Date: string;
  EB_Exit_Time: string;
  EB_Expected_Exit_Date?: string;
  EB_Actual_Exit_Date?: string;
  EB_Exit_Reason?: string;
  EB_Medical_Clearance_Obtained?: boolean;
  EB_Police_Clearance_Obtained?: boolean;
  EB_Administrative_Clearance_Obtained?: boolean;
  EB_Financial_Clearance_Obtained?: boolean;
  EB_All_Documents_Complete?: boolean;
  EB_Exit_Authorized_By?: string;
  EB_Exit_Authorization_Level_FK?: number;
  EB_Exit_Authorization_Date?: string;
  EB_Exit_Processed_By?: string;
  EB_Exit_Notes?: string;
  
  // Joined data from related tables
  BodyName?: string;
  BodyAge?: number;
  BodyGender?: string;
  ExitTypeName?: string;
  ExitStatusName?: string;
  AuthorizationLevelName?: string;
}

// Exit receiver interface
export interface ExitReceiver extends BaseEntity {
  ER_Id_pk: number;
  ER_Exit_Bodies_FK: number;
  ER_Receiver_Type_FK: number;
  ER_Receiver_Name: string;
  ER_Receiver_Contact: string;
  ER_Relationship_FK: number;
  ER_ID_Proof_Type_FK: number;
  ER_ID_Proof_Number: string;
  ER_Is_Primary_Receiver: boolean;
  ER_Receiver_Address?: string;
  ER_Emergency_Contact?: string;
  ER_Notes?: string;
}

// Exit document interface
export interface ExitDocument extends BaseEntity {
  ED_Id_pk: number;
  ED_Exit_Bodies_FK: number;
  ED_Document_Type: string;
  ED_Document_Number?: string;
  ED_Document_Date?: string;
  ED_Issuing_Authority?: string;
  ED_Is_Received: boolean;
  ED_Received_Date?: string;
  ED_Document_Notes?: string;
}

// Exit clearance interface
export interface ExitClearance extends BaseEntity {
  EC_Id_pk: number;
  EC_Exit_Bodies_FK: number;
  EC_Clearance_Type: string;
  EC_Clearance_Status: string;
  EC_Issuing_Authority?: string;
  EC_Issued_Date?: string;
  EC_Expiry_Date?: string;
  EC_Clearance_Number?: string;
  EC_Notes?: string;
}

// Exit witness interface
export interface ExitWitness extends BaseEntity {
  EW_Id_pk: number;
  EW_Exit_Bodies_FK: number;
  EW_Witness_Name: string;
  EW_Witness_Type: string;
  EW_Witness_Contact?: string;
  EW_Witness_ID_Number?: string;
  EW_Witness_Address?: string;
  EW_Notes?: string;
}

// Exit handover item interface
export interface ExitHandoverItem extends BaseEntity {
  EHI_Id_pk: number;
  EHI_Exit_Bodies_FK: number;
  EHI_Item_Category: string;
  EHI_Item_Name: string;
  EHI_Item_Description?: string;
  EHI_Item_Quantity?: number;
  EHI_Is_Handed_Over: boolean;
  EHI_Handover_Date?: string;
  EHI_Received_By?: string;
  EHI_Notes?: string;
}

// Exit audit trail interface
export interface ExitAuditTrail extends BaseEntity {
  EAT_Id_pk: number;
  EAT_Exit_Bodies_FK: number;
  EAT_Action_Type: string;
  EAT_Action_Description: string;
  EAT_Action_Date: string;
  EAT_Performed_By: string;
  EAT_Old_Values?: string;
  EAT_New_Values?: string;
  EAT_IP_Address?: string;
  EAT_User_Agent?: string;
}

// Form data interfaces for creating/updating records
export interface CreateExitBodyData {
  EB_Body_Details_FK: number;
  EB_Exit_Type_FK: number;
  EB_Exit_Status_FK: number;
  EB_Exit_Date: string;
  EB_Exit_Time: string;
  EB_Expected_Exit_Date?: string;
  EB_Actual_Exit_Date?: string;
  EB_Exit_Reason?: string;
  EB_Medical_Clearance_Obtained?: boolean;
  EB_Police_Clearance_Obtained?: boolean;
  EB_Administrative_Clearance_Obtained?: boolean;
  EB_Financial_Clearance_Obtained?: boolean;
  EB_All_Documents_Complete?: boolean;
  EB_Exit_Authorized_By?: string;
  EB_Exit_Authorization_Level_FK?: number;
  EB_Exit_Authorization_Date?: string;
  EB_Exit_Processed_By?: string;
  EB_Exit_Notes?: string;
  EB_Added_by: string;
  EB_Provider_fk: number;
  EB_Outlet_fk?: number;
}

export interface CreateExitReceiverData {
  ER_Exit_Bodies_FK: number;
  ER_Receiver_Type_FK: number;
  ER_Receiver_Name: string;
  ER_Receiver_Contact: string;
  ER_Relationship_FK: number;
  ER_ID_Proof_Type_FK: number;
  ER_ID_Proof_Number: string;
  ER_Is_Primary_Receiver: boolean;
  ER_Receiver_Address?: string;
  ER_Emergency_Contact?: string;
  ER_Notes?: string;
  ER_Added_by: string;
  ER_Provider_fk: number;
  ER_Outlet_fk?: number;
}

// Complete exit process data
export interface CompleteExitProcessData {
  receivers: CreateExitReceiverData[];
  documents?: Partial<ExitDocument>[];
  clearances?: Partial<ExitClearance>[];
  witnesses?: Partial<ExitWitness>[];
  handoverItems?: Partial<ExitHandoverItem>[];
}

// Legacy interfaces for backward compatibility
export interface LegacyExitRecord {
  id: string;
  name: string;
  storageUnit: string;
  status: string;
  receiverName: string;
  receiverId: string;
  relationship: string;
  releaseTime: string;
  remarks: string;
  exitTime: string;
  exitDate?: string;
  witnessingStaff?: string;
  receiverType?: string;
  receiverIdProof?: string;
  releaseConditions?: string;
}

export interface Body {
  id: string;
  name: string;
  storageUnit: string;
  status: string;
  statusFlag: number;
  verificationStatus: string;
  timeOfDeath: string;
  riskLevel: string;
  incidentType: string;
  dateOfDeath: string;
  gender: string;
  age: string;
  mlcCase: boolean;
  photo: string;
  belongings: any[];
  notes: string;
  tagNumber: string;
  fromDischarge: boolean;
  dischargeId: string | null;
  registrationDate: string;
  patientId: string | null;
  placeOfDeath: string;
  causeOfDeath: string;
  mlcNumber: string | null;
  policeStation: string | null;
  photoPath: string | null;
  lastModified: string | null;
  addedBy: number;
  providerId: number;
  outletId: number;
} 

export interface ActiveStorageAllocation {
  storageAllocationId: number;
  bodyId: number;
  storageUnitId: number;
  storageStatus: number;
  bodyName: string;
  statusFlag: number;
  verificationStatus: string;
} 