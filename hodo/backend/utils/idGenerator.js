// Utility functions for generating unique IDs for bodies
import crypto from 'crypto';

/**
 * Generate a UUID (Universally Unique Identifier)
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * Example: 550e8400-e29b-41d4-a716-446655440000
 */
export function generateUUID() {
    return crypto.randomUUID();
}

/**
 * Generate a custom body ID with format: BODY-YYYY-MMDD-XXX
 * Example: BODY-2024-1201-001
 */
export function generateBodyID(sequenceNumber = null) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // If no sequence number provided, generate a random 3-digit number
    const sequence = sequenceNumber ? 
        String(sequenceNumber).padStart(3, '0') : 
        String(Math.floor(Math.random() * 900) + 100);
    
    return `BODY-${year}-${month}${day}-${sequence}`;
}

/**
 * Generate a mortuary-specific ID with format: MTY-YYMMDD-XXX
 * Example: MTY-241201-001
 */
export function generateMortuaryID(sequenceNumber = null) {
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2); // Last 2 digits of year
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    const sequence = sequenceNumber ? 
        String(sequenceNumber).padStart(3, '0') : 
        String(Math.floor(Math.random() * 900) + 100);
    
    return `MTY-${year}${month}${day}-${sequence}`;
}

/**
 * Generate a timestamp-based ID
 * Format: YYYYMMDDHHMMSS + random 3 digits
 * Example: 20241201143022847
 */
export function generateTimestampID() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}${random}`;
}

/**
 * Generate a random alphanumeric ID
 * Example: B7X9K2M4
 */
export function generateRandomAlphanumeric(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Generate a short unique ID using crypto
 * Example: 7X9K2M4P
 */
export function generateShortUniqueID(length = 8) {
    const bytes = crypto.randomBytes(Math.ceil(length * 3 / 4));
    return bytes.toString('base64')
        .replace(/[+/]/g, '')
        .substring(0, length)
        .toUpperCase();
}

/**
 * Generate a hospital-style ID with prefix
 * Format: PREFIX-YYYYMMDD-HHMMSS-RRR
 * Example: HSP-20241201-143022-847
 */
export function generateHospitalStyleID(prefix = 'HSP') {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    
    return `${prefix}-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
}

/**
 * Get the next sequence number for a given date (requires database query)
 * This would be used with generateBodyID or generateMortuaryID
 */
export async function getNextSequenceNumber(date = new Date()) {
    // This would typically query the database to find the highest sequence number for the given date
    // For now, return a random number, but in production you'd want to implement proper sequence tracking
    return Math.floor(Math.random() * 900) + 100;
}

/**
 * Validate if an ID follows a specific format
 */
export function validateBodyID(id, format = 'BODY') {
    const patterns = {
        'BODY': /^BODY-\d{4}-\d{4}-\d{3}$/,
        'MTY': /^MTY-\d{6}-\d{3}$/,
        'UUID': /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        'TIMESTAMP': /^\d{17}$/,
        'ALPHANUMERIC': /^[A-Z0-9]{8}$/
    };
    
    return patterns[format] ? patterns[format].test(id) : false;
}

// Export default function that returns the preferred ID format
export default function generateUniqueBodyID() {
    // You can change this to use any of the above functions
    return generateMortuaryID(); // Using MTY-YYMMDD-XXX format as default
}