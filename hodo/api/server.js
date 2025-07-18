import express from 'express';
import cors from 'cors';
import dataRoutes from './routes/dataRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3066',
    'http://192.168.50.125:3066',
    'http://192.168.50.132:3066',
    'http://192.168.50.124:3001',
    'http://192.168.50.124:3066'
  ]
})); // Enable CORS for specific origins
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded



// API Routes
app.use('/api', dataRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('Mortuary API Server is running...');
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
}); 



