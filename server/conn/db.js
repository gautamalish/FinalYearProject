const mongoose = require("mongoose");
const conn = mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Mongodb connected Successfully.");
});

module.exports = conn;
