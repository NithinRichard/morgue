import * as db from '../db/index.js';
import BodyService from './BodyService.js';
import ExitService from './ExitService.js';

/**
 * Analytics Service - Contains all business logic for analytics and reporting
 */
export class AnalyticsService {

  /**
   * Get admissions count for date range
   */
  static async getAdmissionsCount(fromDate, toDate) {
    try {
      const bodies = await BodyService.getAllBodies();
      const from = new Date(fromDate + 'T00:00:00');
      const to = new Date(toDate + 'T00:00:00');
      
      const count = bodies.filter(body => {
        const regDate = new Date(body.registrationDate);
        return regDate >= from && regDate <= to;
      }).length;
      
      return { count, period: { from: fromDate, to: toDate } };
    } catch (error) {
      throw new Error(`Failed to get admissions count: ${error.message}`);
    }
  }

  /**
   * Get releases count for date range
   */
  static async getReleasesCount(fromDate, toDate) {
    try {
      const exits = await ExitService.getExitsByDateRange(fromDate, toDate);
      return { 
        count: exits.length, 
        period: { from: fromDate, to: toDate } 
      };
    } catch (error) {
      throw new Error(`Failed to get releases count: ${error.message}`);
    }
  }

  /**
   * Get average storage duration
   */
  static async getAverageStorageDuration(fromDate, toDate) {
    try {
      const exits = await ExitService.getExitsByDateRange(fromDate, toDate);
      
      if (exits.length === 0) {
        return { averageDays: 0, totalExits: 0 };
      }

      const durations = exits
        .filter(exit => exit.registrationDate && exit.exitDate)
        .map(exit => {
          const regDate = new Date(exit.registrationDate);
          const exitDate = new Date(exit.exitDate);
          return (exitDate - regDate) / (1000 * 60 * 60 * 24); // days
        });

      const average = durations.length > 0 
        ? (durations.reduce((a, b) => a + b, 0) / durations.length) 
        : 0;

      return {
        averageDays: parseFloat(average.toFixed(2)),
        totalExits: exits.length,
        validDurations: durations.length
      };
    } catch (error) {
      throw new Error(`Failed to calculate average storage duration: ${error.message}`);
    }
  }

  /**
   * Get capacity usage statistics
   */
  static async getCapacityUsage() {
    try {
      const bodies = await BodyService.getAllBodies();
      const totalUnits = 30; // This could be fetched from configuration
      const occupied = bodies.filter(body => body.storageUnit && body.storageUnit !== '').length;
      const available = totalUnits - occupied;
      const percentage = ((occupied / totalUnits) * 100).toFixed(1);

      return {
        used: occupied,
        available: available,
        total: totalUnits,
        percentage: parseFloat(percentage),
        status: percentage > 90 ? 'critical' : percentage > 75 ? 'warning' : 'normal'
      };
    } catch (error) {
      throw new Error(`Failed to get capacity usage: ${error.message}`);
    }
  }

  /**
   * Get occupancy trends over time
   */
  static async getOccupancyTrends(fromDate, toDate) {
    try {
      const bodies = await BodyService.getAllBodies();
      const exits = await db.getExits();
      const trends = {};

      // Helper to format date as YYYY-MM-DD
      const formatDate = (date) => new Date(date).toISOString().split('T')[0];

      // Process admissions
      bodies.forEach(body => {
        const date = formatDate(body.registrationDate);
        if (!trends[date]) {
          trends[date] = { date, admissions: 0, releases: 0 };
        }
        trends[date].admissions++;
      });

      // Process exits
      exits.forEach(exit => {
        const date = formatDate(exit.exitDate);
        if (!trends[date]) {
          trends[date] = { date, admissions: 0, releases: 0 };
        }
        trends[date].releases++;
      });

      // Calculate daily occupancy
      const sortedDates = Object.keys(trends).sort();
      let occupied = 0;
      const occupancyData = sortedDates.map(date => {
        occupied += trends[date].admissions - trends[date].releases;
        return { 
          date, 
          occupied: Math.max(0, occupied), // Ensure non-negative
          admissions: trends[date].admissions,
          releases: trends[date].releases
        };
      });

      return occupancyData;
    } catch (error) {
      throw new Error(`Failed to get occupancy trends: ${error.message}`);
    }
  }

  /**
   * Get comprehensive dashboard statistics
   */
  static async getDashboardStats(fromDate, toDate) {
    try {
      const [
        admissions,
        releases,
        avgDuration,
        capacity,
        pendingVerifications
      ] = await Promise.all([
        this.getAdmissionsCount(fromDate, toDate),
        this.getReleasesCount(fromDate, toDate),
        this.getAverageStorageDuration(fromDate, toDate),
        this.getCapacityUsage(),
        BodyService.getPendingVerifications()
      ]);

      return {
        period: { from: fromDate, to: toDate },
        admissions,
        releases,
        averageStorageDuration: avgDuration,
        capacityUsage: capacity,
        pendingVerifications: {
          count: pendingVerifications.length,
          items: pendingVerifications
        },
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to generate dashboard stats: ${error.message}`);
    }
  }

  /**
   * Get body movement statistics
   */
  static async getBodyMovementStats() {
    try {
      const bodies = await BodyService.getAllBodies();
      const movements = [];

      bodies.forEach(body => {
        if (body.movements && Array.isArray(body.movements)) {
          body.movements.forEach(movement => {
            movements.push({
              bodyId: body.id,
              bodyName: body.name,
              from: movement.from,
              to: movement.to,
              timestamp: movement.timestamp
            });
          });
        }
      });

      return {
        totalMovements: movements.length,
        recentMovements: movements
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 10), // Last 10 movements
        movementsByUnit: this.groupMovementsByUnit(movements)
      };
    } catch (error) {
      throw new Error(`Failed to get body movement stats: ${error.message}`);
    }
  }

  /**
   * Group movements by storage unit
   */
  static groupMovementsByUnit(movements) {
    const grouped = {};
    
    movements.forEach(movement => {
      const unit = movement.to || 'Unknown';
      if (!grouped[unit]) {
        grouped[unit] = [];
      }
      grouped[unit].push(movement);
    });

    return grouped;
  }

  /**
   * Get risk level distribution
   */
  static async getRiskLevelDistribution() {
    try {
      const bodies = await BodyService.getAllBodies();
      const distribution = {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0
      };

      bodies.forEach(body => {
        const riskLevel = body.riskLevel || 'medium';
        if (distribution.hasOwnProperty(riskLevel)) {
          distribution[riskLevel]++;
        }
      });

      return distribution;
    } catch (error) {
      throw new Error(`Failed to get risk level distribution: ${error.message}`);
    }
  }
}

export default AnalyticsService;