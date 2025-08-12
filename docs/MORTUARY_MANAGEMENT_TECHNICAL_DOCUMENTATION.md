# Technical Documentation: Mortuary Management Module

## 1. Overview
This module manages bodies, storage allocation, exit processes, billing, and mortuary operations. It supports workflows such as body registration, storage management, verification processes, release procedures, and operational analytics for mortuary planning.

## 2. Database Schema

### Main Tables:
- **Bodies** - Stores body details and registration information
- **StorageUnits** - Stores freezer unit information and status
- **Exits** - Stores body release records and receiver information
- **Billing** - Stores billing records for mortuary services
- **Staff** - Stores staff information and verification records
- **Incidents** - Stores incident type classifications and police involvement

### Sample Table - Bodies Table
| Field | Type | Description |
|-------|------|-------------|
| body_id | UUID/INT | Primary Key |
| name | VARCHAR(100) | Deceased Person Name |
| age | INT | Age at time of death |
| gender | VARCHAR(10) | Gender (male/female) |
| dateOfDeath | DATE | Date of death |
| timeOfDeath | DATETIME | Time of death |
| address | VARCHAR(255) | Address of deceased |
| contactPerson | VARCHAR(100) | Emergency contact person |
| contactNumber | VARCHAR(20) | Emergency contact number |
| incidentType | VARCHAR(50) | Type of incident (natural/accident/homicide/suicide) |
| notes | TEXT | Additional notes |
| belongings | JSON | Array of personal belongings |
| accompanyingPersons | JSON | Array of accompanying persons |
| mlcCase | BOOLEAN | Medico-legal case flag |
| policeInvolved | BOOLEAN | Police involvement flag |
| status | VARCHAR(20) | Status (pending/verified/unverified) |
| storageLocation | VARCHAR(50) | Morgue location |
| registeredBy | VARCHAR(100) | Staff who registered |
| registrationDate | DATETIME | Registration timestamp |
| storageUnit | VARCHAR(10) | Assigned freezer unit |
| riskLevel | VARCHAR(10) | Risk level (low/medium/high) |
| verifiedBy | VARCHAR(100) | Staff who verified |
| exitDate | DATETIME | Date of release (nullable) |
| receiverName | VARCHAR(100) | Name of person receiving body |
| receiverId | VARCHAR(50) | ID of receiver |
| relationship | VARCHAR(50) | Relationship to deceased |

### StorageUnits Table
| Field | Type | Description |
|-------|------|-------------|
| unit_id | UUID/INT | Primary Key |
| unit_number | VARCHAR(10) | Unit identifier (F-01, F-02, etc.) |
| status | VARCHAR(20) | Status (available/occupied/maintenance) |
| temperature | DECIMAL(4,1) | Current temperature in Celsius |
| body_id | UUID/INT | Currently assigned body (nullable) |
| last_maintenance | DATETIME | Last maintenance date |
| capacity | VARCHAR(20) | Unit capacity |

### Exits Table
| Field | Type | Description |
|-------|------|-------------|
| exit_id | UUID/INT | Primary Key |
| body_id | UUID/INT | Foreign key to Bodies |
| receiverName | VARCHAR(100) | Name of person receiving |
| receiverId | VARCHAR(50) | ID of receiver |
| relationship | VARCHAR(50) | Relationship to deceased |
| releaseTime | DATETIME | Time of release |
| remarks | TEXT | Additional remarks |
| exitDate | DATETIME | Exit timestamp |
| processedBy | VARCHAR(100) | Staff who processed exit |

### Billing Table
| Field | Type | Description |
|-------|------|-------------|
| bill_id | UUID/INT | Primary Key |
| body_id | UUID/INT | Foreign key to Bodies |
| service_type | VARCHAR(50) | Type of service (storage/transport/etc.) |
| amount | DECIMAL(10,2) | Billing amount |
| bill_date | DATE | Billing date |
| due_date | DATE | Due date |
| status | VARCHAR(20) | Status (pending/paid/overdue) |
| notes | TEXT | Additional notes |

## 3. Special Data Needed by the Frontend Workflows

### Dashboard Example:
- **Aggregated body status** (verified, pending, unverified)
- **Storage capacity utilization** (occupied vs available units)
- **Recent registrations** (last 7 days)
- **Upcoming releases** (scheduled exits)
- **Risk level distribution** (high/medium/low risk bodies)
- **Incident type statistics** (natural/accident/homicide/suicide)
- **MLC case summary** (medico-legal cases)
- **Police involvement tracking**

### Storage Management:
- **Unit availability grid** (real-time status of all 30 units)
- **Temperature monitoring** (current temperatures of all units)
- **Duration tracking** (how long bodies have been in storage)
- **Capacity planning** (projected availability)

### Exit Management:
- **Pending verifications** (bodies awaiting verification)
- **Release queue** (bodies ready for release)
- **Receiver verification** (ID validation workflow)

## 4. Current Data Structure

Based on the existing `db.json` mock data:
```json
{
  "bodies": [
    {
      "id": "B001",
      "name": "Person Name",
      "age": "25",
      "gender": "male",
      "dateOfDeath": "2025-07-01",
      "timeOfDeath": "2025-07-01T16:00",
      "address": "Address",
      "contactPerson": "Contact Person",
      "contactNumber": "9000000001",
      "incidentType": "natural",
      "notes": "",
      "belongings": ["ring", "watch"],
      "accompanyingPersons": [
        {
          "name": "Companion Name",
          "contact": "8000000001"
        }
      ],
      "mlcCase": false,
      "policeInvolved": false,
      "status": "verified",
      "storageLocation": "Morgue A",
      "registeredBy": "Staff",
      "registrationDate": "2025-07-01T09:00:00Z",
      "storageUnit": "F-01",
      "riskLevel": "low",
      "verifiedBy": "Staff"
    }
  ],
  "exits": [
    {
      "id": "B001",
      "name": "Person Name",
      "receiverName": "Receiver Name",
      "receiverId": "ID123",
      "relationship": "parent",
      "releaseTime": "2025-07-01T17:00",
      "remarks": "",
      "exitDate": "2025-07-01T08:27:53.460Z"
    }
  ]
}
```

## 5. Simple CRUD API Endpoints

### Bodies:
- `GET /api/bodies` - List all bodies
- `POST /api/bodies` - Add a new body
- `GET /api/bodies/:id` - Get body details
- `PATCH /api/bodies/:id` - Update body
- `DELETE /api/bodies/:id` - Delete body
- `POST /api/bodies/:id/verify` - Verify body

### Storage Units:
- `GET /api/storage-units` - List all storage units
- `GET /api/storage-units/:id` - Get unit details
- `PATCH /api/storage-units/:id` - Update unit status
- `GET /api/storage-units/available` - Get available units

### Exits:
- `GET /api/exits` - List all exit records
- `POST /api/exits/:bodyId` - Process body exit
- `GET /api/exits/:id` - Get exit record details

### Billing:
- `GET /api/billing` - List all billing records
- `POST /api/billing` - Create new bill
- `GET /api/billing/:id` - Get bill details
- `PUT /api/billing/:id` - Update bill
- `DELETE /api/billing/:id` - Delete bill

## 6. Special Data Endpoints

### Reports/Analytics:
- `GET /api/reports/dashboard` - Dashboard summary data
- `GET /api/reports/storage-utilization` - Storage capacity analysis
- `GET /api/reports/incident-statistics?from=YYYY-MM-DD&to=YYYY-MM-DD` - Incident type distribution
- `GET /api/reports/mlc-cases` - Medico-legal case summary
- `GET /api/reports/risk-analysis` - Risk level distribution
- `GET /api/reports/exit-summary?from=YYYY-MM-DD&to=YYYY-MM-DD` - Exit statistics

### Storage Management:
- `GET /api/storage-units/grid` - Real-time storage grid status
- `GET /api/storage-units/temperature` - Current temperature readings
- `GET /api/storage-units/duration-analysis` - Body storage duration analysis

### Workflow Endpoints:
- `GET /api/workflows/pending-verifications` - Bodies awaiting verification
- `GET /api/workflows/release-queue` - Bodies ready for release
- `POST /api/workflows/assign-unit/:bodyId` - Assign storage unit to body

## 7. Request and Response JSON Examples

### Create Body Request:
```json
{
  "name": "John Doe",
  "age": "45",
  "gender": "male",
  "dateOfDeath": "2025-01-15",
  "timeOfDeath": "2025-01-15T14:30:00",
  "address": "123 Main St, City",
  "contactPerson": "Jane Doe",
  "contactNumber": "9876543210",
  "incidentType": "natural",
  "notes": "Natural causes",
  "belongings": ["watch", "ring"],
  "accompanyingPersons": [
    {
      "name": "Jane Doe",
      "contact": "9876543210"
    }
  ],
  "mlcCase": false,
  "policeInvolved": false,
  "status": "pending",
  "storageLocation": "Morgue A",
  "registeredBy": "Dr. Smith",
  "storageUnit": "F-01",
  "riskLevel": "low"
}
```

### Create Body Response:
```json
{
  "id": "B001",
  "name": "John Doe",
  "age": "45",
  "gender": "male",
  "dateOfDeath": "2025-01-15",
  "timeOfDeath": "2025-01-15T14:30:00",
  "address": "123 Main St, City",
  "contactPerson": "Jane Doe",
  "contactNumber": "9876543210",
  "incidentType": "natural",
  "notes": "Natural causes",
  "belongings": ["watch", "ring"],
  "accompanyingPersons": [
    {
      "name": "Jane Doe",
      "contact": "9876543210"
    }
  ],
  "mlcCase": false,
  "policeInvolved": false,
  "status": "pending",
  "storageLocation": "Morgue A",
  "registeredBy": "Dr. Smith",
  "registrationDate": "2025-01-15T10:00:00Z",
  "storageUnit": "F-01",
  "riskLevel": "low"
}
```

### Dashboard Response:
```json
{
  "summary": {
    "totalBodies": 150,
    "verifiedBodies": 120,
    "pendingBodies": 20,
    "unverifiedBodies": 10,
    "occupiedUnits": 25,
    "availableUnits": 5,
    "highRiskBodies": 15,
    "mlcCases": 8
  },
  "recentActivities": [
    {
      "id": "B001",
      "action": "registered",
      "timestamp": "2025-01-15T10:00:00Z",
      "bodyName": "John Doe"
    }
  ],
  "storageGrid": [
    {
      "unitId": "F-01",
      "status": "occupied",
      "bodyId": "B001",
      "temperature": -18.5,
      "duration": 24
    }
  ]
}
```

## 8. Impact of This Change in Overall System

### Billing Integration:
- **Storage charges**: Daily/weekly storage fees can be automatically calculated and billed
- **Transportation costs**: If ambulance/transport services are used, costs can be linked to patient billing
- **Service fees**: Verification, documentation, and release processing fees
- **Insurance claims**: If mortuary services are covered by insurance, integration with insurance modules

### Asset Management:
- **Freezer maintenance**: If storage units malfunction, it impacts capacity and may require emergency transfers
- **Equipment tracking**: Temperature monitoring systems, security equipment status
- **Inventory management**: Personal belongings, documentation materials

### EMR Integration:
- **Patient records**: If deceased were patients, link to medical records
- **Doctor notifications**: Notify attending physicians of patient death
- **Family communication**: Track family notifications and communications
- **Legal documentation**: Integration with legal/administrative workflows

### Compliance & Reporting:
- **Regulatory reporting**: Death certificates, incident reports
- **Audit trails**: Complete tracking of all mortuary operations
- **Document management**: Centralized storage of all mortuary-related documents
- **Police coordination**: MLC cases and police investigation coordination

### System Notifications:
- **Storage alerts**: Unit temperature deviations, capacity warnings
- **Verification reminders**: Bodies pending verification
- **Release notifications**: Scheduled releases and family communications
- **Maintenance alerts**: Equipment maintenance schedules

## 9. Module Activation/Deactivation & Integration with Hodo

### Activation:
- Enable module via system settings or feature flag
- Register routes and menu items in the main app
- Initialize database tables and default data
- Configure storage unit grid (30 units by default)
- Set up notification systems for mortuary-specific alerts

### Deactivation:
- Hide/remove UI elements from navigation
- Disable API endpoints gracefully
- Ensure no hard dependencies in Hodo core
- Archive mortuary data for compliance requirements
- Maintain audit trails even when module is disabled

### Integration Points:

#### With Hodo Core:
- **Shared authentication**: Use existing user management system
- **Role-based access**: Mortuary staff roles and permissions
- **Notification system**: Integrate with existing notification framework
- **Audit logging**: Use centralized audit system
- **Document management**: Integrate with existing document storage

#### Without Module:
- Hodo core should gracefully handle absence
- Hide mortuary-related features from navigation
- Skip mortuary checks in patient workflows
- Maintain system stability without mortuary dependencies

#### Fail-Safe Mechanisms:
- All database joins should use LEFT JOINs to avoid failures
- Null checks for all mortuary-related data
- Graceful degradation when mortuary services are unavailable
- Fallback workflows for critical operations

### Configuration Options:
```json
{
  "mortuary": {
    "enabled": true,
    "storageUnits": 30,
    "autoAssignment": true,
    "temperatureMonitoring": true,
    "mlcWorkflow": true,
    "billingIntegration": true,
    "notificationAlerts": true
  }
}
```

## 10. System Testing

### Unit Tests:
- All API endpoints (CRUD operations)
- Data validation and business logic
- Error handling and edge cases
- Authentication and authorization

### Integration Tests:
- End-to-end body registration workflow
- Storage allocation and management
- Verification and release processes
- Billing integration
- Notification systems

### UI Tests:
- Dashboard functionality
- Form validations and submissions
- Storage grid interactions
- Modal dialogs and confirmations
- Responsive design testing

### Failover Tests:
- System behavior with module enabled/disabled
- Database connection failures
- API endpoint failures
- Storage unit malfunctions
- Temperature monitoring failures

### Performance Tests:
- Large dataset handling (1000+ bodies)
- Concurrent user access
- Real-time storage grid updates
- Report generation performance

### Security Tests:
- Data access controls
- Audit trail integrity
- Sensitive data protection
- API endpoint security

## 11. Null Value Handling

### Frontend Null Handling:
- Empty state displays for empty arrays
- Loading states during API calls
- Error boundaries for failed requests
- Default values for missing data
- Graceful degradation for partial data

### Backend Null Handling:
- Database constraints and default values
- API response validation
- Error responses for missing data
- Transaction rollback on failures
- Logging for debugging null issues

### Data Validation:
- Required field validation
- Data type validation
- Business rule validation
- Cross-field validation
- External data validation (ID numbers, phone numbers)

## 12. MS SQL Server Considerations

### Primary Keys:
- Use IDENTITY columns for auto-incrementing IDs
- UUID/GUID for distributed systems
- Composite keys where appropriate

### Indexes:
- Primary key indexes (automatic)
- Foreign key indexes for joins
- Composite indexes for common queries
- Covering indexes for dashboard queries
- Filtered indexes for status-based queries

### Performance Optimization:
- Query optimization for large datasets
- Stored procedures for complex operations
- Table partitioning for historical data
- Full-text search for name searches
- Caching strategies for frequently accessed data 