// StorageAllocation model - represents storage unit allocation for bodies
export class StorageAllocation {
  constructor(data = {}) {
    this.id = data.id || null;
    this.bodyId = data.bodyId || null;
    this.storageUnitId = data.storageUnitId || null;
    this.allocatedDate = data.allocatedDate || new Date().toISOString();
    this.expectedDurationDays = data.expectedDurationDays || 7;
    this.actualDurationDays = data.actualDurationDays || null;
    this.status = data.status || 'Active'; // Active, Inactive, Released, Maintenance
    this.priorityLevel = data.priorityLevel || 'Normal'; // Low, Normal, High, Urgent
    this.temperatureRequired = data.temperatureRequired || -18.0;
    this.currentTemperature = data.currentTemperature || null;
    this.allocatedBy = data.allocatedBy || null;
    this.releasedDate = data.releasedDate || null;
    this.releasedBy = data.releasedBy || null;
    this.notes = data.notes || '';
    this.allocationType = data.allocationType || 'Manual'; // Manual, Automatic, Updated
    this.providerId = data.providerId || 1;
    this.outletId = data.outletId || 1;
    this.addedOn = data.addedOn || new Date().toISOString();
    this.modifiedOn = data.modifiedOn || new Date().toISOString();
  }

  // Validation method
  validate() {
    const errors = [];
    
    if (!this.bodyId) {
      errors.push('Body ID is required');
    }
    
    if (!this.storageUnitId) {
      errors.push('Storage unit ID is required');
    }
    
    if (!this.allocatedBy) {
      errors.push('Allocated by user ID is required');
    }
    
    if (!['Active', 'Inactive', 'Released', 'Maintenance'].includes(this.status)) {
      errors.push('Invalid status');
    }
    
    if (!['Low', 'Normal', 'High', 'Urgent'].includes(this.priorityLevel)) {
      errors.push('Invalid priority level');
    }
    
    if (this.expectedDurationDays && this.expectedDurationDays <= 0) {
      errors.push('Expected duration must be positive');
    }
    
    return errors;
  }

  // Convert to database format
  toDatabase() {
    return {
      SA_Body_FK: this.bodyId,
      SA_Storage_Unit_FK: this.storageUnitId,
      SA_Allocated_Date: this.allocatedDate,
      SA_Expected_Duration_Days: this.expectedDurationDays,
      SA_Actual_Duration_Days: this.actualDurationDays,
      SA_Status: this.status,
      SA_Priority_Level: this.priorityLevel,
      SA_Temperature_Required: this.temperatureRequired,
      SA_Current_Temperature: this.currentTemperature,
      SA_Allocated_By: this.allocatedBy,
      SA_Released_Date: this.releasedDate,
      SA_Released_By: this.releasedBy,
      SA_Notes: this.notes,
      SA_Allocation_Type: this.allocationType,
      SA_Provider_FK: this.providerId,
      SA_Outlet_FK: this.outletId,
      SA_Added_On: this.addedOn,
      SA_Modified_On: this.modifiedOn
    };
  }

  // Create from database format
  static fromDatabase(dbData) {
    return new StorageAllocation({
      id: dbData.SA_ID_PK,
      bodyId: dbData.SA_Body_FK,
      storageUnitId: dbData.SA_Storage_Unit_FK,
      allocatedDate: dbData.SA_Allocated_Date,
      expectedDurationDays: dbData.SA_Expected_Duration_Days,
      actualDurationDays: dbData.SA_Actual_Duration_Days,
      status: dbData.SA_Status,
      priorityLevel: dbData.SA_Priority_Level,
      temperatureRequired: dbData.SA_Temperature_Required,
      currentTemperature: dbData.SA_Current_Temperature,
      allocatedBy: dbData.SA_Allocated_By,
      releasedDate: dbData.SA_Released_Date,
      releasedBy: dbData.SA_Released_By,
      notes: dbData.SA_Notes,
      allocationType: dbData.SA_Allocation_Type,
      providerId: dbData.SA_Provider_FK,
      outletId: dbData.SA_Outlet_FK,
      addedOn: dbData.SA_Added_On,
      modifiedOn: dbData.SA_Modified_On
    });
  }

  // Calculate current duration in days
  getCurrentDuration() {
    if (!this.allocatedDate) return 0;
    
    const allocated = new Date(this.allocatedDate);
    const now = new Date();
    const diffTime = Math.abs(now - allocated);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  // Check if allocation is overdue
  isOverdue() {
    if (!this.expectedDurationDays) return false;
    return this.getCurrentDuration() > this.expectedDurationDays;
  }

  // Get status with overdue information
  getStatusWithOverdue() {
    if (this.status === 'Active' && this.isOverdue()) {
      return 'Overdue';
    }
    return this.status;
  }
}

export default StorageAllocation;