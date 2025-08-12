# Port and IP Address Update Summary

## Changes Made: Updated to `http://192.168.50.126:3001/` (Backend)

### Backend Changes:
✅ **hodo/backend/server.js**
- Changed: `const PORT = process.env.PORT || 3066;`
- To: `const PORT = process.env.PORT || 3001;`

✅ **hodo/backend/swagger.js**
- Changed: `url: 'http://localhost:3066/api'`
- To: `url: 'http://192.168.50.126:3001/api'`

✅ **hodo/backend/.env**
- Updated: `PORT=3001`
- Updated API base URL configuration

### Frontend Changes:
✅ **hodo/frontend/.env**
- Changed: `VITE_API_URL=http://192.168.50.125:3066//api`
- To: `VITE_API_URL=http://192.168.50.126:3001/api`

✅ **hodo/frontend/src/services/api.ts**
- Changed: `const API_BASE_URL = 'http://192.168.50.133:3066/api';`
- To: `const API_BASE_URL = 'http://192.168.50.126:3001/api';`

### Component Updates (All changed to http://192.168.50.126:3001):
✅ **hodo/frontend/src/pages/AnalyticsPage.tsx**
✅ **hodo/frontend/src/pages/BodyDetailsPage.tsx** (3 instances)
✅ **hodo/frontend/src/components/InwardRegistration.tsx** (3 instances)
✅ **hodo/frontend/src/components/OverviewSection.tsx** (2 instances)
✅ **hodo/frontend/src/components/StorageAllocation.tsx** (9 instances)
✅ **hodo/frontend/src/components/reports/AverageStayDuration.tsx**
✅ **hodo/frontend/src/components/reports/BodyMovementReport.tsx**
✅ **hodo/frontend/src/components/reports/DepartmentDeathLog.tsx** (2 instances)
✅ **hodo/frontend/src/components/reports/OccupancyTrends.tsx**
✅ **hodo/frontend/src/components/reports/PendingVerifications.tsx**

### Documentation Updates:
✅ **hodo/README.md**
- Updated API documentation URL to: `http://192.168.50.126:3001/api-docs`

## Total Changes: 25+ instances updated

### How to Start Services:

**Backend:**
```bash
cd hodo/backend
npm start
# Server will run on http://192.168.50.126:3001
```

**Frontend:**
```bash
cd hodo/frontend
npm run dev
# Will connect to backend at http://192.168.50.126:3001
# Frontend will run on http://192.168.50.126:3066
```

### API Documentation:
- Available at: `http://192.168.50.126:3001/api-docs`

### Status: ✅ ALL UPDATES COMPLETED SUCCESSFULLY