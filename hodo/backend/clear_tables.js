// Node.js script to clear database tables
// Run this from the backend directory: node clear_tables.js

import sql from 'mssql';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const config = {
    user: process.env.MSSQL_USER,
    password: process.env.MSSQL_PASSWORD,
    server: process.env.MSSQL_SERVER,
    database: process.env.MSSQL_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function clearTables() {
    try {
        console.log('🔌 Connecting to database...');
        console.log(`Server: ${config.server}`);
        console.log(`Database: ${config.database}`);

        await sql.connect(config);
        console.log('✅ Connected to database successfully!');

        // Clear tables in the correct order to handle foreign key constraints
        const tables = [
            { name: 'exit_bodies', description: 'Exit Bodies' },
            { name: 'storage_allocation', description: 'Storage Allocations' }
        ];

        // Try different possible names for the bodies table
        const possibleBodyTableNames = [
            'bodies',
            'body_details',
            'Body_Details',
            'BODY_DETAILS',
            'body_master',
            'Body_Master',
            'BODY_MASTER'
        ];

        for (const table of tables) {
            try {
                console.log(`🗑️  Clearing ${table.description} table...`);

                // First check if table exists and get row count
                const countResult = await sql.query(`
                    SELECT COUNT(*) as count 
                    FROM ${table.name}
                `);

                const rowCount = countResult.recordset[0].count;
                console.log(`   Found ${rowCount} rows in ${table.name}`);

                if (rowCount > 0) {
                    // Clear the table
                    await sql.query(`DELETE FROM ${table.name}`);
                    console.log(`   ✅ Cleared ${rowCount} rows from ${table.name}`);
                } else {
                    console.log(`   ℹ️  Table ${table.name} is already empty`);
                }

            } catch (tableError) {
                console.error(`   ❌ Error clearing ${table.name}:`, tableError.message);
            }
        }

        // Try to find and clear the bodies table
        console.log('🔍 Looking for bodies table...');
        let bodiesTableFound = false;

        for (const tableName of possibleBodyTableNames) {
            try {
                const countResult = await sql.query(`
                    SELECT COUNT(*) as count 
                    FROM ${tableName}
                `);

                const rowCount = countResult.recordset[0].count;
                console.log(`🗑️  Found bodies table: ${tableName} with ${rowCount} rows`);

                if (rowCount > 0) {
                    await sql.query(`DELETE FROM ${tableName}`);
                    console.log(`   ✅ Cleared ${rowCount} rows from ${tableName}`);
                } else {
                    console.log(`   ℹ️  Table ${tableName} is already empty`);
                }

                bodiesTableFound = true;
                break;

            } catch (tableError) {
                // Table doesn't exist, continue to next possibility
                continue;
            }
        }

        if (!bodiesTableFound) {
            console.log('⚠️  Bodies table not found with any of the expected names');
            console.log('   Tried:', possibleBodyTableNames.join(', '));
        }

        // Optional: Reset identity columns if they exist
        console.log('🔄 Resetting identity columns...');
        try {
            await sql.query(`
                IF EXISTS (SELECT * FROM sys.identity_columns WHERE object_id = OBJECT_ID('bodies'))
                    DBCC CHECKIDENT ('bodies', RESEED, 0);
                    
                IF EXISTS (SELECT * FROM sys.identity_columns WHERE object_id = OBJECT_ID('storage_allocation'))
                    DBCC CHECKIDENT ('storage_allocation', RESEED, 0);
                    
                IF EXISTS (SELECT * FROM sys.identity_columns WHERE object_id = OBJECT_ID('exit_bodies'))
                    DBCC CHECKIDENT ('exit_bodies', RESEED, 0);
            `);
            console.log('✅ Identity columns reset successfully');
        } catch (identityError) {
            console.log('ℹ️  Identity reset not needed or failed:', identityError.message);
        }

        console.log('');
        console.log('🎉 All tables cleared successfully!');
        console.log('Tables affected:');
        console.log('  - exit_bodies');
        console.log('  - storage_allocation');
        console.log('  - bodies');

    } catch (error) {
        console.error('❌ Database operation failed:', error.message);
        console.error('');
        console.error('Make sure:');
        console.error('1. SQL Server is running and accessible');
        console.error('2. Database credentials in .env are correct');
        console.error('3. Database "devdb" exists');
        console.error('4. Tables exist in the database');
    } finally {
        try {
            await sql.close();
            console.log('🔌 Database connection closed');
        } catch (closeError) {
            console.error('Error closing connection:', closeError.message);
        }
    }
}

// Run the script
clearTables().then(() => {
    console.log('Script completed');
    process.exit(0);
}).catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
});