const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticateUser } = require("../middleware/auth");

// Apply authentication middleware to all payment routes
router.use(authenticateUser);

// Create a payment intent with Stripe
router.post("/create-payment-intent", paymentController.createPaymentIntent);

// Confirm a successful payment
router.post("/confirm-payment", paymentController.confirmPayment);

// Get payment details for a job
router.get("/details/:jobId", paymentController.getPaymentDetails);

// Get payment history for the current user
router.get("/history", paymentController.getPaymentHistory);

module.exports = router;
