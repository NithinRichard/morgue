// Exit model - represents a body exit/release record
export class Exit {
  constructor(data = {}) {
    this.id = data.id || null;
    this.bodyDetailsId = data.bodyDetailsId || null;
    this.exitTypeId = data.exitTypeId || null;
    this.exitStatusId = data.exitStatusId || null;
    this.exitDate = data.exitDate || new Date().toISOString();
    this.exitTime = data.exitTime || new Date().toTimeString().substring(0, 8);
    this.exitReason = data.exitReason || '';
    this.requiresNOC = data.requiresNOC || false;
    this.nocNumber = data.nocNumber || '';
    this.nocIssuedDate = data.nocIssuedDate || null;
    this.requiresAuthorization = data.requiresAuthorization || false;
    this.authorizationLevelId = data.authorizationLevelId || null;
    this.authorizedBy = data.authorizedBy || '';
    this.authorizationDate = data.authorizationDate || null;
    this.remarks = data.remarks || '';
    this.exitProcessedBy = data.exitProcessedBy || '';
    this.exitNotes = data.exitNotes || '';
    this.status = data.status || 'Active';
    this.addedBy = data.addedBy || '';
    this.addedOn = data.addedOn || new Date().toISOString();
    this.providerId = data.providerId || 1;
    this.outletId = data.outletId || 1;
  }

  // Validation method
  validate() {
    const errors = [];
    
    if (!this.bodyDetailsId) {
      errors.push('Body details ID is required');
    }
    
    if (!this.exitDate) {
      errors.push('Exit date is required');
    }
    
    if (!this.exitReason || this.exitReason.trim() === '') {
      errors.push('Exit reason is required');
    }
    
    if (this.requiresNOC && (!this.nocNumber || this.nocNumber.trim() === '')) {
      errors.push('NOC number is required when NOC is required');
    }
    
    if (this.requiresAuthorization && (!this.authorizedBy || this.authorizedBy.trim() === '')) {
      errors.push('Authorization details are required when authorization is required');
    }
    
    return errors;
  }

  // Convert to database format
  toDatabase() {
    return {
      EB_Body_Details_FK: this.bodyDetailsId,
      EB_Exit_Type_FK: this.exitTypeId,
      EB_Exit_Status_FK: this.exitStatusId,
      EB_Exit_Date: this.exitDate,
      EB_Exit_Time: this.exitTime,
      EB_Exit_Reason: this.exitReason,
      EB_Requires_NOC: this.requiresNOC,
      EB_NOC_Number: this.nocNumber,
      EB_NOC_Issued_Date: this.nocIssuedDate,
      EB_Requires_Authorization: this.requiresAuthorization,
      EB_Authorization_Level_FK: this.authorizationLevelId,
      EB_Authorized_By: this.authorizedBy,
      EB_Authorization_Date: this.authorizationDate,
      EB_Remarks: this.remarks,
      EB_Exit_Processed_By: this.exitProcessedBy,
      EB_Exit_Notes: this.exitNotes,
      EB_Status: this.status,
      EB_Added_by: this.addedBy,
      EB_Provider_fk: this.providerId,
      EB_Outlet_fk: this.outletId
    };
  }

  // Create from database format
  static fromDatabase(dbData) {
    return new Exit({
      id: dbData.EB_Id_pk,
      bodyDetailsId: dbData.EB_Body_Details_FK,
      exitTypeId: dbData.EB_Exit_Type_FK,
      exitStatusId: dbData.EB_Exit_Status_FK,
      exitDate: dbData.EB_Exit_Date,
      exitTime: dbData.EB_Exit_Time,
      exitReason: dbData.EB_Exit_Reason,
      requiresNOC: dbData.EB_Requires_NOC,
      nocNumber: dbData.EB_NOC_Number,
      nocIssuedDate: dbData.EB_NOC_Issued_Date,
      requiresAuthorization: dbData.EB_Requires_Authorization,
      authorizationLevelId: dbData.EB_Authorization_Level_FK,
      authorizedBy: dbData.EB_Authorized_By,
      authorizationDate: dbData.EB_Authorization_Date,
      remarks: dbData.EB_Remarks,
      exitProcessedBy: dbData.EB_Exit_Processed_By,
      exitNotes: dbData.EB_Exit_Notes,
      status: dbData.EB_Status,
      addedBy: dbData.EB_Added_by,
      addedOn: dbData.EB_Added_on,
      providerId: dbData.EB_Provider_fk,
      outletId: dbData.EB_Outlet_fk
    });
  }
}

export default Exit;