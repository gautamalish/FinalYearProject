const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  worker: { type: Schema.Types.ObjectId, ref: "Worker", required: true },
  job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  client: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  clientName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Middleware to update worker's average rating after saving a review
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  const Worker = mongoose.model('Worker');
  
  // Calculate new average rating
  const stats = await Review.aggregate([
    { $match: { worker: this.worker } },
    { 
      $group: {
        _id: "$worker",
        averageRating: { $avg: "$rating" }
      }
    }
  ]);

  // Update worker's rating
  if (stats.length > 0) {
    await Worker.findByIdAndUpdate(this.worker, {
      rating: Math.round(stats[0].averageRating * 10) / 10 // Round to 1 decimal place
    });
  }
});

module.exports = mongoose.model("Review", reviewSchema);