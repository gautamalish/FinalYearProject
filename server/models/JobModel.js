const mongoose = require("mongoose");
const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  serviceFee: Number,
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
  worker: { type: mongoose.Schema.Types.ObjectId, ref: "Worker" },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  completedAt: Date,
});

module.exports = mongoose.model("Job", jobSchema);
