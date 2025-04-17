const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateUser } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Create a new job request
router.post('/create', jobController.createJob);

// Get jobs for client
router.get('/client', jobController.getClientJobs);

// Get job details
router.get('/:jobId', jobController.getJobDetails);

// Update job status
router.patch('/:jobId/status', jobController.updateJobStatus);

module.exports = router;