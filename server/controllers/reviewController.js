const Review = require("../models/ReviewModel");
const Job = require("../models/JobModel");
const Worker = require("../models/WorkerModel");
const notificationController = require("./notificationController");

// Create a new review
exports.createReview = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("User:", req.user);
    const { jobId, rating, comment } = req.body;
    const clientId = req.user._id; // From auth middleware

    // Verify the job exists and is completed
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== "completed") {
      return res
        .status(400)
        .json({ message: "Can only review completed jobs" });
    }

    // Verify the client is the one who created the job
    if (job.client.toString() !== clientId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to review this job" });
    }

    // Check if review already exists for this job
    const existingReview = await Review.findOne({ job: jobId });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "Review already exists for this job" });
    }

    // Create the review
    const review = new Review({
      worker: job.worker,
      job: jobId,
      client: clientId,
      rating,
      comment,
      clientName: req.user.name, // Assuming user name is available from auth
    });

    await review.save();

    // Create notification for the worker
    const notificationMessage = `You received a ${rating}-star review from ${req.user.name} for job #${jobId}`;
    await notificationController.createNotification(
      job.worker,
      notificationMessage,
      "review",
      jobId
    );

    res.status(201).json({
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Failed to create review" });
    error: error.message;
  }
};

// Get reviews for a worker
exports.getWorkerReviews = async (req, res) => {
  try {
    const { workerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const reviews = await Review.find({ worker: workerId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("client", "name");

    const total = await Review.countDocuments({ worker: workerId });

    res.json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
      },
    });
  } catch (error) {
    console.error("Error fetching worker reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const clientId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Verify the client owns the review
    if (review.client.toString() !== clientId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this review" });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    res.json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Failed to update review" });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const clientId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Verify the client owns the review
    if (review.client.toString() !== clientId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this review" });
    }

    await review.remove();

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
};
