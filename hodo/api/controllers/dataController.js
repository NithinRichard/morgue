import { JSONFilePreset } from 'lowdb/node';

const defaultData = { bodies: [], exits: [], discharges: [], movements: [] };
const dbPromise = JSONFilePreset('db/db.json', defaultData);

// Helper: parse date string to Date
function parseDate(dateStr) {
  return new Date(dateStr + 'T00:00:00');
}

// For trends endpoint
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// GET /api/analytics/admissions
export const getAdmissionsCount = async (req, res) => {
  const { from, to } = req.query;
  const db = await dbPromise;
  const fromDate = parseDate(from);
  const toDate = parseDate(to);
  const count = db.data.bodies.filter(b => {
    const regDate = new Date(b.registrationDate);
    return regDate >= fromDate && regDate <= toDate;
  }).length;
  res.json({ count });
};

// GET /api/analytics/releases
export const getReleasesCount = async (req, res) => {
  const { from, to } = req.query;
  const db = await dbPromise;
  const fromDate = parseDate(from);
  const toDate = parseDate(to);
  const count = db.data.exits.filter(e => {
    const exitDate = new Date(e.exitDate);
    return exitDate >= fromDate && exitDate <= toDate;
  }).length;
  res.json({ count });
};

// GET /api/analytics/average-duration
export const getAverageStorageDuration = async (req, res) => {
  const { from, to } = req.query;
  const db = await dbPromise;
  const fromDate = parseDate(from);
  const toDate = parseDate(to);
  const durations = db.data.exits
    .filter(e => {
      const exitDate = new Date(e.exitDate);
      return exitDate >= fromDate && exitDate <= toDate;
    })
    .map(e => {
      const regDate = new Date(e.registrationDate);
      const exitDate = new Date(e.exitDate);
      return (exitDate - regDate) / (1000 * 60 * 60 * 24); // days
    });
  const avg = durations.length ? (durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  res.json({ averageDays: avg.toFixed(2) });
};

// GET /api/analytics/capacity-usage
export const getCapacityUsage = async (req, res) => {
  const db = await dbPromise;
  const totalUnits = 30; // or fetch dynamically
  const occupied = db.data.bodies.filter(b => b.storageUnit).length;
  res.json({ used: occupied, total: totalUnits, percent: ((occupied / totalUnits) * 100).toFixed(1) });
};

export const getBodies = async (req, res) => {
  try {
    const db = await dbPromise;
    res.json(db.data.bodies);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const addBody = async (req, res) => {
  try {
    const db = await dbPromise;
    // Generate next tag number
    const tagNumbers = db.data.bodies
      .map(b => b.tagNumber)
      .filter(Boolean)
      .map(tn => parseInt((tn || '').replace('TAG-', '')))
      .filter(n => !isNaN(n));
    const nextTagNum = tagNumbers.length > 0 ? Math.max(...tagNumbers) + 1 : 1;
    const tagNumber = `TAG-${String(nextTagNum).padStart(3, '0')}`;
    const newBody = { id: `B${String(db.data.bodies.length + 1).padStart(3, '0')}`, ...req.body, tagNumber };
    db.data.bodies.push(newBody);
    await db.write();
    res.status(201).json(newBody);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const verifyBody = async (req, res) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    const { verifiedBy } = req.body;

    const body = db.data.bodies.find(b => b.id === id);

    if (body) {
      body.status = 'verified';
      body.verifiedBy = verifiedBy || 'Staff'; 
      await db.write();
      res.status(200).json(body);
    } else {
      res.status(404).send('Body not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getExits = async (req, res) => {
  try {
    const db = await dbPromise;
    res.json(db.data.exits);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const addExit = async (req, res) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    const exitDetails = req.body;

    const bodyIndex = db.data.bodies.findIndex(b => b.id === id);

    if (bodyIndex !== -1) {
      const [bodyToExit] = db.data.bodies.splice(bodyIndex, 1);
      const exitRecord = {
        ...bodyToExit,
        ...exitDetails,
        witnessingStaff: exitDetails.witnessingStaff || '',
        receiverType: exitDetails.receiverType || '',
        receiverIdProof: exitDetails.receiverIdProof || '',
        releaseConditions: exitDetails.releaseConditions || '',
        nocGenerated: true, // Mark NOC as generated
        exitDate: new Date().toISOString()
      };
      db.data.exits.push(exitRecord);
      await db.write();
      res.status(200).json(exitRecord);
    } else {
      res.status(404).send('Body not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getBodyById = async (req, res) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    const body = db.data.bodies.find(b => b.id === id);
    if (body) {
      res.status(200).json(body);
    } else {
      res.status(404).send('Body not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const patchBody = async (req, res) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    const updates = req.body;
    const body = db.data.bodies.find(b => b.id === id);
    if (body) {
      const oldStorageUnit = body.storageUnit;
      Object.assign(body, updates);

      // If storageUnit is being assigned (and is not empty), set status to "In Storage"
      if (updates.storageUnit && updates.storageUnit !== '') {
        body.status = 'In Storage';
      }

      // Log movement if storage unit changes
      if (updates.storageUnit && oldStorageUnit !== updates.storageUnit) {
        const movementLog = {
          id: `MOV-${Date.now()}`,
          bodyId: body.id,
          name: body.name,
          fromStorage: oldStorageUnit,
          toStorage: updates.storageUnit,
          movedBy: 'Staff', // This can be enhanced to track the actual user
          timestamp: new Date().toISOString()
        };
        db.data.movements.push(movementLog);
      }

      await db.write();
      res.status(200).json(body);
    } else {
      res.status(404).send('Body not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteBody = async (req, res) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    const index = db.data.bodies.findIndex(b => b.id === id);
    if (index !== -1) {
      db.data.bodies.splice(index, 1);
      await db.write();
      res.status(204).send();
    } else {
      res.status(404).send('Body not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getDischarges = async (req, res) => {
  try {
    const db = await dbPromise;
    // Filter only expired patients from discharge table
    const expiredDischarges = db.data.discharges.filter(discharge => 
      discharge.dischargeStatus === 'Expired'
    );
    res.json(expiredDischarges);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getDischargeById = async (req, res) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    const discharge = db.data.discharges.find(d => d.id === id);
    if (discharge) {
      res.status(200).json(discharge);
    } else {
      res.status(404).send('Discharge record not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
}; 

export const getPendingVerifications = async (req, res) => {
  try {
    const db = await dbPromise;
    const pendingBodies = db.data.bodies.filter(body => body.status === 'Pending');
    res.json(pendingBodies);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getAverageStayDuration = async (req, res) => {
  try {
    const db = await dbPromise;
    const { exits } = db.data;
    if (exits.length === 0) {
      return res.json({ averageDays: 0 });
    }

    const totalDuration = exits.reduce((acc, exit) => {
      const admissionDate = new Date(exit.registrationDate);
      const exitDate = new Date(exit.exitDate);
      const duration = (exitDate - admissionDate) / (1000 * 60 * 60 * 24); // in days
      return acc + duration;
    }, 0);

    const averageDays = totalDuration / exits.length;
    res.json({ averageDays });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getOccupancyTrends = async (req, res) => {
  try {
    const db = await dbPromise;
    const { bodies, exits } = db.data;
    const trends = {};

    // Helper to format date as YYYY-MM-DD
    const formatDate = (date) => new Date(date).toISOString().split('T')[0];

    // Process admissions
    bodies.forEach(body => {
      const date = formatDate(body.registrationDate);
      if (!trends[date]) trends[date] = { date, admissions: 0, releases: 0 };
      trends[date].admissions++;
    });

    // Process exits
    exits.forEach(exit => {
      const date = formatDate(exit.exitDate);
      if (!trends[date]) trends[date] = { date, admissions: 0, releases: 0 };
      trends[date].releases++;
    });

    // Calculate daily occupancy
    const sortedDates = Object.keys(trends).sort();
    let occupied = 0;
    const occupancyData = sortedDates.map(date => {
      occupied += trends[date].admissions - trends[date].releases;
      return { date, occupied };
    });

    res.json(occupancyData);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getBodyMovements = async (req, res) => {
  try {
    const db = await dbPromise;
    res.json(db.data.movements);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getDepartmentDeathLogs = async (req, res) => {
  try {
    const db = await dbPromise;
    const { department } = req.query;
    let logs = db.data.exits;

    if (department) {
      logs = logs.filter(log => log.department === department);
    }

    res.json(logs);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const logBodyVerification = async (req, res) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    const { name, relation, contact, idProof, remarks, verifierType, medicalRegNo, badgeNumber } = req.body;
    const body = db.data.bodies.find(b => b.id === id);
    if (body) {
      body.status = 'verified';
      // No verificationLog update
      await db.write();
      res.status(200).json(body);
    } else {
      res.status(404).send('Body not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
}; 

export const getTrends = async (req, res) => {
  const { from, to } = req.query;
  const db = await dbPromise;
  const fromDate = new Date(from);
  const toDate = new Date(to);

  // Build a date map for the range
  const days = [];
  for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
    days.push(formatDate(new Date(d)));
  }

  // Count admissions and releases per day
  const admissions = db.data.bodies || [];
  const releases = db.data.exits || [];
  const trend = days.map(date => ({
    date,
    admitted: admissions.filter(b => b.registrationDate && b.registrationDate.startsWith(date)).length,
    released: releases.filter(e => e.exitDate && e.exitDate.startsWith(date)).length,
  }));

  res.json(trend);
}; 

export const getBodyVerifyLog = async (req, res) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    const body = db.data.bodies.find(b => b.id === id);
    if (body && body.verificationLog) {
      res.status(200).json(body.verificationLog);
    } else {
      res.status(404).json({ message: 'Verification log not found' });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
}; 