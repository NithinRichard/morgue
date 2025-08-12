// Simple ID generation service that works without database dependency
// This can be used immediately while the database integration is being set up

import { 
    generateUUID, 
    generateMortuaryID, 
    generateTimestampID,
    generateRandomAlphanumeric
} from '../utils/idGenerator.js';

export class SimpleIdService {
    
    /**
     * Generate a unique body ID using the recommended MTY format
     * This version uses random numbers instead of database sequences
     */
    static generateUniqueBodyId() {
        // Use MTY format with random 3-digit number
        return generateMortuaryID();
    }
    
    /**
     * Generate multiple unique IDs at once
     */
    static generateMultipleIds(count = 1) {
        const ids = [];
        const usedIds = new Set();
        
        while (ids.length < count) {
            const id = this.generateUniqueBodyId();
            if (!usedIds.has(id)) {
                usedIds.add(id);
                ids.push(id);
            }
        }
        
        return ids;
    }
    
    /**
     * Generate ID with specific format
     */
    static generateIdWithFormat(format = 'MTY') {
        switch (format.toUpperCase()) {
            case 'UUID':
                return generateUUID();
            case 'MTY':
                return generateMortuaryID();
            case 'TIMESTAMP':
                return generateTimestampID();
            case 'RANDOM':
                return generateRandomAlphanumeric(8);
            default:
                return generateMortuaryID();
        }
    }
    
    /**
     * Validate ID format
     */
    static validateId(id, format = 'MTY') {
        const patterns = {
            'MTY': /^MTY-\d{6}-\d{3}$/,
            'UUID': /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
            'TIMESTAMP': /^\d{17}$/,
            'RANDOM': /^[A-Z0-9]{8}$/
        };
        
        return patterns[format] ? patterns[format].test(id) : false;
    }
    
    /**
     * Extract date from MTY format ID
     */
    static extractDateFromMtyId(id) {
        const match = id.match(/^MTY-(\d{2})(\d{2})(\d{2})-\d{3}$/);
        if (match) {
            const [, year, month, day] = match;
            return new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        return null;
    }
    
    /**
     * Get ID statistics (simple version)
     */
    static getIdInfo(id) {
        if (this.validateId(id, 'MTY')) {
            const date = this.extractDateFromMtyId(id);
            const sequence = id.split('-')[2];
            return {
                format: 'MTY',
                date: date ? date.toDateString() : null,
                sequence: sequence,
                valid: true
            };
        } else if (this.validateId(id, 'UUID')) {
            return {
                format: 'UUID',
                valid: true
            };
        } else {
            return {
                format: 'Unknown',
                valid: false
            };
        }
    }
}

export default SimpleIdService;