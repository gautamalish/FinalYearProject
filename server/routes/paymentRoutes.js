const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateUser } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Initiate payment for a completed job
router.get('/initiate/:jobId', paymentController.initiatePayment);

// Verify payment from Khalti
router.post('/verify', paymentController.verifyPayment);

// Get payment history for the current user
router.get('/history', paymentController.getPaymentHistory);

// Get payment details
router.get('/:paymentId', paymentController.getPaymentDetails);

module.exports = router;