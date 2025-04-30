const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const workerSchema = new Schema({
  firebaseUID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, default: "worker" },
  title: { type: String },
  bio: { type: String },
  phone: { type: String },
  profileImage: { type: String },
  nationality: { type: String },
  residence: { type: String },
  experience: { type: String },
  categories: [
    {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
  availability: {
    days: {
      monday: { type: Boolean, default: false },
      tuesday: { type: Boolean, default: false },
      wednesday: { type: Boolean, default: false },
      thursday: { type: Boolean, default: false },
      friday: { type: Boolean, default: false },
      saturday: { type: Boolean, default: false },
      sunday: { type: Boolean, default: false },
    },
    hours: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "17:00" },
    },
  },
  rating: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
  hourlyRate: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Worker", workerSchema);
