const Job = require('../models/JobModel');
const User = require('../models/UserModel');
const Worker = require('../models/WorkerModel');
const { createNotification } = require('./notificationController');

// Create a new job request
exports.createJob = async (req, res) => {
  try {
    const { 
      workerId, 
      clientName, 
      clientPhone, 
      location, 
      date, 
      time, 
      description 
    } = req.body;
    
    // Validate required fields
    const requiredFields = ['workerId', 'clientName', 'clientPhone', 'location', 'date', 'time', 'description'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        missingFields 
      });
    }

    // Ensure authenticated user exists
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get client ID from authenticated user
    const clientId = req.user._id;

    // Find the worker
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Create the job
    const job = new Job({
      title: `Service request from ${clientName}`,
      description,
      status: 'pending',
      paymentStatus: 'pending',
      worker: workerId,
      client: clientId,
      location,
      date,
      time,
      clientName,
      clientPhone
    });

    // Validate the job object against schema
    const validationError = job.validateSync();
    if (validationError) {
      return res.status(400).json({ 
        message: 'Invalid job data', 
        errors: validationError.errors 
      });
    }

    await job.save();

    // Find the user associated with this worker to send notification
    const workerUser = await User.findOne({ firebaseUID: worker.firebaseUID });
    
    if (workerUser) {
      // Create a notification for the worker
      await createNotification(
        workerUser._id,
        `You have a new job request from ${clientName} for ${date} at ${time}`,
        'job_request',
        job._id
      );
    }

    res.status(201).json({ 
      message: 'Job request created successfully', 
      jobId: job._id 
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Failed to create job request' });
  }
};

// Get job details
exports.getJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findById(jobId)
      .populate('worker')
      .populate('client');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if the user is authorized to view this job
    const userId = req.user._id;
    const workerUser = await User.findOne({ firebaseUID: job.worker.firebaseUID });
    
    // Compare MongoDB ObjectIds directly
    const isClient = job.client.equals(userId);
    const isWorker = workerUser && workerUser._id.equals(userId);
    
    if (!isClient && !isWorker) {
      return res.status(403).json({ message: 'Unauthorized: Only the client or assigned worker can view this job' });
    }
    
    res.status(200).json(job);
  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({ message: 'Failed to fetch job details' });
  }
};

// Get jobs for client
exports.getClientJobs = async (req, res) => {
  try {
    const clientId = req.user._id;
    
    const jobs = await Job.find({ client: clientId })
      .populate('worker')
      .sort({ createdAt: -1 });
    
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching client jobs:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
};

// Update job status
exports.updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;
    
    if (!['accepted', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const job = await Job.findById(jobId)
      .populate('worker')
      .populate('client');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if the user is the worker for this job
    const userId = req.user._id;
    const workerUser = await User.findOne({ firebaseUID: job.worker.firebaseUID });
    
    if (workerUser._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Update job status
    job.status = status;
    if (status === 'completed') {
      job.completedAt = new Date();
    }
    
    await job.save();
    
    // Create notification for the client
    let notificationMessage;
    switch (status) {
      case 'accepted':
        notificationMessage = `Your job request has been accepted by ${job.worker.name}`;
        break;
      case 'in_progress':
        notificationMessage = `Your job is now in progress with ${job.worker.name}`;
        break;
      case 'completed':
        notificationMessage = `Your job has been completed by ${job.worker.name}`;
        break;
      case 'cancelled':
        notificationMessage = `Your job request has been cancelled by ${job.worker.name}`;
        break;
    }
    
    await createNotification(
      job.client,
      notificationMessage,
      'job_update',
      job._id
    );
    
    res.status(200).json({ message: 'Job status updated successfully' });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ message: 'Failed to update job status' });
  }
};