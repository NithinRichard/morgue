import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'db', 'db.json');

console.log('🔧 Starting duplicate ID cleanup...');

// Read current database
const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

console.log(`📊 Current stats:`);
console.log(`   - Bodies: ${dbData.bodies.length}`);
console.log(`   - Exits: ${dbData.exits.length}`);

// Find duplicate IDs in active bodies
const activeBodiesIds = dbData.bodies.map(b => b.id);
const duplicateActiveBodies = activeBodiesIds.filter((id, index) => activeBodiesIds.indexOf(id) !== index);

if (duplicateActiveBodies.length > 0) {
    console.log(`⚠️  Found duplicate IDs in active bodies: ${[...new Set(duplicateActiveBodies)].join(', ')}`);
    
    // Remove duplicates, keeping the first occurrence
    const seenIds = new Set();
    const uniqueBodies = [];
    
    for (const body of dbData.bodies) {
        if (!seenIds.has(body.id)) {
            seenIds.add(body.id);
            uniqueBodies.push(body);
        } else {
            console.log(`🗑️  Removing duplicate body: ${body.id} - ${body.name}`);
        }
    }
    
    dbData.bodies = uniqueBodies;
    console.log(`✅ Active bodies cleaned: ${uniqueBodies.length} remaining`);
} else {
    console.log('✅ No duplicate IDs found in active bodies');
}

// Find duplicate IDs in exits (this is less critical but we'll log it)
const exitIds = dbData.exits.map(e => e.id);
const duplicateExits = exitIds.filter((id, index) => exitIds.indexOf(id) !== index);

if (duplicateExits.length > 0) {
    console.log(`ℹ️  Found duplicate IDs in exits: ${[...new Set(duplicateExits)].join(', ')}`);
    console.log('   (This is normal as same body can have multiple exit records)');
}

// Validate that all bodies have unique IDs after cleanup
const finalBodyIds = dbData.bodies.map(b => b.id);
const finalDuplicates = finalBodyIds.filter((id, index) => finalBodyIds.indexOf(id) !== index);

if (finalDuplicates.length === 0) {
    console.log('✅ All active bodies now have unique IDs');
    
    // Write cleaned database back
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf-8');
    console.log('💾 Database updated successfully');
    
    console.log(`📊 Final stats:`);
    console.log(`   - Bodies: ${dbData.bodies.length}`);
    console.log(`   - Exits: ${dbData.exits.length}`);
    console.log('🎉 Cleanup completed successfully!');
} else {
    console.error('❌ Still have duplicates after cleanup:', finalDuplicates);
    process.exit(1);
}
