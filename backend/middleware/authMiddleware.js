// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pickle_secret_key_123');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Session expired or invalid token' });
  }
};

module.exports = { verifyAdmin };