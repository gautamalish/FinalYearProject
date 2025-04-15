const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  firebaseUID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  jobsRequested: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Client", clientSchema);