const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  recipient: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ["job_request", "job_update", "system"],
    default: "system"
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  jobId: { 
    type: Schema.Types.ObjectId, 
    ref: "Job"
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Notification", notificationSchema);