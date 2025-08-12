USE devdb;

PRINT 'Starting status flag column update...';

-- Check if the column exists
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'body_details' AND COLUMN_NAME = 'BD_Status_Flag')
BEGIN
    PRINT 'BD_Status_Flag column exists. Updating data type and values...';
    
    -- First, update existing values: 1 -> 10 (active), 0 -> 0 (inactive)
    UPDATE body_details 
    SET BD_Status_Flag = 10 
    WHERE BD_Status_Flag = 1;
    
    PRINT 'Updated existing active records (1 -> 10)';
    
    -- Drop the default constraint if it exists
    DECLARE @ConstraintName NVARCHAR(200)
    SELECT @ConstraintName = dc.name
    FROM sys.default_constraints dc
    INNER JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE c.object_id = OBJECT_ID('body_details') AND c.name = 'BD_Status_Flag'
    
    IF @ConstraintName IS NOT NULL
    BEGIN
        EXEC('ALTER TABLE body_details DROP CONSTRAINT ' + @ConstraintName)
        PRINT 'Dropped default constraint: ' + @ConstraintName
    END
    
    -- Now alter the column to int
    ALTER TABLE body_details 
    ALTER COLUMN BD_Status_Flag INT;
    
    PRINT 'Changed BD_Status_Flag column from bit to int';
    
    -- Add new default constraint
    ALTER TABLE body_details 
    ADD CONSTRAINT DF_body_details_BD_Status_Flag DEFAULT 10 FOR BD_Status_Flag;
    
    PRINT 'Added new default constraint with value 10';
    
    -- Verify the changes
    SELECT 
        BD_Status_Flag,
        COUNT(*) as Count
    FROM body_details 
    GROUP BY BD_Status_Flag;
    
    PRINT 'Status flag update completed successfully!';
END
ELSE
BEGIN
    PRINT 'BD_Status_Flag column does not exist. Creating it...';
    
    -- Add the column as int with default value 10 (active)
    ALTER TABLE body_details 
    ADD BD_Status_Flag INT DEFAULT 10;
    
    PRINT 'Created BD_Status_Flag column as int with default value 10';
END

PRINT 'Script completed!'; 