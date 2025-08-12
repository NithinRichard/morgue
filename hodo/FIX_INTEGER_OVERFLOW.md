# Fix for Patient ID Integer Overflow Issue

## Problem
The application was throwing an error when trying to add a body with a large patient ID:
```
The conversion of the varchar value '250729103300' overflowed an int column.
```

## Root Cause
The database column `BD_Patient_FK` in the `body_details` table is defined as `INT`, which has a maximum value of 2,147,483,647. Patient IDs like '250729103300' exceed this limit.

## Solutions Implemented

### 1. Input Validation (Immediate Fix)
Added validation in the `addBody` controller to prevent patient IDs that exceed the INT maximum:

```javascript
// Validate patientId to prevent integer overflow
if (req.body.patientId) {
  const maxIntValue = 2147483647; // Maximum value for INT in SQL Server
  const patientIdNum = Number(req.body.patientId);
  if (patientIdNum > maxIntValue) {
    return res.status(400).json({
      error: 'Patient ID too large',
      details: `Patient ID ${req.body.patientId} exceeds maximum allowed value (${maxIntValue}). Please contact system administrator to update database schema.`
    });
  }
}
```

### 2. Database Schema Fix (Permanent Solution)
Execute this SQL command to change the column type from INT to BIGINT:

```sql
ALTER TABLE body_details ALTER COLUMN BD_Patient_FK BIGINT;
```

This SQL command has been saved in `alter_patient_fk.sql` for your convenience.

### 3. Code Updates
- Updated MSSQL module to use `sql.Int` with proper parsing
- Removed `BigInt` conversion in controller since database column is still INT for now
- Added proper error handling and user-friendly error messages

## Recommended Next Steps

1. **Execute the database schema change:**
   ```bash
   # Connect to your SQL Server and run:
   # ALTER TABLE body_details ALTER COLUMN BD_Patient_FK BIGINT;
   ```

2. **Update the code after schema change:**
   ```javascript
   // In api/db/mssql.js, change back to:
   .input('patientId', sql.BigInt, bodyData.patientId || null)
   ```

3. **Remove the validation if no longer needed:**
   After changing to BIGINT, you can remove the maxIntValue validation since BIGINT can handle much larger values (up to 9,223,372,036,854,775,807).

## Testing
Test with patient IDs both within and exceeding the INT range:
- Valid: 1234567890 (should work)
- Invalid: 250729103300 (should show validation error until schema is updated)

## Files Modified
- `api/controllers/dataController.js` - Added validation logic
- `api/db/mssql.js` - Updated to use sql.Int with parsing
- `alter_patient_fk.sql` - Database schema fix command
