const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

function pad(num, size) {
  let s = num + '';
  while (s.length < size) s = '0' + s;
  return s;
}

const genders = ['male', 'female'];
const statuses = ['verified', 'pending', 'unverified'];
const riskLevels = ['low', 'medium', 'high'];
const incidentTypes = ['natural', 'accident', 'homicide', 'suicide'];

const bodies = [];
for (let i = 1; i <= 200; i++) {
  const id = `B${pad(i, 3)}`;
  bodies.push({
    id,
    name: `Person ${i}`,
    age: (20 + (i % 60)).toString(),
    gender: genders[i % 2],
    dateOfDeath: `2025-07-${pad((i % 28) + 1, 2)}`,
    timeOfDeath: `2025-07-${pad((i % 28) + 1, 2)}T${pad((8 + (i % 12)), 2)}:00`,
    address: `${i} Example St, City`,
    contactPerson: `Contact ${i}`,
    contactNumber: `9000000${pad(i, 3)}`,
    incidentType: incidentTypes[i % incidentTypes.length],
    notes: '',
    belongings: [i % 3 === 0 ? 'watch' : 'ring'],
    accompanyingPersons: [{ name: `Companion ${i}`, contact: `8000000${pad(i, 3)}` }],
    mlcCase: i % 5 === 0,
    policeInvolved: i % 7 === 0,
    status: statuses[i % statuses.length],
    storageLocation: `Morgue ${String.fromCharCode(65 + (i % 4))}`,
    registeredBy: 'Staff',
    registrationDate: `2025-07-${pad((i % 28) + 1, 2)}T09:00:00Z`,
    storageUnit: `F-${pad(((i - 1) % 30) + 1, 2)}`,
    riskLevel: riskLevels[i % riskLevels.length],
    verifiedBy: i % 2 === 0 ? 'Staff' : undefined
  });
}

db.bodies = bodies;
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Generated 200 example bodies in db.json'); 