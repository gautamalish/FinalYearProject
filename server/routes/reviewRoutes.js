const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

// Create a new review
router.post('/create', auth, reviewController.createReview);

// Get reviews for a worker
router.get('/worker/:workerId', reviewController.getWorkerReviews);

// Update a review
router.put('/:reviewId', auth, reviewController.updateReview);

// Delete a review
router.delete('/:reviewId', auth, reviewController.deleteReview);

module.exports = router;