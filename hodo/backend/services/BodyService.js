import * as db from '../db/index.js';
import { Body } from '../models/Body.js';

/**
 * Body Service - Contains all business logic for body management
 */
export class BodyService {
  
  /**
   * Get all active bodies
   */
  static async getAllBodies() {
    try {
      const bodies = await db.getBodies();
      return bodies;
    } catch (error) {
      throw new Error(`Failed to fetch bodies: ${error.message}`);
    }
  }

  /**
   * Get body by ID
   */
  static async getBodyById(id) {
    try {
      const bodies = await db.getBodies();
      const body = bodies.find(b => 
        b.id == id || b.id === id || String(b.id) === String(id)
      );
      
      if (!body) {
        throw new Error(`Body with ID ${id} not found`);
      }
      
      return body;
    } catch (error) {
      throw new Error(`Failed to fetch body: ${error.message}`);
    }
  }

  /**
   * Create new body with validation
   */
  static async createBody(bodyData) {
    try {
      // Create and validate body model
      const body = new Body(bodyData);
      const validationErrors = body.validate();
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Check if patient exists if patientId provided
      if (bodyData.patientId) {
        const patient = await db.getPatientById(bodyData.patientId);
        if (!patient) {
          throw new Error('Patient not found with the provided ID');
        }
      }

      // Create body in database
      const newBody = await db.addBody(bodyData);
      return newBody;
    } catch (error) {
      throw new Error(`Failed to create body: ${error.message}`);
    }
  }

  /**
   * Update body with validation
   */
  static async updateBody(id, updates) {
    try {
      const bodies = await db.getBodies();
      const bodyIndex = bodies.findIndex(b => 
        b.id == id || String(b.id) === String(id)
      );
      
      if (bodyIndex === -1) {
        throw new Error(`Body with ID ${id} not found`);
      }

      const body = bodies[bodyIndex];

      // Check storage unit availability if being updated
      if (updates.storageUnit && updates.storageUnit !== body.storageUnit) {
        const isOccupied = await this.isStorageUnitOccupied(updates.storageUnit, id);
        if (isOccupied) {
          throw new Error(`Storage unit ${updates.storageUnit} is already occupied`);
        }
      }

      // Apply updates
      Object.assign(body, updates);

      // Update status if storage unit assigned
      if (updates.storageUnit && updates.storageUnit !== '') {
        body.status = 'In Storage';
      }

      // Log movement if storage unit changes
      if (updates.storageUnit && body.storageUnit !== updates.storageUnit) {
        await this.logStorageMovement(body, body.storageUnit, updates.storageUnit);
      }

      return body;
    } catch (error) {
      throw new Error(`Failed to update body: ${error.message}`);
    }
  }

  /**
   * Verify body
   */
  static async verifyBody(id, verificationData) {
    try {
      const body = await this.getBodyById(id);
      
      body.status = 'verified';
      body.verifiedBy = verificationData.verifiedBy || 'Staff';
      body.verifiedAt = new Date().toISOString();

      // Add to verification log
      if (!Array.isArray(body.verificationLog)) {
        body.verificationLog = [];
      }
      
      body.verificationLog.push({
        ...verificationData,
        date: new Date().toISOString()
      });

      return body;
    } catch (error) {
      throw new Error(`Failed to verify body: ${error.message}`);
    }
  }

  /**
   * Delete body
   */
  static async deleteBody(id) {
    try {
      const bodies = await db.getBodies();
      const index = bodies.findIndex(b => 
        b.id == id || String(b.id) === String(id)
      );
      
      if (index === -1) {
        throw new Error(`Body with ID ${id} not found`);
      }

      bodies.splice(index, 1);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete body: ${error.message}`);
    }
  }

  /**
   * Check if storage unit is occupied
   */
  static async isStorageUnitOccupied(storageUnit, excludeBodyId = null) {
    try {
      const bodies = await db.getBodies();
      const activeBodies = bodies.filter(b => b.status !== 'released');
      
      const occupiedUnit = activeBodies.find(b => 
        b.storageUnit === storageUnit && 
        (excludeBodyId ? (b.id != excludeBodyId && String(b.id) !== String(excludeBodyId)) : true)
      );
      
      return !!occupiedUnit;
    } catch (error) {
      throw new Error(`Failed to check storage unit availability: ${error.message}`);
    }
  }

  /**
   * Log storage movement
   */
  static async logStorageMovement(body, fromUnit, toUnit) {
    try {
      if (!Array.isArray(body.movements)) {
        body.movements = [];
      }
      
      const movementLog = {
        from: fromUnit,
        to: toUnit,
        timestamp: new Date().toISOString()
      };
      
      body.movements.push(movementLog);
      
      // Create storage allocation if needed
      if (toUnit && toUnit !== '') {
        await db.createStorageAllocation({
          bodyId: body.id,
          storageUnitId: toUnit,
          allocatedBy: 1,
          status: 'Active',
          priorityLevel: body.riskLevel === 'high' || body.riskLevel === 'urgent' ? 'High' : 'Normal',
          temperatureRequired: -18.0,
          providerId: 1,
          outletId: 1,
          expectedDurationDays: 7,
          allocationType: 'Updated'
        });
      }
    } catch (error) {
      console.error('Error logging storage movement:', error);
      // Don't throw here as it's not critical to the main operation
    }
  }

  /**
   * Get bodies by status
   */
  static async getBodiesByStatus(status) {
    try {
      const bodies = await this.getAllBodies();
      return bodies.filter(body => body.status === status);
    } catch (error) {
      throw new Error(`Failed to fetch bodies by status: ${error.message}`);
    }
  }

  /**
   * Get pending verifications
   */
  static async getPendingVerifications() {
    try {
      return await this.getBodiesByStatus('Pending');
    } catch (error) {
      throw new Error(`Failed to fetch pending verifications: ${error.message}`);
    }
  }
}

export default BodyService;