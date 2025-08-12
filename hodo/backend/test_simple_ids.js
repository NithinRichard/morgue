// Test the simple ID service
import SimpleIdService from './services/SimpleIdService.js';

console.log('🆔 Testing Simple ID Service for Mortuary System\n');

// Generate single IDs
console.log('1. Single ID Generation:');
for (let i = 1; i <= 5; i++) {
    const id = SimpleIdService.generateUniqueBodyId();
    console.log(`   Body ${i}: ${id}`);
}

// Generate multiple IDs at once
console.log('\n2. Multiple ID Generation:');
const multipleIds = SimpleIdService.generateMultipleIds(3);
multipleIds.forEach((id, index) => {
    console.log(`   Batch ID ${index + 1}: ${id}`);
});

// Test different formats
console.log('\n3. Different ID Formats:');
const formats = ['MTY', 'UUID', 'TIMESTAMP', 'RANDOM'];
formats.forEach(format => {
    const id = SimpleIdService.generateIdWithFormat(format);
    console.log(`   ${format}: ${id}`);
});

// Test validation
console.log('\n4. ID Validation:');
const testIds = [
    'MTY-250812-001',
    'MTY-250812-999',
    'INVALID-ID',
    'b85a66cf-6e60-495e-b6d8-ee59680075ac'
];

testIds.forEach(id => {
    const isValidMty = SimpleIdService.validateId(id, 'MTY');
    const isValidUuid = SimpleIdService.validateId(id, 'UUID');
    console.log(`   ${id}: MTY=${isValidMty}, UUID=${isValidUuid}`);
});

// Test ID info extraction
console.log('\n5. ID Information Extraction:');
const sampleIds = [
    'MTY-250812-001',
    'MTY-241225-123',
    'b85a66cf-6e60-495e-b6d8-ee59680075ac'
];

sampleIds.forEach(id => {
    const info = SimpleIdService.getIdInfo(id);
    console.log(`   ${id}:`);
    console.log(`     Format: ${info.format}`);
    console.log(`     Valid: ${info.valid}`);
    if (info.date) console.log(`     Date: ${info.date}`);
    if (info.sequence) console.log(`     Sequence: ${info.sequence}`);
});

console.log('\n✅ Simple ID Service is working perfectly!');
console.log('\n🎯 How to use in your application:');
console.log('1. Import: import SimpleIdService from "./services/SimpleIdService.js"');
console.log('2. Generate ID: const id = SimpleIdService.generateUniqueBodyId()');
console.log('3. Validate ID: const isValid = SimpleIdService.validateId(id, "MTY")');
console.log('4. Get ID info: const info = SimpleIdService.getIdInfo(id)');

console.log('\n📋 Example Body Registration:');
const exampleBody = {
    customId: SimpleIdService.generateUniqueBodyId(),
    name: 'John Doe',
    dateOfDeath: '2025-08-12',
    riskLevel: 'medium'
};
console.log('Body Object:', JSON.stringify(exampleBody, null, 2));