const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Job = require("../models/JobModel");
const Payment = require("../models/PaymentModel");
const User = require("../models/UserModel");
const Worker = require("../models/WorkerModel");

/**
 * Create a payment intent for Stripe checkout
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { jobId, amount, currency = "usd" } = req.body;
    const { firebaseUID } = req.user;

    // Validate request
    if (!jobId || !amount) {
      return res.status(400).json({ error: "Job ID and amount are required" });
    }

    // Find the job
    const job = await Job.findById(jobId)
      .populate("worker", "name")
      .populate("client", "firebaseUID");

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Verify the client is the one making the payment
    const client = await User.findOne({ firebaseUID });
    if (!client || job.client.firebaseUID !== firebaseUID) {
      return res.status(403).json({ error: "Unauthorized to make this payment" });
    }

    // Verify job is completed and payment is pending
    if (job.status !== "completed") {
      return res.status(400).json({ error: "Job must be completed before payment" });
    }

    if (job.paymentStatus !== "pending") {
      return res.status(400).json({ error: "Payment has already been processed" });
    }

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Stripe requires amount in cents
      currency,
      metadata: { 
        jobId: job._id.toString(),
        clientId: client._id.toString(),
        workerId: job.worker._id.toString()
      },
      description: `Payment for job: ${job.title}`
    });

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (err) {
    console.error("Error creating payment intent:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Confirm a successful payment and update job status
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, jobId } = req.body;
    const { firebaseUID } = req.user;

    // Validate request
    if (!paymentIntentId || !jobId) {
      return res.status(400).json({ error: "Payment intent ID and job ID are required" });
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (!paymentIntent) {
      return res.status(404).json({ error: "Payment intent not found" });
    }

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ error: `Payment not successful. Status: ${paymentIntent.status}` });
    }

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Verify the client is the one confirming the payment
    const client = await User.findOne({ firebaseUID });
    if (!client || job.client.toString() !== client._id.toString()) {
      return res.status(403).json({ error: "Unauthorized to confirm this payment" });
    }

    // Update job payment status
    job.paymentStatus = "paid";
    await job.save();

    // Create payment record
    const payment = new Payment({
      job: job._id,
      amount: paymentIntent.amount / 100, // Convert from cents
      transactionId: paymentIntent.id,
      status: "completed",
      paymentMethod: "stripe",
      client: client._id,
      worker: job.worker,
      metadata: paymentIntent.metadata
    });

    await payment.save();

    res.json({ 
      success: true, 
      message: "Payment confirmed successfully",
      payment: {
        id: payment._id,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.paymentDate
      }
    });
  } catch (err) {
    console.error("Error confirming payment:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get payment details for a job
 */
exports.getPaymentDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { firebaseUID } = req.user;

    // Find the job
    const job = await Job.findById(jobId)
      .populate("worker", "name hourlyRate")
      .populate("client", "firebaseUID name");

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Verify the user is either the client or worker
    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isClient = job.client._id.toString() === user._id.toString();
    const isWorker = job.worker._id.toString() === user._id.toString();

    if (!isClient && !isWorker) {
      return res.status(403).json({ error: "Unauthorized to view payment details" });
    }

    // Calculate payment details
    const amount = job.totalAmount || (job.hourlyRate * (job.duration || 1));
    const serviceFee = amount * 0.10; // 10% service fee
    const totalAmount = amount + serviceFee;

    res.json({
      jobId: job._id,
      title: job.title,
      workerName: job.worker.name,
      clientName: job.client.name,
      amount,
      serviceFee,
      totalAmount,
      paymentStatus: job.paymentStatus,
      currency: "usd"
    });
  } catch (err) {
    console.error("Error getting payment details:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get payment history for the current user
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    const user = await User.findOne({ firebaseUID });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let payments;
    if (user.role === "client") {
      payments = await Payment.find({ client: user._id })
        .populate("job", "title date time")
        .populate("worker", "name")
        .sort({ paymentDate: -1 });
    } else if (user.role === "worker") {
      payments = await Payment.find({ worker: user._id })
        .populate("job", "title date time")
        .populate("client", "name")
        .sort({ paymentDate: -1 });
    } else {
      return res.status(403).json({ error: "Unauthorized to view payment history" });
    }

    res.json(payments);
  } catch (err) {
    console.error("Error getting payment history:", err);
    res.status(500).json({ error: err.message });
  }
};
