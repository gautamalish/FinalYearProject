const Category = require("../models/CategoryModel");
const mongoose = require("mongoose");
const cron = require("node-cron");

// Reset weekly view counts every Sunday at midnight
cron.schedule("0 0 * * 0", async () => {
  try {
    console.log("Resetting weekly view counts...");
    await Category.updateMany(
      { viewCount: { $gt: 0 } },
      { $set: { weeklyViewCount: 0 } }
    );
    console.log("Weekly view counts reset completed");
  } catch (error) {
    console.error("Error resetting view counts:", error);
  }
});

// Reset monthly view counts on the 1st of each month
cron.schedule("0 0 1 * *", async () => {
  try {
    console.log("Resetting monthly view counts...");
    await Category.updateMany(
      { viewCount: { $gt: 0 } },
      { $set: { monthlyViewCount: 0 } }
    );
    console.log("Monthly view counts reset completed");
  } catch (error) {
    console.error("Error resetting view counts:", error);
  }
});
