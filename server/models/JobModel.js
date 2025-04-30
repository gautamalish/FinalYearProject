const mongoose = require("mongoose");
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  clientName: { type: String, required: true },
  clientPhone: { type: String, required: true },
  hourlyRate: { type: Number, required: true }, // Worker's rate at time of job creation
  duration: { type: Number }, // Duration in hours
  totalAmount: { type: Number }, // Calculated based on hourlyRate * duration
  serviceFee: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["pending", "accepted", "in_progress", "completed", "cancelled"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "refunded"],
    default: "pending",
  },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  completedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Job", jobSchema);
