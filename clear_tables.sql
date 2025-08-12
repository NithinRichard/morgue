-- Clear all data from bodies, storage_allocation, and exit_bodies tables
-- Execute these commands in the correct order to handle foreign key constraints

USE devdb;
GO

-- Disable foreign key constraints temporarily (optional, for safety)
-- ALTER TABLE storage_allocation NOCHECK CONSTRAINT ALL;
-- ALTER TABLE exit_bodies NOCHECK CONSTRAINT ALL;
-- ALTER TABLE bodies NOCHECK CONSTRAINT ALL;

-- Clear exit_bodies table first (likely has foreign keys to other tables)
DELETE FROM exit_bodies;
PRINT 'Cleared exit_bodies table';

-- Clear storage_allocation table (likely has foreign key to bodies)
DELETE FROM storage_allocation;
PRINT 'Cleared storage_allocation table';

-- Clear bodies table last (likely referenced by other tables)
DELETE FROM bodies;
PRINT 'Cleared bodies table';

-- Re-enable foreign key constraints (if disabled above)
-- ALTER TABLE storage_allocation CHECK CONSTRAINT ALL;
-- ALTER TABLE exit_bodies CHECK CONSTRAINT ALL;
-- ALTER TABLE bodies CHECK CONSTRAINT ALL;

-- Reset identity columns if they exist
-- DBCC CHECKIDENT ('bodies', RESEED, 0);
-- DBCC CHECKIDENT ('storage_allocation', RESEED, 0);
-- DBCC CHECKIDENT ('exit_bodies', RESEED, 0);

PRINT 'All tables cleared successfully!';