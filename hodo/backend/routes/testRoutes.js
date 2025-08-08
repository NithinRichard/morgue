import express from 'express';
import { getActiveStorageAllocations } from '../db/mssql.js';

const router = express.Router();

// Test endpoint to get storage allocations
router.get('/storage-allocations', async (req, res) => {
  try {
    console.log('Fetching storage allocations...');
    const allocations = await getActiveStorageAllocations();
    
    res.json({
      success: true,
      count: allocations.length,
      data: allocations
    });
    
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch storage allocations',
      error: error.message
    });
  }
});

export default router;