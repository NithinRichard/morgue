export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  // Basic token validation - replace with proper JWT validation
  if (token !== process.env.API_TOKEN && token !== 'dev-token') {
    return res.status(403).json({ error: 'Invalid token.' });
  }
  
  next();
};