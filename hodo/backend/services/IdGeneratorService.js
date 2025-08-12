// Service for generating unique IDs with database sequence tracking
import sql from 'mssql';
import { 
    generateUUID, 
    generateBodyID, 
    generateMortuaryID, 
    generateTimestampID,
    generateRandomAlphanumeric,
    generateShortUniqueID,
    generateHospitalStyleID
} from '../utils/idGenerator.js';

export class IdGeneratorService {
    constructor() {
        this.config = {
            user: process.env.MSSQL_USER,
            password: process.env.MSSQL_PASSWORD,
            server: process.env.MSSQL_SERVER,
            database: process.env.MSSQL_DATABASE,
            options: {
                encrypt: false,
                trustServerCertificate: true
            }
        };
    }

    /**
     * Get the next sequence number for a specific date and type
     */
    async getNextSequenceNumber(date = new Date(), type = 'BODY') {
        try {
            const pool = await sql.connect(this.config);
            
            const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
            
            // Check if sequence table exists, create if not
            await pool.request().query(`
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='id_sequences' AND xtype='U')
                CREATE TABLE id_sequences (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    sequence_type NVARCHAR(20) NOT NULL,
                    sequence_date NVARCHAR(8) NOT NULL,
                    last_sequence INT NOT NULL DEFAULT 0,
                    created_at DATETIME DEFAULT GETDATE(),
                    updated_at DATETIME DEFAULT GETDATE(),
                    UNIQUE(sequence_type, sequence_date)
                )
            `);

            // Get or create sequence for this date and type
            const result = await pool.request()
                .input('type', sql.NVarChar(20), type)
                .input('date', sql.NVarChar(8), dateStr)
                .query(`
                    MERGE id_sequences AS target
                    USING (SELECT @type AS sequence_type, @date AS sequence_date) AS source
                    ON target.sequence_type = source.sequence_type AND target.sequence_date = source.sequence_date
                    WHEN MATCHED THEN
                        UPDATE SET last_sequence = last_sequence + 1, updated_at = GETDATE()
                    WHEN NOT MATCHED THEN
                        INSERT (sequence_type, sequence_date, last_sequence) VALUES (@type, @date, 1)
                    OUTPUT INSERTED.last_sequence, COALESCE(DELETED.last_sequence + 1, 1) AS next_sequence;
                `);

            await pool.close();

            if (result.recordset.length > 0) {
                return result.recordset[0].next_sequence || result.recordset[0].last_sequence;
            }
            
            return 1;
        } catch (error) {
            console.error('Error getting next sequence number:', error);
            // Fallback to random number if database fails
            return Math.floor(Math.random() * 900) + 100;
        }
    }

    /**
     * Generate a unique body ID with proper sequence tracking
     */
    async generateUniqueBodyID(format = 'MTY') {
        const date = new Date();
        
        switch (format.toUpperCase()) {
            case 'UUID':
                return generateUUID();
                
            case 'BODY':
                const bodySequence = await this.getNextSequenceNumber(date, 'BODY');
                return generateBodyID(bodySequence);
                
            case 'MTY':
                const mtySequence = await this.getNextSequenceNumber(date, 'MTY');
                return generateMortuaryID(mtySequence);
                
            case 'TIMESTAMP':
                return generateTimestampID();
                
            case 'RANDOM':
                return generateRandomAlphanumeric(8);
                
            case 'SHORT':
                return generateShortUniqueID(8);
                
            case 'HOSPITAL':
                const hospSequence = await this.getNextSequenceNumber(date, 'HSP');
                return generateHospitalStyleID('HSP');
                
            default:
                const defaultSequence = await this.getNextSequenceNumber(date, 'MTY');
                return generateMortuaryID(defaultSequence);
        }
    }

    /**
     * Check if an ID already exists in the database
     */
    async isIdUnique(id, tableName = 'body_details', columnName = 'BD_Custom_ID') {
        try {
            const pool = await sql.connect(this.config);
            
            const result = await pool.request()
                .input('id', sql.NVarChar(50), id)
                .query(`SELECT COUNT(*) as count FROM ${tableName} WHERE ${columnName} = @id`);
            
            await pool.close();
            
            return result.recordset[0].count === 0;
        } catch (error) {
            console.error('Error checking ID uniqueness:', error);
            return false;
        }
    }

    /**
     * Generate a guaranteed unique ID (with retry logic)
     */
    async generateGuaranteedUniqueID(format = 'MTY', maxRetries = 5) {
        for (let i = 0; i < maxRetries; i++) {
            const id = await this.generateUniqueBodyID(format);
            
            if (await this.isIdUnique(id)) {
                return id;
            }
            
            console.log(`ID ${id} already exists, retrying... (${i + 1}/${maxRetries})`);
        }
        
        // If all retries failed, use UUID as fallback
        console.warn('Max retries reached, falling back to UUID');
        return generateUUID();
    }

    /**
     * Get statistics about generated IDs
     */
    async getIdStatistics() {
        try {
            const pool = await sql.connect(this.config);
            
            const result = await pool.request().query(`
                SELECT 
                    sequence_type,
                    sequence_date,
                    last_sequence,
                    created_at,
                    updated_at
                FROM id_sequences 
                ORDER BY sequence_type, sequence_date DESC
            `);
            
            await pool.close();
            
            return result.recordset;
        } catch (error) {
            console.error('Error getting ID statistics:', error);
            return [];
        }
    }
}

// Export singleton instance
export default new IdGeneratorService();