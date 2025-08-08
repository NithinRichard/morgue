// Example of how to refactor controllers to use services
import { BodyService, ExitService, AnalyticsService } from '../services/index.js';

/**
 * Refactored Controller Example - Shows clean separation using services
 */

// ✅ BEFORE (Controller doing everything):
export const getBodiesOldWay = async (req, res) => {
  try {
    const bodies = await db.getBodies(); // Direct DB call
    // Business logic mixed with HTTP handling
    const filteredBodies = bodies.filter(b => b.status !== 'deleted');
    res.json(filteredBodies);
  } catch (error) {
    console.error('Error in getBodies:', error);
    res.status(500).send(error.message);
  }
};

// ✅ AFTER (Controller using services):
export const getBodiesNewWay = async (req, res) => {
  try {
    // Controller only handles HTTP - business logic in service
    const bodies = await BodyService.getAllBodies();
    res.json(bodies);
  } catch (error) {
    console.error('Error in getBodies:', error);
    res.status(500).json({ 
      error: 'Failed to fetch bodies',
      message: error.message 
    });
  }
};

// ✅ BEFORE (Complex business logic in controller):
export const addBodyOldWay = async (req, res) => {
  try {
    const { patientId, ...bodyData } = req.body;

    // Validation logic in controller (bad)
    if (!bodyData.name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Patient lookup logic in controller (bad)
    let actualPatientId = null;
    if (patientId) {
      const patient = await db.getPatientById(patientId);
      if (!patient) {
        return res.status(400).json({ error: 'Patient not found' });
      }
      actualPatientId = patient.PM_Card_PK;
    }

    // Database logic in controller (bad)
    const newBody = await db.addBody({
      ...bodyData,
      patientId: actualPatientId,
      name: bodyData.name || 'Unknown'
    });

    res.status(201).json(newBody);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add body' });
  }
};

// ✅ AFTER (Clean controller using service):
export const addBodyNewWay = async (req, res) => {
  try {
    // Controller only handles HTTP - all business logic in service
    const newBody = await BodyService.createBody(req.body);
    res.status(201).json(newBody);
  } catch (error) {
    console.error('Error in addBody:', error);
    
    // Better error handling
    if (error.message.includes('Validation failed')) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: error.message 
      });
    }
    
    if (error.message.includes('Patient not found')) {
      return res.status(404).json({ 
        error: 'Patient not found',
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create body',
      message: error.message 
    });
  }
};

// ✅ Analytics example:
export const getAnalytics = async (req, res) => {
  try {
    const { from, to } = req.query;
    
    // All business logic handled by service
    const analytics = await AnalyticsService.getDashboardStats(from, to);
    
    res.json(analytics);
  } catch (error) {
    console.error('Error in getAnalytics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics',
      message: error.message 
    });
  }
};

// ✅ Exit processing example:
export const processExit = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Service handles all the complex exit logic
    const exitRecord = await ExitService.processBodyExit(id, req.body);
    
    res.status(200).json(exitRecord);
  } catch (error) {
    console.error('Error in processExit:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ 
        error: 'Body not found',
        message: error.message 
      });
    }
    
    if (error.message.includes('validation failed')) {
      return res.status(400).json({ 
        error: 'Invalid exit data',
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to process exit',
      message: error.message 
    });
  }
};