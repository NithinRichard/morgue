-- Add custom ID column to body_details table
-- This script adds a new column for storing unique custom IDs

USE devdb;
GO

-- Check if the column already exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('body_details') AND name = 'BD_Custom_ID')
BEGIN
    -- Add the custom ID column
    ALTER TABLE body_details 
    ADD BD_Custom_ID NVARCHAR(50) NULL;
    
    PRINT 'Added BD_Custom_ID column to body_details table';
END
ELSE
BEGIN
    PRINT 'BD_Custom_ID column already exists in body_details table';
END

-- Create a unique index on the custom ID column for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('body_details') AND name = 'IX_body_details_BD_Custom_ID')
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX IX_body_details_BD_Custom_ID 
    ON body_details (BD_Custom_ID) 
    WHERE BD_Custom_ID IS NOT NULL;
    
    PRINT 'Created unique index on BD_Custom_ID column';
END
ELSE
BEGIN
    PRINT 'Unique index on BD_Custom_ID already exists';
END

-- Create the id_sequences table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='id_sequences' AND xtype='U')
BEGIN
    CREATE TABLE id_sequences (
        id INT IDENTITY(1,1) PRIMARY KEY,
        sequence_type NVARCHAR(20) NOT NULL,
        sequence_date NVARCHAR(8) NOT NULL,
        last_sequence INT NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        UNIQUE(sequence_type, sequence_date)
    );
    
    PRINT 'Created id_sequences table for sequence tracking';
END
ELSE
BEGIN
    PRINT 'id_sequences table already exists';
END

-- Show the updated table structure
PRINT 'Current body_details table structure:';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'body_details'
ORDER BY ORDINAL_POSITION;

PRINT 'Database schema updated successfully!';