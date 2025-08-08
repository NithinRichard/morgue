import express from 'express';
import cors from 'cors';
import dataRoutes from './routes/dataRoutes.js';
import testRoutes from './routes/testRoutes.js';
import { swaggerUi, swaggerSpec } from './swagger.js';
import { connect } from './db/mssql.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for specific origins
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// API Routes
app.use('/api', dataRoutes);
app.use('/api/test', testRoutes); // Test routes for debugging
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Base Route
app.get('/', (req, res) => {
  res.send('Mortuary API Server is running...');
});

// Initialize database connection and start server
async function startServer() {
  try {
    // Initialize database connection pool
    await connect();
    console.log('Database connection pool initialized successfully');
    
    // Start Server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    process.exit(1);
  }
}

startServer();