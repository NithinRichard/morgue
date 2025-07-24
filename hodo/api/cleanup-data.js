import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'db', 'db.json');

console.log('Starting data cleanup...');

// Read the current database
const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// Find bodies that have been released (have exitDate and nocGenerated)
const releasedBodies = [];
const activeBodies = [];

dbData.bodies.forEach(body => {
  if (body.exitDate && body.nocGenerated) {
    // This body has been released but is still in the bodies array
    releasedBodies.push(body);
    console.log(`Found released body: ${body.id} - ${body.name}`);
  } else {
    // This body is still active
    activeBodies.push(body);
  }
});

// Add released bodies to exits array (avoid duplicates)
const existingExitIds = new Set(dbData.exits.map(exit => exit.id + '-' + exit.exitDate));

releasedBodies.forEach(body => {
  const exitKey = body.id + '-' + body.exitDate;
  if (!existingExitIds.has(exitKey)) {
    // Set proper status for released bodies
    body.status = 'released';
    dbData.exits.push(body);
    console.log(`Moved ${body.id} - ${body.name} to exits`);
  } else {
    console.log(`Exit record for ${body.id} already exists, skipping...`);
  }
});

// Update the bodies array to only contain active bodies
dbData.bodies = activeBodies;

// Create a backup of the original file
const backupPath = dbPath + '.backup.' + Date.now();
fs.copyFileSync(dbPath, backupPath);
console.log(`Backup created: ${backupPath}`);

// Write the cleaned up data back
fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf-8');

console.log(`Cleanup completed!`);
console.log(`- Released bodies moved to exits: ${releasedBodies.length}`);
console.log(`- Active bodies remaining in storage: ${activeBodies.length}`);
console.log(`- Total exits: ${dbData.exits.length}`);
