// Test script to demonstrate unique ID generation
import IdGeneratorService from './services/IdGeneratorService.js';
import { 
    generateUUID, 
    generateBodyID, 
    generateMortuaryID, 
    generateTimestampID,
    generateRandomAlphanumeric,
    generateShortUniqueID,
    generateHospitalStyleID
} from './utils/idGenerator.js';
import dotenv from 'dotenv';

dotenv.config();

async function testUniqueIdGeneration() {
    console.log('🆔 Testing Unique ID Generation Systems\n');
    
    // Test basic ID generators
    console.log('📋 Basic ID Generators:');
    console.log('UUID:', generateUUID());
    console.log('Body ID:', generateBodyID());
    console.log('Mortuary ID:', generateMortuaryID());
    console.log('Timestamp ID:', generateTimestampID());
    console.log('Random Alphanumeric:', generateRandomAlphanumeric(8));
    console.log('Short Unique ID:', generateShortUniqueID(8));
    console.log('Hospital Style ID:', generateHospitalStyleID('MTY'));
    console.log('');

    // Test service-based ID generation with sequence tracking
    console.log('🔢 Service-based ID Generation (with sequence tracking):');
    
    try {
        // Generate multiple IDs of different formats
        const formats = ['MTY', 'BODY', 'UUID', 'TIMESTAMP', 'RANDOM', 'SHORT'];
        
        for (const format of formats) {
            const id = await IdGeneratorService.generateUniqueBodyID(format);
            console.log(`${format} format:`, id);
        }
        
        console.log('');
        
        // Generate multiple sequential IDs to show sequence tracking
        console.log('📈 Sequential ID Generation (MTY format):');
        for (let i = 1; i <= 5; i++) {
            const id = await IdGeneratorService.generateGuaranteedUniqueID('MTY');
            console.log(`ID ${i}:`, id);
        }
        
        console.log('');
        
        // Show ID statistics
        console.log('📊 ID Generation Statistics:');
        const stats = await IdGeneratorService.getIdStatistics();
        if (stats.length > 0) {
            console.table(stats);
        } else {
            console.log('No statistics available yet');
        }
        
    } catch (error) {
        console.error('❌ Error testing service-based ID generation:', error.message);
        console.log('This might be because the database is not accessible or tables don\'t exist yet.');
        console.log('The system will fall back to random IDs in production.');
    }
    
    console.log('\n✅ ID Generation Test Complete!');
    console.log('\nRecommended formats for your mortuary system:');
    console.log('• MTY-YYMMDD-XXX (e.g., MTY-241201-001) - Compact, date-based');
    console.log('• BODY-YYYY-MMDD-XXX (e.g., BODY-2024-1201-001) - More descriptive');
    console.log('• UUID (e.g., 550e8400-e29b-41d4-a716-446655440000) - Globally unique');
    console.log('• Timestamp (e.g., 20241201143022847) - Sortable by creation time');
}

// Run the test
testUniqueIdGeneration().then(() => {
    console.log('\nTest completed successfully');
    process.exit(0);
}).catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
});