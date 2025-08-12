# Mortuary Management System

This project is structured with separate frontend and backend components for better organization and maintainability.

## Project Structure

```
hodo/
├── frontend/           # React/Vue frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/            # Node.js/Express backend API
│   ├── controllers/    # API route controllers
│   ├── models/         # Data models and schemas
│   ├── routes/         # API route definitions
│   ├── db/            # Database connection and queries
│   ├── server.js      # Main server file
│   ├── package.json
│   └── .env
└── api/               # Legacy API folder (to be deprecated)
```

## Backend Structure

The backend follows a clean layered architecture pattern:

- **controllers/**: HTTP request/response handling only
  - `dataController.js` - Main API endpoints for bodies, exits, analytics
  
- **services/**: Business logic layer (⭐ NEW!)
  - `BodyService.js` - Body management business logic
  - `ExitService.js` - Exit/release processing logic
  - `AnalyticsService.js` - Analytics and reporting logic
  - `index.js` - Services export hub
  
- **models/**: Data models with validation and database mapping
  - `Body.js` - Body/deceased person model
  - `Exit.js` - Exit/release record model
  - `StorageAllocation.js` - Storage unit allocation model
  
- **routes/**: API route definitions
  - `dataRoutes.js` - Main API routes
  - `testRoutes.js` - Test and debug routes
  
- **db/**: Database layer
  - `index.js` - Database abstraction layer
  - `mssql.js` - SQL Server database operations
  - `schema.sql` - Database schema

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd hodo/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   DB_BACKEND=mssql
   MSSQL_USER=your_username
   MSSQL_PASSWORD=your_password
   MSSQL_SERVER=your_server
   MSSQL_DATABASE=your_database
   DATA_SOURCE=mssql
   ```

4. Start the server:
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd hodo/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

The API documentation is available at `http://192.168.50.126:3001/api-docs` when the backend server is running.

## Features

- **Body Management**: Register, track, and manage deceased bodies
- **Storage Allocation**: Assign and track storage units
- **Exit Processing**: Handle body releases and exits
- **Analytics**: Generate reports and analytics
- **Patient Integration**: Link with hospital patient records

## Database

The system supports SQL Server (MSSQL) as the primary database with a fallback to JSON file storage for development.

## Migration Notes

This new structure replaces the previous `api/` folder structure. The old structure is maintained for backward compatibility but should be migrated to use the new `backend/` structure.