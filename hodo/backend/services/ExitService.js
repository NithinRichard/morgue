import * as db from '../db/index.js';
import { Exit } from '../models/Exit.js';
import BodyService from './BodyService.js';

/**
 * Exit Service - Contains all business logic for body exit/release management
 */
export class ExitService {

  /**
   * Get all exits with storage information
   */
  static async getAllExitsWithStorageInfo() {
    try {
      const exits = await db.getExitsWithStorageInfo();
      return exits;
    } catch (error) {
      throw new Error(`Failed to fetch exits: ${error.message}`);
    }
  }

  /**
   * Process body exit/release
   */
  static async processBodyExit(bodyId, exitDetails) {
    try {
      // Get the body to be released
      const body = await BodyService.getBodyById(bodyId);
      
      if (!body) {
        throw new Error(`Body with ID ${bodyId} not found`);
      }

      // Validate exit details
      const exitData = {
        ...body,
        ...exitDetails,
        witnessingStaff: exitDetails.witnessingStaff || '',
        receiverType: exitDetails.receiverType || '',
        receiverIdProof: exitDetails.receiverIdProof || '',
        releaseConditions: exitDetails.releaseConditions || '',
        status: 'released',
        nocGenerated: true,
        exitDate: new Date().toISOString()
      };

      // Create exit model and validate
      const exit = new Exit(exitData);
      const validationErrors = exit.validate();
      
      if (validationErrors.length > 0) {
        throw new Error(`Exit validation failed: ${validationErrors.join(', ')}`);
      }

      // Remove body from active bodies
      await BodyService.deleteBody(bodyId);
      
      // Add to exits
      const exits = await db.getExits();
      exits.push(exitData);
      
      // Update storage allocation status
      await this.releaseStorageAllocation(body.storageUnit);
      
      return exitData;
    } catch (error) {
      throw new Error(`Failed to process body exit: ${error.message}`);
    }
  }

  /**
   * Get exit by ID
   */
  static async getExitById(exitId) {
    try {
      const exits = await db.getExits();
      const exit = exits.find(e => 
        e.id == exitId || String(e.id) === String(exitId)
      );
      
      if (!exit) {
        throw new Error(`Exit with ID ${exitId} not found`);
      }
      
      return exit;
    } catch (error) {
      throw new Error(`Failed to fetch exit: ${error.message}`);
    }
  }

  /**
   * Release storage allocation when body exits
   */
  static async releaseStorageAllocation(storageUnit) {
    try {
      if (!storageUnit) return;
      
      // Update storage allocation status to Released
      await db.updateStorageAllocationStatus(storageUnit, 'Released');
      
      console.log(`Released storage allocation for unit: ${storageUnit}`);
    } catch (error) {
      console.error('Error releasing storage allocation:', error);
      // Don't throw as this is not critical to the main exit process
    }
  }

  /**
   * Generate NOC (No Objection Certificate)
   */
  static async generateNOC(exitId, nocDetails) {
    try {
      const exit = await this.getExitById(exitId);
      
      const nocData = {
        nocNumber: nocDetails.nocNumber || `NOC-${Date.now()}`,
        issuedDate: new Date().toISOString(),
        issuedBy: nocDetails.issuedBy || 'Mortuary Staff',
        reason: nocDetails.reason || 'Body release',
        ...nocDetails
      };
      
      exit.nocGenerated = true;
      exit.nocDetails = nocData;
      
      return nocData;
    } catch (error) {
      throw new Error(`Failed to generate NOC: ${error.message}`);
    }
  }

  /**
   * Get exits by date range
   */
  static async getExitsByDateRange(fromDate, toDate) {
    try {
      const exits = await db.getExits();
      const from = new Date(fromDate);
      const to = new Date(toDate);
      
      return exits.filter(exit => {
        const exitDate = new Date(exit.exitDate);
        return exitDate >= from && exitDate <= to;
      });
    } catch (error) {
      throw new Error(`Failed to fetch exits by date range: ${error.message}`);
    }
  }

  /**
   * Get exit statistics
   */
  static async getExitStatistics(fromDate, toDate) {
    try {
      const exits = await this.getExitsByDateRange(fromDate, toDate);
      
      const stats = {
        totalExits: exits.length,
        byReason: {},
        byReceiverType: {},
        averageStayDuration: 0
      };
      
      let totalDuration = 0;
      
      exits.forEach(exit => {
        // Count by reason
        const reason = exit.exitReason || 'Unknown';
        stats.byReason[reason] = (stats.byReason[reason] || 0) + 1;
        
        // Count by receiver type
        const receiverType = exit.receiverType || 'Unknown';
        stats.byReceiverType[receiverType] = (stats.byReceiverType[receiverType] || 0) + 1;
        
        // Calculate duration
        if (exit.registrationDate && exit.exitDate) {
          const regDate = new Date(exit.registrationDate);
          const exitDate = new Date(exit.exitDate);
          const duration = (exitDate - regDate) / (1000 * 60 * 60 * 24); // days
          totalDuration += duration;
        }
      });
      
      if (exits.length > 0) {
        stats.averageStayDuration = (totalDuration / exits.length).toFixed(2);
      }
      
      return stats;
    } catch (error) {
      throw new Error(`Failed to calculate exit statistics: ${error.message}`);
    }
  }

  /**
   * Validate exit authorization
   */
  static async validateExitAuthorization(exitDetails) {
    try {
      const requiredFields = ['receiverName', 'receiverId', 'relationship'];
      const missingFields = requiredFields.filter(field => !exitDetails[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Additional validation logic can be added here
      // e.g., check receiver ID format, validate relationship, etc.
      
      return true;
    } catch (error) {
      throw new Error(`Exit authorization validation failed: ${error.message}`);
    }
  }
}

export default ExitService;