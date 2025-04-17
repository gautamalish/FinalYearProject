const admin = require('firebase-admin');
const User = require('../models/UserModel');

// Middleware to authenticate users using Firebase token
exports.authenticateUser = async (req, res, next) => {
  try {
    // Check if authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // Extract the token
    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Find the user in our database
    const user = await User.findOne({ firebaseUID: decodedToken.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Attach the user to the request object
    req.user = user;
    req.firebaseUser = decodedToken;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Middleware to check if user is an admin
exports.isAdmin = async (req, res, next) => {
  try {
    // Check if user exists and has admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to check if user is a worker
exports.isWorker = async (req, res, next) => {
  try {
    // Check if user exists and has worker role
    if (!req.user || req.user.role !== 'worker') {
      return res.status(403).json({ message: 'Forbidden: Worker access required' });
    }
    
    next();
  } catch (error) {
    console.error('Worker authorization error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};