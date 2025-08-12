// Body model - represents a deceased body in the mortuary system
export class Body {
  constructor(data = {}) {
    this.id = data.id || null;
    this.customId = data.customId || null; // Unique custom ID like MTY-241201-001
    this.name = data.name || 'Unknown';
    this.patientId = data.patientId || null;
    this.dateOfDeath = data.dateOfDeath || new Date().toISOString().split('T')[0];
    this.timeOfDeath = data.timeOfDeath || new Date().toISOString();
    this.placeOfDeath = data.placeOfDeath || '';
    this.causeOfDeath = data.causeOfDeath || '';
    this.mlcCase = data.mlcCase || false;
    this.mlcNumber = data.mlcNumber || '';
    this.policeStation = data.policeStation || '';
    this.incidentType = data.incidentType || 'natural';
    this.riskLevel = data.riskLevel || 'medium';
    this.storageUnit = data.storageUnit || '';
    this.status = data.status || 'pending';
    this.notes = data.notes || '';
    this.photoPath = data.photoPath || '';
    this.tagNumber = data.tagNumber || '';
    this.verificationStatus = data.verificationStatus || 'pending';
    this.registrationDate = data.registrationDate || new Date().toISOString();
    this.lastModified = data.lastModified || new Date().toISOString();
    this.addedBy = data.addedBy || 1;
    this.providerId = data.providerId || 1;
    this.outletId = data.outletId || 1;
  }

  // Validation method
  validate() {
    const errors = [];
    
    if (!this.name || this.name.trim() === '') {
      errors.push('Name is required');
    }
    
    if (!this.dateOfDeath) {
      errors.push('Date of death is required');
    }
    
    if (!['natural', 'accident', 'suicide', 'homicide', 'unknown'].includes(this.incidentType)) {
      errors.push('Invalid incident type');
    }
    
    if (!['low', 'medium', 'high', 'urgent'].includes(this.riskLevel)) {
      errors.push('Invalid risk level');
    }
    
    return errors;
  }

  // Convert to database format
  toDatabase() {
    return {
      BD_Custom_ID: this.customId,
      BD_Name: this.name,
      BD_Patient_FK: this.patientId,
      BD_Date_Of_Death: this.dateOfDeath,
      BD_Time_Of_Death: this.timeOfDeath,
      BD_Place_Of_Death: this.placeOfDeath,
      BD_Cause_Of_Death: this.causeOfDeath,
      BD_MLC_Case: this.mlcCase,
      BD_MLC_Number: this.mlcNumber,
      BD_Police_Station: this.policeStation,
      BD_Incident_Type: this.incidentType,
      BD_Risk_Level: this.riskLevel,
      BD_Storage_Unit: this.storageUnit,
      BD_Status: this.status,
      BD_Notes: this.notes,
      BD_Photo_Path: this.photoPath,
      BD_Tag_Number: this.tagNumber,
      BD_Verification_Status: this.verificationStatus,
      BD_Added_By: this.addedBy,
      BD_Provider_FK: this.providerId,
      BD_Outlet_FK: this.outletId
    };
  }

  // Create from database format
  static fromDatabase(dbData) {
    return new Body({
      id: dbData.BD_ID_PK,
      customId: dbData.BD_Custom_ID,
      name: dbData.BD_Name,
      patientId: dbData.BD_Patient_FK,
      dateOfDeath: dbData.BD_Date_Of_Death,
      timeOfDeath: dbData.BD_Time_Of_Death,
      placeOfDeath: dbData.BD_Place_Of_Death,
      causeOfDeath: dbData.BD_Cause_Of_Death,
      mlcCase: dbData.BD_MLC_Case,
      mlcNumber: dbData.BD_MLC_Number,
      policeStation: dbData.BD_Police_Station,
      incidentType: dbData.BD_Incident_Type,
      riskLevel: dbData.BD_Risk_Level,
      storageUnit: dbData.BD_Storage_Unit,
      status: dbData.BD_Status,
      notes: dbData.BD_Notes,
      photoPath: dbData.BD_Photo_Path,
      tagNumber: dbData.BD_Tag_Number,
      verificationStatus: dbData.BD_Verification_Status,
      registrationDate: dbData.BD_Added_On,
      lastModified: dbData.BD_Modified_On,
      addedBy: dbData.BD_Added_By,
      providerId: dbData.BD_Provider_FK,
      outletId: dbData.BD_Outlet_FK
    });
  }
}

export default Body;