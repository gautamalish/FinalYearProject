// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firebaseUID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ["client", "worker", "admin"],
    default: "client",
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
  rating: {
    type: Number,
    default: 0,
  },
  hourlyRate: {
    type: Number,
    min: 0,
  },
  profilePicture: String,
  residence: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
