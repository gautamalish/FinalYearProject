const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Create a new review
router.post('/create', reviewController.createReview);

// Get reviews for a worker
router.get('/worker/:workerId', reviewController.getWorkerReviews);

// Update a review
router.put('/:reviewId', reviewController.updateReview);

// Delete a review
router.delete('/:reviewId', reviewController.deleteReview);

module.exports = router;