const Payment = require('../models/PaymentModel');
const Job = require('../models/JobModel');
const User = require('../models/UserModel');
const Worker = require('../models/WorkerModel');
const { createNotification } = require('./notificationController');
const axios = require('axios');
require('dotenv').config();

// Khalti API configuration
const IS_SANDBOX = process.env.NODE_ENV === 'development';
const KHALTI_VERIFY_URL = "https://dev.khalti.com/api/v2/payment/verify/";

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
if (!KHALTI_SECRET_KEY) {
  throw new Error('Khalti secret key not configured');
}

// Initiate a payment for a completed job
exports.initiatePayment = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Find the job
    const job = await Job.findById(jobId)
      .populate('worker')
      .populate('client');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if the user is the client for this job
    const userId = req.user._id;
    
    if (job.client._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Only the client can make payment for this job' });
    }
    
    // Check if job is completed
    if (job.status !== 'completed') {
      return res.status(400).json({ message: 'Payment can only be made for completed jobs' });
    }
    
    // Check if payment is already made
    if (job.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Payment has already been made for this job' });
    }
    
    // Calculate service fee (10% of job price)
    const serviceFee = Math.round(job.price * 0.1);
    const totalAmount = job.price + serviceFee;
    
    // Return payment details to client
    res.status(200).json({
      jobId: job._id,
      amount: job.price,
      serviceFee,
      totalAmount,
      workerName: job.worker.name,
      clientName: job.clientName,
      jobTitle: job.title,
      jobDate: job.date,
      jobTime: job.time
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ message: 'Failed to initiate payment' });
  }
};

// Verify payment from Khalti
exports.verifyPayment = async (req, res) => {
  try {
    const { jobId, khaltiToken, amount } = req.body;
    
    // Validate input more thoroughly
    if (!jobId || !khaltiToken || !amount) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          jobId: !jobId ? 'Missing' : 'Provided',
          khaltiToken: !khaltiToken ? 'Missing' : 'Provided',
          amount: !amount ? 'Missing' : 'Provided'
        }
      });
    }

    const job = await Job.findById(jobId)
      .populate('worker')
      .populate('client');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Authorization check
    if (job.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Validate amount matches job price + fee
    const expectedAmount = Math.round(job.price * 1.1 * 100); // in paisa
    if (amount !== expectedAmount) {
      return res.status(400).json({ 
        message: 'Amount mismatch',
        details: {
          expected: expectedAmount,
          received: amount
        }
      });
    }

    // Verify with Khalti
    const response = await axios.post(
      KHALTI_VERIFY_URL,
      { token: khaltiToken, amount },
      {
        headers: {
          'Authorization': `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    // Check successful verification
    if (!response.data?.idx) {
      return res.status(400).json({ 
        message: 'Payment verification failed',
        khaltiResponse: response.data
      });
    }

    // Create payment record
    const serviceFee = Math.round(job.price * 0.1);
    const payment = new Payment({
      job: job._id,
      amount: job.price,
      serviceFee,
      transactionId: response.data.idx,
      khaltiToken,
      status: 'completed',
      client: job.client._id,
      worker: job.worker._id,
      metadata: response.data,
      paymentMethod: 'khalti',
      paymentGateway: IS_SANDBOX ? 'khalti-sandbox' : 'khalti'
    });

    await payment.save();
    
    // Update job status in a transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      job.paymentStatus = 'paid';
      await job.save({ session });
      
      // Add funds to worker's account if applicable
      await Worker.findByIdAndUpdate(
        job.worker._id,
        { $inc: { earnings: job.price } },
        { session }
      );
      
      await session.commitTransaction();
      
      // Create notifications
      await createNotification(
        job.worker.user,
        `Payment of Rs.${job.price} received for job: ${job.title}`,
        'payment_received',
        job._id
      );
      
      await createNotification(
        job.client._id,
        `Payment of Rs.${job.price} processed for job: ${job.title}`,
        'payment_made',
        job._id
      );
      
      return res.status(200).json({
        message: 'Payment successful',
        paymentId: payment._id,
        transactionId: response.data.idx,
        amount: job.price
      });
      
    } catch (transactionError) {
      await session.abortTransaction();
      throw transactionError;
    } finally {
      session.endSession();
    }
    
  } catch (error) {
    console.error('Payment verification error:', error);
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data 
      ? `Khalti error: ${JSON.stringify(error.response.data)}`
      : error.message;
    
    res.status(statusCode).json({ 
      message: 'Payment processing failed',
      error: errorMessage
    });
  }
};

// Get payment history for a user
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find payments where user is either client or worker
    const payments = await Payment.find({
      $or: [
        { client: userId },
        { worker: userId }
      ]
    })
    .populate({
      path: 'job',
      populate: [
        { path: 'worker' },
        { path: 'client' }
      ]
    })
    .sort({ paymentDate: -1 });
    
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Failed to fetch payment history' });
  }
};

// Get payment details
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findById(paymentId)
      .populate({
        path: 'job',
        populate: [
          { path: 'worker' },
          { path: 'client' }
        ]
      });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check if the user is authorized to view this payment
    const userId = req.user._id;
    
    if (payment.client.toString() !== userId.toString() && 
        payment.job.worker.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You do not have permission to view this payment' });
    }
    
    res.status(200).json(payment);
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ message: 'Failed to fetch payment details' });
  }
};