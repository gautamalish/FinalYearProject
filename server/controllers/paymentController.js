const Payment = require('../models/PaymentModel');
const Job = require('../models/JobModel');
const User = require('../models/UserModel');
const Worker = require('../models/WorkerModel');
const { createNotification } = require('./notificationController');
const axios = require('axios');
require('dotenv').config();

// Khalti API configuration
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_VERIFY_URL = 'https://khalti.com/api/v2/payment/verify/';

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
    const { jobId, token, amount } = req.body;
    
    if (!jobId || !token || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
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
    
    // Verify payment with Khalti
    try {
      const response = await axios.post(
        KHALTI_VERIFY_URL,
        {
          token,
          amount
        },
        {
          headers: {
            'Authorization': `Key ${KHALTI_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // If verification is successful
      if (response.data && response.data.idx) {
        // Calculate service fee
        const serviceFee = Math.round(job.price * 0.1);
        
        // Create payment record
        const payment = new Payment({
          job: job._id,
          amount: job.price,
          serviceFee,
          transactionId: response.data.idx,
          khaltiToken: token,
          status: 'completed',
          client: job.client._id,
          worker: job.worker._id,
          metadata: response.data
        });
        
        await payment.save();
        
        // Update job payment status
        job.paymentStatus = 'paid';
        await job.save();
        
        // Create notification for the worker
        await createNotification(
          job.worker.user,
          `Payment received for job: ${job.title}`,
          'payment_received',
          job._id
        );
        
        return res.status(200).json({
          message: 'Payment successful',
          paymentId: payment._id,
          transactionId: response.data.idx
        });
      } else {
        return res.status(400).json({ message: 'Payment verification failed' });
      }
    } catch (error) {
      console.error('Khalti verification error:', error.response?.data || error.message);
      return res.status(400).json({ message: 'Payment verification failed', error: error.response?.data || error.message });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
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