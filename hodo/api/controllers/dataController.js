import { JSONFilePreset } from 'lowdb/node';

const defaultData = { bodies: [], exits: [], discharges: [] };
const dbPromise = JSONFilePreset('db/db.json', defaultData);

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
      Object.assign(body, updates);
      // If storageUnit is being assigned (and is not empty), set status to "In Storage"
      if (updates.storageUnit && updates.storageUnit !== '') {
        body.status = 'In Storage';
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

export const logBodyVerification = async (req, res) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    const { name, relation, contact, idProof, remarks } = req.body;
    const body = db.data.bodies.find(b => b.id === id);
    if (body) {
      body.status = 'verified';
      if (!body.verificationLog) body.verificationLog = [];
      body.verificationLog.push({
        name,
        relation,
        contact,
        idProof,
        remarks,
        date: new Date().toISOString()
      });
      await db.write();
      res.status(200).json(body);
    } else {
      res.status(404).send('Body not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
}; 