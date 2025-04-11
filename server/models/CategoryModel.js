// models/CategoryModel.js
const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: false,
  },
  thumbnail: {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: false,
    },
  },
  viewCount: { type: Number, default: 0 },
  lastViewed: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
CategorySchema.methods.incrementViewCount = async function () {
  this.viewCount += 1;
  this.weeklyViewCount += 1;
  this.monthlyViewCount += 1;
  this.lastViewed = new Date();
  await this.save();
};

module.exports = mongoose.model("Category", CategorySchema);
