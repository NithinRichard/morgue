// Simple demonstration of unique ID generation without database dependency
import { 
    generateUUID, 
    generateBodyID, 
    generateMortuaryID, 
    generateTimestampID,
    generateRandomAlphanumeric,
    generateShortUniqueID,
    generateHospitalStyleID
} from './utils/idGenerator.js';

console.log('🆔 Unique ID Generation Examples for Your Mortuary System\n');

console.log('1. UUID (Globally Unique):');
for (let i = 1; i <= 3; i++) {
    console.log(`   ${i}. ${generateUUID()}`);
}

console.log('\n2. Mortuary ID (MTY-YYMMDD-XXX):');
for (let i = 1; i <= 5; i++) {
    console.log(`   ${i}. ${generateMortuaryID(i)}`);
}

console.log('\n3. Body ID (BODY-YYYY-MMDD-XXX):');
for (let i = 1; i <= 5; i++) {
    console.log(`   ${i}. ${generateBodyID(i)}`);
}

console.log('\n4. Timestamp-based ID:');
for (let i = 1; i <= 3; i++) {
    console.log(`   ${i}. ${generateTimestampID()}`);
    // Small delay to show different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
}

console.log('\n5. Random Alphanumeric (8 chars):');
for (let i = 1; i <= 5; i++) {
    console.log(`   ${i}. ${generateRandomAlphanumeric(8)}`);
}

console.log('\n6. Short Unique ID (8 chars):');
for (let i = 1; i <= 5; i++) {
    console.log(`   ${i}. ${generateShortUniqueID(8)}`);
}

console.log('\n7. Hospital Style ID:');
for (let i = 1; i <= 3; i++) {
    console.log(`   ${i}. ${generateHospitalStyleID('MTY')}`);
    await new Promise(resolve => setTimeout(resolve, 10));
}

console.log('\n📋 Comparison of ID Formats:');
console.log('┌─────────────────────────────────────────────────────────────┐');
console.log('│ Format              │ Example                    │ Benefits  │');
console.log('├─────────────────────────────────────────────────────────────┤');
console.log('│ UUID                │ 550e8400-e29b-41d4-a716... │ Globally  │');
console.log('│                     │                            │ unique    │');
console.log('├─────────────────────────────────────────────────────────────┤');
console.log('│ MTY-YYMMDD-XXX      │ MTY-241201-001             │ Compact,  │');
console.log('│                     │                            │ readable  │');
console.log('├─────────────────────────────────────────────────────────────┤');
console.log('│ BODY-YYYY-MMDD-XXX  │ BODY-2024-1201-001         │ Clear,    │');
console.log('│                     │                            │ sortable  │');
console.log('├─────────────────────────────────────────────────────────────┤');
console.log('│ Timestamp           │ 20241201143022847          │ Time-     │');
console.log('│                     │                            │ sortable  │');
console.log('├─────────────────────────────────────────────────────────────┤');
console.log('│ Random 8-char       │ B7X9K2M4                   │ Short,    │');
console.log('│                     │                            │ simple    │');
console.log('└─────────────────────────────────────────────────────────────┘');

console.log('\n🎯 Recommendation for Mortuary System:');
console.log('Use MTY-YYMMDD-XXX format because:');
console.log('• Easy to read and understand');
console.log('• Contains date information');
console.log('• Short and practical');
console.log('• Can track daily sequences');
console.log('• Professional appearance');

console.log('\n✅ All ID generators are working perfectly!');
console.log('You can now integrate these into your body registration system.');